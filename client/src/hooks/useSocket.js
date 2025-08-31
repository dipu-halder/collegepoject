// src/hooks/useSocket.js
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function useSocket({ url, token, onConnect, onDisconnect, onError }) {
  const socketRef = useRef(null);
  const [status, setStatus] = useState("disconnected"); // connected / disconnected / connecting

  useEffect(() => {
    if (!token) {
      setStatus("disconnected");
      return;
    }

    setStatus("connecting");
    const socket = io(url, {
      auth: { token },
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"]
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("connected");
      onConnect && onConnect(socket);
    });

    socket.on("disconnect", (reason) => {
      setStatus("disconnected");
      onDisconnect && onDisconnect(reason);
    });

    socket.on("connect_error", (err) => {
      setStatus("disconnected");
      onError && onError(err);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [url, token]); // reconnect when token or url changes

  return { socketRef, status };
}
