// RiderTracking.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { io } from "socket.io-client";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const RiderTracking = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);

  // ✅ Load Google Maps
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

  useEffect(() => {
    // ✅ Socket connect
    const socket = io(import.meta.env.VITE_API_BASE, {
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    // ✅ Join order room
    socket.emit("joinOrder", orderId);

    // ✅ Order details from backend via socket
    socket.on("order.details", (data) => {
      setOrder(data);
    });

    // ✅ Rider live location update
    socket.on("rider.location", (data) => {
      setRiderLocation({ lat: data.lat, lng: data.lng });
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  if (!isLoaded) return <p>⏳ Loading Map...</p>;
  if (!order) return <p>⏳ Loading order details...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">
        📍 Tracking Order #{order._id}
      </h2>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{
          lat: order.customerLat,
          lng: order.customerLng,
        }}
        zoom={13}
      >
        {/* ✅ Customer Location Marker */}
        <Marker
          position={{ lat: order.customerLat, lng: order.customerLng }}
          label="🏠"
        />

        {/* ✅ Rider Live Location Marker */}
        {riderLocation && <Marker position={riderLocation} label="🚴" />}
      </GoogleMap>

      {/* ✅ Order Info Section */}
      <div className="mt-4 bg-gray-100 p-4 rounded">
        <h3 className="font-semibold">Order Details</h3>
        <p>
          <b>Customer:</b> {order.customerName}
        </p>
        <p>
          <b>Address:</b> {order.customerAddress}
        </p>
        <p>
          <b>Status:</b> {order.status}
        </p>
        <p>
          <b>Total:</b> ₹{order.total}
        </p>
      </div>
    </div>
  );
};

export default RiderTracking;
