// src/utils/socket.js
import { io } from "socket.io-client";

/**
 * createSocket(token)
 * - token: either raw token ("ey...") or "Bearer ey..." or null
 * Returns an initialized socket.io-client instance.
 *
 * This function normalizes token to "Bearer <raw>" and passes it via auth.
 * It also enables websocket transport for reliability.
 */
export function createSocket(token) {
  const raw = (token || "").toString();
  const normalized = raw.match(/^Bearer\s+/i) ? raw : raw ? `Bearer ${raw}` : null;

  const url = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "/";

  const socket = io(url, {
    auth: { token: normalized },
    transports: ["websocket"],
    autoConnect: true,
  });

  return socket;
}
