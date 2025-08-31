// src/components/RiderTracking.jsx
import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import createSocket from "../utils/socket";
import apiFetch from "../utils/apiFetch";

const containerStyle = { width: "100%", height: "400px" };

export default function RiderTracking({ initialRiderId } = {}) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [sharing, setSharing] = useState(false);
  const [riderLocation, setRiderLocation] = useState(null);
  const [riderId, setRiderId] = useState(initialRiderId || null);
  const watchIdRef = useRef(null);
  const socketRef = useRef(null);

  // token raw or "Bearer <token>"
  const rawToken = localStorage.getItem("token") || "";

  // try to fetch rider profile to get riderId if not provided
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!riderId) {
        try {
          const data = await apiFetch("/api/rider/me", { method: "GET" }).catch(() => null);
          if (mounted && data && (data._id || data.id)) {
            setRiderId(data._id || data.id);
            console.log("RiderTracking: got riderId from /api/rider/me", data._id || data.id);
          }
        } catch (e) {
          console.warn("Failed to fetch rider profile:", e);
        }
      }
    })();
    return () => { mounted = false; };
  }, [riderId]);

  // socket connection and join rider room
  useEffect(() => {
    if (!rawToken) {
      console.warn("No token in localStorage; rider socket not created.");
      return;
    }
    const socket = createSocket(rawToken);
    socketRef.current = socket;

    socket.on("connect", () => {
      const rid = riderId || initialRiderId;
      console.log("[socket] connected for riderTracking", socket.id, "joining rider:", rid);
      if (rid) {
        try { socket.emit("joinRider", rid); } catch (e) { console.warn(e); }
      }
    });

    // server might echo rider.location events back (useful for verification)
    socket.on("rider.location", (payload) => {
      if (payload && payload.riderId && String(payload.riderId) === String(riderId)) {
        setRiderLocation({ lat: Number(payload.lat), lng: Number(payload.lng) });
      }
    });

    socket.on("connect_error", (err) => {
      console.warn("socket connect_error:", err?.message || err);
    });

    return () => {
      try { socket.disconnect(); } catch (e) {}
      socketRef.current = null;
    };
  }, [rawToken, riderId, initialRiderId]);

  // start watching geolocation and emit to server
  const startSharing = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by this browser.");
      return;
    }
    if (!socketRef.current) {
      alert("Socket not connected. Make sure you're logged in.");
      return;
    }
    if (!riderId) {
      alert("Rider ID unknown. Make sure your rider profile exists.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setRiderLocation(coords);

        // emit event expected by backend
        try {
          console.log("emit rider:updateLocation", { riderId, lat: coords.lat, lng: coords.lng });
          socketRef.current.emit("rider:updateLocation", {
            riderId,
            lat: coords.lat,
            lng: coords.lng,
            heading: pos.coords.heading ?? 0,
            speed: pos.coords.speed ?? 0,
            ts: Date.now(),
          });
        } catch (e) {
          console.warn("emit failed:", e);
        }
      },
      (err) => {
        console.error("geolocation watchPosition error:", err);
        alert("Geolocation error: " + (err.message || err.code));
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    watchIdRef.current = watchId;
    setSharing(true);
  };

  const stopSharing = () => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSharing(false);
  };

  if (!isLoaded) return <div style={{ padding: 12 }}>Loading map...</div>;

  return (
    <div style={{ padding: 12 }}>
      <h2>Rider Live Sharing</h2>
      <div style={{ marginBottom: 12 }}>
        <strong>Rider ID:</strong> {riderId || "—"}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {!sharing ? (
          <button onClick={startSharing}>▶️ Start Sharing Location</button>
        ) : (
          <button onClick={stopSharing}>⛔ Stop Sharing</button>
        )}
      </div>

      <div style={{ height: 400, borderRadius: 8, overflow: "hidden", background: "#eee" }}>
        <GoogleMap mapContainerStyle={containerStyle} center={riderLocation || { lat: 22.5726, lng: 88.3639 }} zoom={riderLocation ? 15 : 6}>
          {riderLocation && <Marker position={riderLocation} label="You" />}
        </GoogleMap>
      </div>
    </div>
  );
}
