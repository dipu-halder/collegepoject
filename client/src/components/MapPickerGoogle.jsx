// src/components/MapPickerGoogle.jsx
import React, { useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "320px" };

export default function MapPickerGoogle({ position, setPosition, defaultCenter = { lat: 22.5726, lng: 88.3639 } }) {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY });

  const onMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setPosition({ lat, lng });
  }, [setPosition]);

  if (!isLoaded) return <div style={{ padding: 12 }}>Loading map...</div>;

  return (
    <div style={{ borderRadius: 8, overflow: "hidden", background: "#eee" }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={position || defaultCenter}
        zoom={position ? 15 : 12}
        onClick={onMapClick}
      >
        {position && <Marker position={position} />}
      </GoogleMap>
      <div style={{ fontSize: 13, marginTop: 6 }}>
        Click on the map to select delivery location.
      </div>
    </div>
  );
}
