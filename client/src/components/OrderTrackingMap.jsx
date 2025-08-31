// src/components/OrderTrackingMap.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { GoogleMap, Marker, useJsApiLoader, Polyline } from "@react-google-maps/api";
import createSocket from "../utils/socket";
import apiFetch from "../utils/apiFetch";

const containerStyle = { width: "100%", height: "480px" };

function haversineDistanceMeters(a, b) {
  if (!a || !b) return null;
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371e3;
  const φ1 = toRad(a.lat), φ2 = toRad(b.lat);
  const Δφ = toRad(b.lat - a.lat), Δλ = toRad(b.lng - a.lng);
  const s1 = Math.sin(Δφ/2), s2 = Math.sin(Δλ/2);
  const aa = s1*s1 + Math.cos(φ1)*Math.cos(φ2)*s2*s2;
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1-aa));
  return R * c;
}

export default function OrderTrackingMap({ orderId: propOrderId, token: propToken } = {}) {
  const params = useParams();
  const orderId = propOrderId || params.orderId;
  const [order, setOrder] = useState(null);
  const [orderLocation, setOrderLocation] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [status, setStatus] = useState(null);
  const [socketErrorMsg, setSocketErrorMsg] = useState(null);
  const [followRider, setFollowRider] = useState(true);
  const socketRef = useRef(null);
  const mapRef = useRef(null);
  const lastPanRef = useRef(null);

  const token = propToken || localStorage.getItem("token") || null;
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY });

  const extractLatLng = (data) => {
    if (!data) return null;
    if (data.customerLat != null && data.customerLng != null) return { lat: Number(data.customerLat), lng: Number(data.customerLng) };
    if (data.customerLocation?.lat != null && data.customerLocation?.lng != null) return { lat: Number(data.customerLocation.lat), lng: Number(data.customerLocation.lng) };
    if (data.deliveryAddress?.lat != null && data.deliveryAddress?.lng != null) return { lat: Number(data.deliveryAddress.lat), lng: Number(data.deliveryAddress.lng) };
    if (data.deliveryAddress?.coordinates && Array.isArray(data.deliveryAddress.coordinates)) {
      const [lng, lat] = data.deliveryAddress.coordinates; return { lat: Number(lat), lng: Number(lng) };
    }
    if (data.location?.lat != null && data.location?.lng != null) return { lat: Number(data.location.lat), lng: Number(data.location.lng) };
    return null;
  };

  async function fetchOrder() {
    if (!orderId) return;
    try {
      const data = await apiFetch(`/api/order/${orderId}`, { method: "GET" });
      setOrder(data);
      setStatus(data?.status ?? null);
      const loc = extractLatLng(data);
      if (loc) setOrderLocation(loc);
      return data;
    } catch (err) {
      console.error("fetchOrder error:", err);
      return null;
    }
  }

  useEffect(() => { fetchOrder(); }, [orderId]);

  const panToRider = (loc) => {
    if (!mapRef.current || !loc) return;
    try {
      const last = lastPanRef.current;
      const dist = last ? haversineDistanceMeters(last, loc) : Infinity;
      const PAN_THRESHOLD_METERS = 10;
      if (dist > PAN_THRESHOLD_METERS) {
        mapRef.current.panTo(loc);
        lastPanRef.current = loc;
      }
    } catch (e) {
      try { mapRef.current.setCenter(loc); } catch (err) {}
    }
  };

  useEffect(() => {
    if (!orderId || !order?.assignedRider) {
      if (socketRef.current) { try { socketRef.current.disconnect(); } catch (e) {} socketRef.current = null; }
      return;
    }

    setSocketErrorMsg(null);
    const socket = createSocket(token);
    socketRef.current = socket;

    socket.on("connect", () => {
      try {
        socket.emit("joinOrder", orderId);
        console.log("[socket] joined order room:", orderId);
      } catch (e) {}
    });

    socket.on("connect_error", (err) => {
      console.warn("socket connect_error:", err?.message || err);
      setSocketErrorMsg(err?.message || "Socket error");
    });

    const assignedRid = order?.assignedRider?._id || order?.assignedRider;

    const onLocation = (payload) => {
      if (!payload) return;
      if (payload.riderId && String(payload.riderId) !== String(assignedRid)) return;
      if (payload.orderId && String(payload.orderId) !== String(orderId)) return;
      const lat = payload.lat ?? payload.location?.lat ?? payload.latitude;
      const lng = payload.lng ?? payload.location?.lng ?? payload.longitude;
      if (lat != null && lng != null) {
        const newLoc = { lat: Number(lat), lng: Number(lng) };
        setRiderLocation(newLoc);
        if (followRider) panToRider(newLoc);
      }
    };

    const onStatus = (payload) => {
      if (!payload) return;
      if (payload.orderId && String(payload.orderId) !== String(orderId)) return;
      const newStatus = payload.status || payload?.order?.status;
      if (newStatus) {
        setStatus(newStatus);
        if (String(newStatus).toLowerCase() === "delivered") {
          try { socket.disconnect(); } catch (e) {}
          socketRef.current = null;
        }
      }
    };

    socket.on("order.riderLocation", onLocation);
    socket.on("rider.location", onLocation);
    socket.on("order.location", onLocation);
    socket.on("tracking.location", onLocation);
    socket.on("riderLocation", onLocation);

    socket.on("order.status.updated", onStatus);
    socket.on("order.status", onStatus);
    socket.on("tracking.status", onStatus);

    return () => {
      try {
        socket.off("order.riderLocation", onLocation);
        socket.off("rider.location", onLocation);
        socket.off("order.location", onLocation);
        socket.off("tracking.location", onLocation);
        socket.off("riderLocation", onLocation);
        socket.off("order.status.updated", onStatus);
        socket.off("order.status", onStatus);
        socket.off("tracking.status", onStatus);
        socket.off("connect_error");
        socket.off("error");
        socket.disconnect();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, orderId, token, followRider]);

  useEffect(() => {
    if (followRider && riderLocation) panToRider(riderLocation);
  }, [riderLocation, followRider]);

  const center = riderLocation || orderLocation || { lat: 22.5726, lng: 88.3639 };

  if (!isLoaded) return <div style={{ padding: 12 }}>⏳ Loading map...</div>;

  return (
    <div style={{ padding: 12 }}>
      <h3>Order: <strong>{orderId || "—"}</strong></h3>
      <p>Status: <strong>{status || "—"}</strong></p>

      {socketErrorMsg && (
        <div style={{ padding: 8, background: "#fff2f0", border: "1px solid #ffcccc", marginBottom: 8 }}>
          ⚠️ Real-time tracking unavailable: <strong>{socketErrorMsg}</strong>
        </div>
      )}

      <div style={{ marginBottom: 8, display: "flex", gap: 8 }}>
        <button onClick={() => { if (mapRef.current && riderLocation) { mapRef.current.panTo(riderLocation); mapRef.current.setZoom(14); } }}>
          Center on Rider
        </button>
        <button onClick={() => setFollowRider(f => !f)}>
          {followRider ? "Stop Following" : "Follow Rider"}
        </button>
      </div>

      <div style={{ width: "100%", height: 480, borderRadius: 8, overflow: "hidden", background: "#eee" }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={14}
          onLoad={(map) => { mapRef.current = map; }}
        >
          {riderLocation && (
            <Marker position={riderLocation} label="R" icon={{ url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" }} />
          )}

          {orderLocation && (
            <Marker position={orderLocation} label="D" icon={{ url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png" }} />
          )}

          {riderLocation && orderLocation && (
            <Polyline path={[riderLocation, orderLocation]} options={{ strokeWeight: 4, geodesic: true }} />
          )}
        </GoogleMap>
      </div>

      {order && (
        <div style={{ marginTop: 12 }}>
          <h4>Order details</h4>
          <div><strong>Customer:</strong> {order.customerName || order.user?.name || "—"}</div>
          <div><strong>Phone:</strong> {order.customerPhone || order.user?.mobile || "—"}</div>
          <div><strong>Address:</strong> {order.customerAddress || "—"}</div>
        </div>
      )}
    </div>
  );
}
