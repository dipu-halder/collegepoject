import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const socket = io(import.meta.env.VITE_API_BASE); // Backend URL .env me rakho

const containerStyle = {
  width: "100%",
  height: "400px",
};

export default function TrackOrder() {
  const { id } = useParams(); // /track/:id
  const [order, setOrder] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

  // 📌 Fetch order (polling fallback)
  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch order");

      const data = await res.json();
      setOrder(data);
      if (data.riderLocation) setRiderLocation(data.riderLocation);
    } catch (err) {
      console.error("Fetch order error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const poll = setInterval(fetchOrder, 15000); // 15 sec fallback polling
    return () => clearInterval(poll);
  }, [id]);

  // 📌 Socket events
  useEffect(() => {
    socket.emit("joinOrder", id);

    socket.on("orderUpdated", (updatedOrder) => {
      setOrder(updatedOrder);
    });

    socket.on("locationUpdated", ({ lat, lng }) => {
      setRiderLocation({ lat, lng });
    });

    return () => {
      socket.off("orderUpdated");
      socket.off("locationUpdated");
    };
  }, [id]);

  if (loading) return <p className="text-center mt-4">Loading order...</p>;
  if (!order) return <p className="text-center mt-4">Order not found</p>;

  if (order.status === "delivered") {
    return (
      <div className="text-center mt-10">
        <h2 className="text-2xl font-bold">🎉 Your order has been delivered!</h2>
        <p className="mt-2 text-gray-600">Thanks for ordering with us 🙏</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-6 p-4">
      <h1 className="text-xl font-bold mb-4">Track Your Order</h1>

      <div className="bg-white shadow rounded-xl p-4 mb-4">
        <p>
          <span className="font-semibold">Order ID:</span> {order._id}
        </p>
        <p>
          <span className="font-semibold">Status:</span> {order.status}
        </p>
        <p>
          <span className="font-semibold">ETA:</span> Coming soon ⏳
        </p>
        {/* 🔗 Distance Matrix API hook point */}
      </div>

      {isLoaded && riderLocation && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: riderLocation.lat, lng: riderLocation.lng }}
          zoom={15}
        >
          <Marker position={{ lat: riderLocation.lat, lng: riderLocation.lng }} />
        </GoogleMap>
      )}

      {!riderLocation && (
        <p className="text-gray-500 text-center mt-4">
          Waiting for rider location update...
        </p>
      )}
    </div>
  );
}
  