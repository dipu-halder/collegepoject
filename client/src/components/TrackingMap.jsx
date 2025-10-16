// src/components/TrackingMap.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  Polyline,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { createSocket } from "../utils/socket";
import apiFetch from "../utils/apiFetch";

const containerStyle = { width: "100%", height: "70vh" };

export default function TrackingMap({ mode = "customer", orderId, token }) {
  const [riderProfile, setRiderProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [riderLocation, setRiderLocation] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRiderInfo, setShowRiderInfo] = useState(true);
  const [followRider, setFollowRider] = useState(true);

  const socketRef = useRef(null);
  const mapRef = useRef(null);
  const lastPanRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  /** 🔹 Fetch rider profile (for dashboard) */
  const fetchRiderProfile = useCallback(async () => {
    if (mode !== "rider") return null;
    try {
      const data = await apiFetch("/api/rider/me", { method: "GET" });
      setRiderProfile(data);
      return data;
    } catch (err) {
      console.error("fetchRiderProfile error:", err);
      setRiderProfile(null);
      return null;
    }
  }, [mode]);

  /** 🔹 Fetch orders (customer: 1, rider: many) */
  const fetchOrders = useCallback(async () => {
    try {
      if (mode === "customer" && orderId) {
        const data = await apiFetch(`/api/orders/${orderId}`, { method: "GET" });
        setOrders(data ? [data] : []);
      } else if (mode === "rider") {
        const data = await apiFetch("/api/rider/orders", { method: "GET" });
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("fetchOrders error:", err);
      setOrders([]);
    }
  }, [mode, orderId]);

  useEffect(() => {
    (async () => {
      await fetchOrders();
      if (mode === "rider") await fetchRiderProfile();
    })();
  }, [fetchOrders, fetchRiderProfile, mode]);

  /** 🔹 Extract delivery lat/lng from order object */
  const orderLatLng = (o) => {
    if (!o) return null;
    if (o.customerLat && o.customerLng)
      return { lat: +o.customerLat, lng: +o.customerLng };
    if (o.customerLocation?.lat && o.customerLocation?.lng)
      return { lat: +o.customerLocation.lat, lng: +o.customerLocation.lng };
    if (o.deliveryAddress?.lat && o.deliveryAddress?.lng)
      return { lat: +o.deliveryAddress.lat, lng: +o.deliveryAddress.lng };
    if (Array.isArray(o.deliveryAddress?.coordinates)) {
      const [lng, lat] = o.deliveryAddress.coordinates;
      return { lat: +lat, lng: +lng };
    }
    return null;
  };

  /** 🔹 Fit bounds to rider + orders */
  const fitBoundsToMarkers = useCallback(() => {
    if (!mapRef.current) return;
    const maps = window.google?.maps;
    if (!maps) return;

    const bounds = new maps.LatLngBounds();
    let added = 0;

    if (riderLocation?.lat && riderLocation?.lng) {
      bounds.extend(new maps.LatLng(riderLocation.lat, riderLocation.lng));
      added++;
    }

    orders.forEach((o) => {
      const loc = orderLatLng(o);
      if (loc) {
        bounds.extend(new maps.LatLng(loc.lat, loc.lng));
        added++;
      }
    });

    if (added > 0) {
      try {
        mapRef.current.fitBounds(bounds, 50);
      } catch {
        if (riderLocation) mapRef.current.setCenter(riderLocation);
      }
    }
  }, [orders, riderLocation]);

  /** 🔹 Socket setup */
  useEffect(() => {
    if (!token) return;
    if (socketRef.current) return;

    const socket = createSocket(token);
    socketRef.current = socket;

    socket.on("connect", async () => {
      if (mode === "rider") {
        const rp = riderProfile || (await fetchRiderProfile());
        const rid = rp?._id || rp?.id;
        if (rid) socket.emit("joinRider", rid);
      } else if (mode === "customer" && orderId) {
        socket.emit("joinOrder", orderId);
      }
    });

    /** Rider live location */
    socket.on("rider.location", (payload) => {
      if (!payload?.lat || !payload?.lng) return;
      const loc = { lat: +payload.lat, lng: +payload.lng };
      setRiderLocation(loc);

      if (followRider && mapRef.current) {
        const last = lastPanRef.current;
        const PAN_THRESHOLD_METERS = 10;
        try {
          if (!last) {
            mapRef.current.panTo(loc);
            lastPanRef.current = loc;
          } else {
            // haversine
            const R = 6371e3;
            const toRad = (v) => (v * Math.PI) / 180;
            const φ1 = toRad(last.lat),
              φ2 = toRad(loc.lat);
            const Δφ = toRad(loc.lat - last.lat),
              Δλ = toRad(loc.lng - last.lng);
            const a =
              Math.sin(Δφ / 2) ** 2 +
              Math.cos(φ1) *
                Math.cos(φ2) *
                Math.sin(Δλ / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const meters = R * c;
            if (meters > PAN_THRESHOLD_METERS) {
              mapRef.current.panTo(loc);
              lastPanRef.current = loc;
            }
          }
        } catch {
          mapRef.current.setCenter(loc);
          lastPanRef.current = loc;
        }
      }
    });

    const orderEvents = [
      "order.offer",
      "assigned.order",
      "order.assigned",
      "order.unassigned",
      "order.status.updated",
      "order.delivered",
    ];
    orderEvents.forEach((ev) =>
      socket.on(ev, () => setTimeout(fetchOrders, 300))
    );

    return () => {
      orderEvents.forEach((ev) => socket.off(ev));
      socket.off("rider.location");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, mode, orderId, riderProfile, fetchRiderProfile, fetchOrders, followRider]);

  useEffect(() => {
    fitBoundsToMarkers();
  }, [orders, riderLocation, fitBoundsToMarkers]);

  if (!isLoaded) return <div style={{ padding: 12 }}>⏳ Loading map...</div>;

  /** Rider sees only assigned orders */
  const myAssigned =
    mode === "rider"
      ? orders.filter((o) => {
          const assigned = o.assignedRider;
          const riderId = riderProfile?._id || riderProfile?.id;
          return assigned && String(assigned._id || assigned) === String(riderId);
        })
      : orders;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      onLoad={(map) => {
        mapRef.current = map;
        fitBoundsToMarkers();
      }}
      center={riderLocation || { lat: 22.5726, lng: 88.3639 }}
      zoom={13}
    >
      {/* Rider marker */}
      {riderLocation && (
        <Marker
          position={riderLocation}
          label="R"
          icon={{
            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          }}
          onClick={() => setShowRiderInfo((s) => !s)}
        />
      )}
      {riderLocation && showRiderInfo && (
        <InfoWindow
          position={riderLocation}
          onCloseClick={() => setShowRiderInfo(false)}
        >
          <div>
            <strong>{riderProfile?.name || "Rider"}</strong>
          </div>
        </InfoWindow>
      )}

      {/* Orders */}
      {myAssigned.map((o) => {
        const loc = orderLatLng(o);
        if (!loc) return null;
        return (
          <React.Fragment key={o._id}>
            <Marker
              position={loc}
              label="D"
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
              }}
              onClick={() => setSelectedOrder(o)}
            />
            {riderLocation && (
              <Polyline
                path={[riderLocation, loc]}
                options={{ strokeWeight: 3, geodesic: true }}
              />
            )}
          </React.Fragment>
        );
      })}
    </GoogleMap>
  );
}
