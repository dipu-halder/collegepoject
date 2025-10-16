// src/pages/RiderMapDashboard.jsx
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
import { useAuth } from "../store/auth";
import { Link } from "react-router-dom";

const containerStyle = { width: "100%", height: "70vh" };

export default function RiderMapDashboard() {
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

  const { token, authorizationToken } = useAuth();
  const socketToken =
    authorizationToken || token || localStorage.getItem("token") || null;

  /** 🔹 Fetch rider profile */
  const fetchRiderProfile = useCallback(async () => {
    try {
      const data = await apiFetch("/api/rider/me", { method: "GET" });
      setRiderProfile(data);
      return data;
    } catch (err) {
      console.error("fetchRiderProfile error:", err);
      setRiderProfile(null);
      return null;
    }
  }, []);

  /** 🔹 Fetch rider’s assigned orders */
  const fetchOrders = useCallback(async () => {
    try {
      const data = await apiFetch("/api/rider/orders", { method: "GET" });
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchOrders error:", err);
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchRiderProfile();
      await fetchOrders();
    })();
  }, [fetchOrders, fetchRiderProfile]);

  /** 🔹 Extract delivery lat/lng from order object */
  const orderLatLng = (o) => {
    if (!o) return null;
    if (o.customerLat != null && o.customerLng != null)
      return { lat: +o.customerLat, lng: +o.customerLng };
    if (o.customerLocation?.lat && o.customerLocation?.lng)
      return { lat: +o.customerLocation.lat, lng: +o.customerLocation.lng };
    if (o.deliveryAddress?.lat && o.deliveryAddress?.lng)
      return { lat: +o.deliveryAddress.lat, lng: +o.deliveryAddress.lng };
    if (
      o.deliveryAddress?.coordinates &&
      Array.isArray(o.deliveryAddress.coordinates)
    ) {
      const [lng, lat] = o.deliveryAddress.coordinates;
      return { lat: +lat, lng: +lng };
    }
    return null;
  };

  /** 🔹 Fit map view to rider + orders */
  const fitBoundsToMarkers = useCallback(() => {
    if (!mapRef.current) return;
    const maps = window.google && window.google.maps;
    if (!maps) return;

    const bounds = new maps.LatLngBounds();
    let added = 0;

    if (riderLocation?.lat != null && riderLocation?.lng != null) {
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

  /** 🔹 Setup WebSocket */
  useEffect(() => {
    if (!socketToken) {
      console.warn("No token — rider map requires login.");
      return;
    }
    if (socketRef.current) return; // already connected

    const socket = createSocket(socketToken);
    socketRef.current = socket;

    socket.on("connect", async () => {
      try {
        let rp = riderProfile || (await fetchRiderProfile());
        const rid = rp?._id || rp?.id;
        if (rid) socket.emit("joinRider", rid); // join rider room
      } catch (e) {
        console.warn("socket join error:", e);
      }
    });

    /** Rider live location */
    socket.on("rider.location", (payload) => {
      if (!payload?.lat || !payload?.lng) return;
      const loc = { lat: +payload.lat, lng: +payload.lng };
      setRiderLocation(loc);

      if (followRider) {
        const last = lastPanRef.current;
        const PAN_THRESHOLD_METERS = 10;
        try {
          if (!last) {
            mapRef.current?.panTo(loc);
            lastPanRef.current = loc;
          } else {
            // haversine formula
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
              mapRef.current?.panTo(loc);
              lastPanRef.current = loc;
            }
          }
        } catch {
          mapRef.current?.setCenter(loc);
          lastPanRef.current = loc;
        }
      }
    });

    /** Order events to refresh */
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

    socket.on("connect_error", (err) =>
      console.warn("Socket connect_error:", err?.message || err)
    );
    socket.on("disconnect", (reason) =>
      console.log("Socket disconnected:", reason)
    );

    return () => {
      try {
        orderEvents.forEach((ev) => socket.off(ev));
        socket.off("rider.location");
        socket.disconnect();
      } catch {}
      socketRef.current = null;
    };
  }, [socketToken, riderProfile, fetchRiderProfile, fetchOrders, followRider]);

  useEffect(() => {
    fitBoundsToMarkers();
  }, [orders, riderLocation, fitBoundsToMarkers]);

  const onMapLoad = (map) => {
    mapRef.current = map;
    fitBoundsToMarkers();
  };

  if (!isLoaded) return <div style={{ padding: 12 }}>⏳ Loading map...</div>;

  const myAssigned = orders.filter((o) => {
    const assigned = o.assignedRider;
    const riderId = riderProfile?._id || riderProfile?.id;
    return assigned && String(assigned._id || assigned) === String(riderId);
  });

  return (
    <div style={{ padding: 12 }}>
      <h2>Rider Live Map</h2>

      <div style={{ display: "flex", gap: 12 }}>
        {/* Map */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              height: "70vh",
              borderRadius: 8,
              overflow: "hidden",
              background: "#eee",
            }}
          >
            <GoogleMap
              mapContainerStyle={containerStyle}
              onLoad={onMapLoad}
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
                    <div>
                      <strong>{riderProfile?.name || "You"}</strong>
                    </div>
                    <div style={{ fontSize: 13 }}>
                      {riderProfile?.vehicle?.type}{" "}
                      {riderProfile?.vehicle?.regNo}
                    </div>
                  </div>
                </InfoWindow>
              )}

              {/* Assigned orders markers */}
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
                        options={{ strokeWeight: 3, zIndex: 1, geodesic: true }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </GoogleMap>
          </div>
        </div>

        {/* Sidebar */}
        <div
          style={{
            width: 360,
            maxHeight: "70vh",
            overflowY: "auto",
            border: "1px solid #eee",
            padding: 12,
            borderRadius: 8,
          }}
        >
          <h3>Orders ({myAssigned.length})</h3>

          <div style={{ marginBottom: 8 }}>
            <button onClick={fitBoundsToMarkers}>Fit map</button>
            <button
              style={{ marginLeft: 8 }}
              onClick={() => {
                if (mapRef.current && riderLocation) {
                  mapRef.current.panTo(riderLocation);
                  mapRef.current.setZoom(14);
                }
              }}
            >
              Center on me
            </button>
            <button
              style={{ marginLeft: 8 }}
              onClick={() => setFollowRider((f) => !f)}
            >
              {followRider ? "Stop follow" : "Follow rider"}
            </button>
          </div>

          {myAssigned.length === 0 && <p>No assigned orders currently.</p>}

          {myAssigned.map((o) => {
            const loc = orderLatLng(o);
            return (
              <div
                key={o._id}
                style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  marginBottom: 8,
                  borderRadius: 6,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <strong>#{String(o._id).slice(0, 8)}</strong>
                  </div>
                  <div>
                    <em>{o.status}</em>
                  </div>
                </div>
                <div style={{ fontSize: 13 }}>
                  {o.customerName} — {o.customerPhone}
                </div>
                <div style={{ fontSize: 12 }}>
                  {o.customerAddress ??
                    (loc
                      ? `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`
                      : "No coords")}
                </div>
                <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                  <button
                    onClick={() => {
                      if (loc && mapRef.current) {
                        mapRef.current.panTo(loc);
                        mapRef.current.setZoom(15);
                      }
                      setSelectedOrder(o);
                    }}
                  >
                    Go to
                  </button>
                  <Link to={`/rider/orders/${o._id}`}>View</Link>
                </div>
              </div>
            );
          })}

          {selectedOrder && (
            <div
              style={{
                marginTop: 12,
                padding: 8,
                borderTop: "1px solid #eee",
              }}
            >
              <h4>Order detail</h4>
              <div>
                <strong>Id:</strong> {selectedOrder._id}
              </div>
              <div>
                <strong>Status:</strong> {selectedOrder.status}
              </div>
              <div>
                <strong>Customer:</strong> {selectedOrder.customerName} (
                {selectedOrder.customerPhone})
              </div>
              <div>
                <strong>Address:</strong> {selectedOrder.customerAddress}
              </div>
              <div style={{ marginTop: 8 }}>
                <strong>Items:</strong>
                <ul>
                  {(selectedOrder.items || []).map((it, i) => (
                    <li key={i}>
                      {it.name} × {it.quantity}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ marginTop: 8 }}>
                <Link to={`/rider/orders/${selectedOrder._id}`}>
                  Open full detail
                </Link>
                <button
                  style={{ marginLeft: 8 }}
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
