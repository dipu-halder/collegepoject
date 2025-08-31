// src/components/MapPickerGoogle.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLoadScript, GoogleMap, Marker, Autocomplete } from "@react-google-maps/api";

const libs = ["places"];
const containerStyle = { width: "100%", height: "340px" };
const defaultCenter = { lat: 22.5726, lng: 88.3639 }; // Kolkata

export default function MapPickerGoogle({ position, setPosition, desiredAccuracy = 30 }) {
  const [mapRef, setMapRef] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [accuracyMsg, setAccuracyMsg] = useState("");
  const [watching, setWatching] = useState(false);
  const watchIdRef = useRef(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libs,
  });

  useEffect(() => {
    return () => {
      if (watchIdRef.current && navigator.geolocation) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const onLoadMap = useCallback((map) => setMapRef(map), []);
  const onUnmount = useCallback(() => setMapRef(null), []);

  const handlePlaceChanged = () => {
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) return;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setPosition({ lat, lng });
    if (mapRef) mapRef.panTo({ lat, lng });
  };

  const startHighAccuracyWatch = () => {
    if (!("geolocation" in navigator)) {
      setAccuracyMsg("Geolocation not supported by browser.");
      return;
    }
    setWatching(true);
    setAccuracyMsg("Requesting high-accuracy position... allow location permission.");

    const opts = { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 };
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy || null;
        setPosition({ lat, lng });
        setAccuracyMsg(acc ? `Accuracy ≈ ${Math.round(acc)} m` : "Location obtained");
        if (mapRef) mapRef.panTo({ lat, lng });
        if (acc !== null && acc <= desiredAccuracy) {
          setAccuracyMsg(`Good accuracy: ~${Math.round(acc)} m`);
          if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
          setWatching(false);
        }
      },
      (err) => {
        console.error("geolocation watch failed", err);
        setAccuracyMsg("Could not get precise location. Try moving outside or disabling VPN.");
        setWatching(false);
      },
      opts
    );

    watchIdRef.current = id;
  };

  const stopWatch = () => {
    if (watchIdRef.current && navigator.geolocation) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    setWatching(false);
  };

  const singleFix = () => {
    if (!("geolocation" in navigator)) return setAccuracyMsg("Geolocation not supported.");
    setAccuracyMsg("Getting one-time high-accuracy fix...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAccuracyMsg(pos.coords.accuracy ? `Accuracy ≈ ${Math.round(pos.coords.accuracy)} m` : "Location obtained");
        if (mapRef) mapRef.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.error(err);
        setAccuracyMsg("Could not get location. Check permissions or try watch.");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  };

  const onMarkerDragEnd = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setPosition({ lat, lng });
  };

  if (loadError) return <div>Google Maps load error</div>;
  if (!isLoaded) return <div>Loading map…</div>;

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 600 }}>Select delivery location</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={startHighAccuracyWatch} disabled={watching} style={{ padding: "6px 10px" }}>
            {watching ? "Watching…" : "Auto-detect (watch)"}
          </button>
          <button type="button" onClick={singleFix} style={{ padding: "6px 10px" }}>
            One-time fix
          </button>
          <button type="button" onClick={stopWatch} style={{ padding: "6px 10px" }}>
            Stop
          </button>
        </div>
      </div>

      <div style={{ padding: 8 }}>
        <Autocomplete onLoad={(ac) => setAutocomplete(ac)} onPlaceChanged={handlePlaceChanged}>
          <input
            type="text"
            placeholder="Search address or place"
            style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" }}
          />
        </Autocomplete>
      </div>

      <div style={{ height: containerStyle.height }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={position || defaultCenter}
          zoom={position ? 18 : 13}
          onLoad={onLoadMap}
          onUnmount={onUnmount}
        >
          {position && <Marker position={position} draggable onDragEnd={onMarkerDragEnd} />}
        </GoogleMap>
      </div>

      <div style={{ padding: 8 }}>
        <div style={{ fontSize: 14 }}>
          <strong>Coords:</strong>&nbsp;
          {position ? `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}` : "Not set"}
        </div>
        <div style={{ marginTop: 6, color: "#666" }}>{accuracyMsg}</div>
        <div style={{ marginTop: 8, fontSize: 13, color: "#444" }}>
          <strong>Tips:</strong> use mobile for best GPS, allow precise location, disable VPN. Drag the pin to refine doorstep.
        </div>
      </div>
    </div>
  );
}
