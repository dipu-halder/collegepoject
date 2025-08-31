// src/services/orderService.js
import apiFetch from "../utils/apiFetch";

/**
 * orderPayload: { items, total, customerName, customerPhone, customerAddress, customerEmail }
 */
export async function placeOrderWithGeo(orderPayload) {
  const location = await new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000 }
    );
  });

  if (!location) {
    throw new Error("Please allow location or provide delivery coordinates.");
  }

  const body = {
    ...orderPayload,
    customerLat: Number(location.lat),
    customerLng: Number(location.lng),
  };

  const res = await apiFetch("/api/order", { method: "POST", body });
  return res;
}
