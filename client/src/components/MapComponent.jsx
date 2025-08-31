import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// fix default icon paths if needed
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/marker-icon-2x.png",
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
});

function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 15, { animate: true });
  }, [position, map]);
  return null;
}

export default function MapComponent({ riderLocation = null, customerLocation = null }) {
  const defaultCenter = customerLocation ? [customerLocation.lat, customerLocation.lng] : [28.6139, 77.2090]; // Delhi fallback

  return (
    <div style={{ height: 360, borderRadius: 8, overflow: "hidden", border: "1px solid #eee" }}>
      <MapContainer center={defaultCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
        {riderLocation && (
          <>
            <Marker position={[riderLocation.lat, riderLocation.lng]}>
              <Popup>
                Rider: {riderLocation.riderId || "Rider"} <br />
                {riderLocation.timestamp ? new Date(riderLocation.timestamp).toLocaleTimeString() : ""}
              </Popup>
            </Marker>
            <Recenter position={[riderLocation.lat, riderLocation.lng]} />
          </>
        )}

        {customerLocation && !riderLocation && (
          <Marker position={[customerLocation.lat, customerLocation.lng]}>
            <Popup>Delivery location</Popup>
          </Marker>
        )}

        {customerLocation && riderLocation && (
          <Marker position={[customerLocation.lat, customerLocation.lng]}>
            <Popup>Delivery location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
