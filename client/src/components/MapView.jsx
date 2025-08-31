// src/components/MapView.jsx
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "420px" };

export default function MapView({ rider, customer }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

  if (!isLoaded) return <div>Loading map…</div>;

  const center = rider || customer || { lat: 20.5937, lng: 78.9629 }; // India fallback

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14}>
      {customer && <Marker position={customer} label="C" />}
      {rider && <Marker position={rider} label="R" />}
    </GoogleMap>
  );
}
