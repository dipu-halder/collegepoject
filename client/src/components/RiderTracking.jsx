// src/components/RiderTracking.jsx
import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { createSocket } from "../utils/socket";
import apiFetch from "../utils/apiFetch";
import { useAuth } from "../store/auth";

const containerStyle = { width: "100%", height: "400px" };

export default function RiderTracking({ initialRiderId } = {}) {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY });
  const { token, authorizationToken } = useAuth();
  const rawToken = authorizationToken || token || localStorage.getItem("token") || "";

  const [riderId, setRiderId] = useState(initialRiderId || null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastEmitRef = useRef(0);

  useEffect(() => {
    (async () => {
      if (!riderId) {
        try {
          const profile = await apiFetch("/api/rider/me", { method: "GET" }).catch(()=>null);
          if (profile && (profile._id || profile.id)) setRiderId(profile._id || profile.id);
        } catch (e) { console.warn(e); }
      }
      try {
        const orders = await apiFetch("/api/rider/orders", { method: "GET" }).catch(()=>[]);
        if (Array.isArray(orders)) setAssignedOrders(orders);
      } catch (e) { console.warn(e); }
    })();
  }, [riderId]);

  // create socket once
  useEffect(() => {
    if (!rawToken) { setErrorMsg("Login required"); return; }
    if (socketRef.current) return;
    const socket = createSocket(rawToken);
    socketRef.current = socket;

    socket.on("connect", () => {
      if (riderId) socket.emit("joinRider", riderId);
    });

    socket.on("rider.location", (payload) => {
      if (!payload) return;
      if (payload.riderId && riderId && String(payload.riderId) !== String(riderId)) return;
      if (payload.lat != null && payload.lng != null) {
        setRiderLocation({ lat: Number(payload.lat), lng: Number(payload.lng) });
      }
    });

    socket.on("connect_error", (err) => setErrorMsg(err?.message || "Socket error"));

    return () => { try { socket.disconnect(); } catch (e) {} socketRef.current = null; };
  }, [rawToken, riderId]);

  useEffect(() => { if (socketRef.current && riderId) { try { socketRef.current.emit("joinRider", riderId); } catch (e) {} } }, [riderId]);

  const emitLocation = (lat, lng, heading=0, speed=0) => {
    const now = Date.now();
    if (now - lastEmitRef.current < 800) return;
    lastEmitRef.current = now;
    const payload = { riderId, lat: Number(lat), lng: Number(lng), heading: Number(heading)||0, speed: Number(speed)||0, ts: Date.now() };
    try { socketRef.current?.emit("rider:updateLocation", payload); setRiderLocation({ lat: Number(lat), lng: Number(lng) }); } catch (e) { console.warn(e); }
  };

  const startSharing = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported"); return; }
    if (!socketRef.current) { alert("Socket not connected"); return; }
    if (!riderId) { alert("Rider ID not known yet"); return; }

    navigator.geolocation.getCurrentPosition(
      (p) => emitLocation(p.coords.latitude, p.coords.longitude, p.coords.heading, p.coords.speed),
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );

    const id = navigator.geolocation.watchPosition(
      (pos) => emitLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.heading, pos.coords.speed),
      (err) => { console.error(err); alert("Geolocation error: "+(err.message||err.code)); },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
    watchIdRef.current = id;
    setSharing(true);
  };

  const stopSharing = () => {
    if (watchIdRef.current != null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
    setSharing(false);
  };

  const refreshAssigned = async () => {
    try { const orders = await apiFetch("/api/rider/orders", { method: "GET" }).catch(()=>[]); if (Array.isArray(orders)) setAssignedOrders(orders); } catch(e){console.warn(e);}
  };

  if (!isLoaded) return <div style={{ padding: 12 }}>Loading map...</div>;

  return (
    <div style={{ padding: 12 }}>
      <h2>Rider Live Sharing</h2>
      <div><strong>Rider ID:</strong> {riderId || "—"}</div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        {!sharing ? <button onClick={startSharing}>▶️ Start Sharing Location</button> :
                    <button onClick={stopSharing}>⛔ Stop Sharing</button>}
        <button onClick={refreshAssigned}>🔄 Refresh Orders</button>
        <div style={{ alignSelf: "center", marginLeft: 8 }}>{sharing ? <small style={{color:"green"}}>Sharing</small> : <small>Not sharing</small>}</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Assigned Orders ({assignedOrders.length})</strong>
        <div style={{ marginTop: 8 }}>
          {assignedOrders.length === 0 ? <div style={{ color: "#666" }}>No assigned orders</div> :
            assignedOrders.map(o => (
              <div key={o._id} style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                <div><strong>#{String(o._id).slice(0,8)}</strong> — {o.status}</div>
                <div style={{ fontSize: 13 }}>{o.customerName} — {o.customerPhone}</div>
              </div>
            ))
          }
        </div>
      </div>

      <div style={{ height: 400, marginTop: 12, borderRadius: 8, overflow: "hidden", background: "#eee" }}>
        <GoogleMap mapContainerStyle={containerStyle} center={riderLocation || {lat:22.5726,lng:88.3639}} zoom={riderLocation?15:6}>
          {riderLocation && <Marker position={riderLocation} label="You" />}
        </GoogleMap>
      </div>

      {errorMsg && <div style={{ color: "crimson", marginTop: 8 }}>{errorMsg}</div>}
    </div>
  );
}
