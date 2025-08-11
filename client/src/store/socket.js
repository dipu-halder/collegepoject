// // src/socket.js
// import { io } from "socket.io-client";

// // Read backend URL from environment
// const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// // Create socket connection
// export const socket = io(backendUrl, {
//   transports: ["websocket"],
// });

// src/socket.js
// frontend/src/store/socket.js
import { io } from "socket.io-client";

// Read backend URL from environment
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Create socket connection
export const socket = io(backendUrl, {
  transports: ["websocket"],
});

