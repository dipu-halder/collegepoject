// src/components/MapComponentGoogle.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "360px" };
const defaultCenter = { lat: 22.5726, lng: 88.3639 }; // Kolkata

export default function MapComponentGoogle({ riderLocation = null, customerLocation = null }) {
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const center = useMemo(() => {
    if (riderLocation) return { lat: riderLocation.lat, lng: riderLocation.lng };
    if (customerLocation) return { lat: customerLocation.lat, lng: customerLocation.lng };
    return defaultCenter;
  }, [riderLocation, customerLocation]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Fit bounds if both available
    if (riderLocation && customerLocation) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: riderLocation.lat, lng: riderLocation.lng });
      bounds.extend({ lat: customerLocation.lat, lng: customerLocation.lng });
      map.fitBounds(bounds, 80); // padding
    } else {
      map.panTo(center);
      map.setZoom(riderLocation ? 17 : 14);
    }
  }, [riderLocation, customerLocation, center]);

  if (loadError) return <div>Map failed to load</div>;
  if (!isLoaded) return <div>Loading Map…</div>;

  return (
    <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #eee" }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onLoad={(map) => (mapRef.current = map)}
        onUnmount={() => (mapRef.current = null)}
      >
        {customerLocation && (
          <Marker
            position={{ lat: customerLocation.lat, lng: customerLocation.lng }}
            label={{ text: "Customer", fontSize: "12px" }}
          />
        )}
        {riderLocation && (
          <Marker
            position={{ lat: riderLocation.lat, lng: riderLocation.lng }}
            label={{ text: "Rider", fontSize: "12px" }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
