// src/utils/socket.js
import { io } from "socket.io-client";

/**
 * normalizeToken: accept either "Bearer <token>" or raw token and return "Bearer <raw>"
 */
function normalizeToken(raw) {
  if (!raw) return "";
  // if stored token already includes "Bearer " return as-is
  if (raw.startsWith("Bearer ")) return raw;
  return `Bearer ${raw}`;
}

/**
 * SOCKET_URL read from env fallbacks
 */
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_BASE ||
  "http://localhost:5000";

/**
 * createSocket(optionalToken)
 * - optionalToken: raw token or "Bearer <token>" or undefined (will read localStorage token)
 * - returns socket instance (socket.io-client)
 */
export function createSocket(optionalToken) {
  const raw = optionalToken ?? localStorage.getItem("token") ?? "";
  const bearer = normalizeToken(raw);

  const socket = io(SOCKET_URL, {
    auth: bearer ? { token: bearer } : {},
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => console.log("[socket] connected", socket.id));
  socket.on("connect_error", (err) => console.warn("[socket] connect_error:", err?.message || err));
  socket.on("disconnect", (reason) => console.log("[socket] disconnected", reason));

  return socket;
}

export default createSocket;
