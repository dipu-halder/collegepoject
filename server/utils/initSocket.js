// backend/utils/initSocket.js
const jwt = require("jsonwebtoken");
const Rider = require("../models/Rider");
const Order = require("../models/Order");

function stripBearer(token) {
  if (!token) return null;
  if (token.startsWith("Bearer ")) return token.split(" ")[1];
  return token;
}

function initSocket(io) {
  // authenticate sockets
  io.use((socket, next) => {
    try {
      let token = socket.handshake?.auth?.token || socket.handshake?.headers?.authorization || null;
      token = stripBearer(token);
      if (!token) return next(new Error("Authentication error: no token provided"));

      const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
      socket.user = payload; // { userId, email, isAdmin ... }
      return next();
    } catch (err) {
      console.error("Socket auth error:", err.message || err);
      return next(new Error("Authentication error: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id, "user:", socket.user?.userId);

    // join order room (owner or admin or publicTracking)
    socket.on("joinOrder", async (orderId) => {
      try {
        if (!orderId) return;
        const order = await Order.findById(orderId).populate("user", "_id").lean();
        if (!order) {
          socket.emit("error", { message: "Order not found" });
          return;
        }

        // allow if socket user is owner or admin
        if (socket.user && (String(order.user?._id) === socket.user.userId || socket.user.isAdmin)) {
          socket.join(`order:${orderId}`);
          return;
        }

        // allow if order.publicTracking true
        if (order.publicTracking === true) {
          socket.join(`order:${orderId}`);
          return;
        }

        socket.emit("error", { message: "Unauthorized to join this order" });
      } catch (err) {
        console.error("joinOrder error:", err);
        socket.emit("error", { message: "Server error on joinOrder" });
      }
    });

    // rider private room
    socket.on("joinRider", (riderId) => {
      if (!riderId) return;
      socket.join(`rider:${riderId}`);
    });

    // rider -> server: update location
    socket.on("rider:updateLocation", async (payload) => {
      try {
        if (!payload) return;
        const { riderId, lat, lng, heading = 0, speed = 0, ts } = payload;
        if (!riderId || lat == null || lng == null) return;

        // allow only rider themselves or admin OR user linked to rider.user
        const socketUserId = socket.user && socket.user.userId;
        const isAdmin = socket.user && socket.user.isAdmin;

        let allowed = false;
        if (isAdmin) allowed = true;
        if (socketUserId && String(socketUserId) === String(riderId)) allowed = true; // case token payload contains riderId directly
        if (!allowed) {
          // check if socket.user.userId is a User id linked to Rider.user
          const maybeRider = await Rider.findById(riderId).lean();
          if (maybeRider && maybeRider.user && String(maybeRider.user) === String(socketUserId)) {
            allowed = true;
          }
        }
        if (!allowed) {
          socket.emit("error", { message: "Unauthorized rider update" });
          return;
        }

        // update Rider.lastLocation (best-effort)
        try {
          await Rider.findByIdAndUpdate(
            riderId,
            {
              isActive: true,
              lastLocation: {
                lat: Number(lat),
                lng: Number(lng),
                heading: Number(heading) || 0,
                speed: Number(speed) || 0,
                updatedAt: ts ? new Date(ts) : new Date(),
              },
            },
            { new: true }
          );
        } catch (err) {
          console.warn("Failed to update Rider.lastLocation:", err.message || err);
        }

        // emit to rider room
        io.to(`rider:${riderId}`).emit("rider.location", {
          riderId,
          lat: Number(lat),
          lng: Number(lng),
          heading,
          speed,
          ts: ts || Date.now(),
        });

        // emit to all orders assigned to this rider (status matters)
        try {
          const orders = await Order.find({ assignedRider: riderId, status: { $in: ["Out for Delivery", "Confirmed", "Preparing"] } }).select("_id").lean();
          orders.forEach((o) => {
            io.to(`order:${o._id}`).emit("order.riderLocation", {
              orderId: String(o._id),
              riderId,
              lat: Number(lat),
              lng: Number(lng),
              heading,
              speed,
              ts: ts || Date.now(),
            });
          });
        } catch (err) {
          console.warn("Failed to emit to order rooms:", err.message || err);
        }
      } catch (err) {
        console.error("rider:updateLocation handler error:", err);
      }  console.log("socket rider:updateLocation payload:", payload, "socket.user:", socket.user);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}

module.exports = initSocket;
