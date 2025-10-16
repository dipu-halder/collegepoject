// backend/utils/initSocket.js
const jwt = require("jsonwebtoken");
const Rider = require("../models/Rider");
const Order = require("../models/Order");

/**
 * Helper: strip Bearer prefix (if present)
 */
function stripBearer(token) {
  if (!token) return null;
  if (token.startsWith("Bearer ")) return token.split(" ")[1];
  return token;
}

function initSocket(io) {
  // authenticate sockets
  io.use((socket, next) => {
    try {
      let token =
        socket.handshake?.auth?.token ||
        socket.handshake?.headers?.authorization ||
        socket.handshake?.query?.token ||
        null;
      token = stripBearer(token);
      if (!token) return next(new Error("Authentication error: no token provided"));

      const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

      // Attach payload to socket for later use
      socket.user = payload || {};
      // Normalize common identity fields for convenience
      socket.userId = payload.userId || null;
      socket.riderTokenId = payload.riderId || null; // token may carry riderId
      socket._rawToken = token;

      return next();
    } catch (err) {
      console.error("Socket auth error:", err.message || err);
      return next(new Error("Authentication error: invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("Socket connected:", socket.id, "payload:", {
      userId: socket.userId,
      riderTokenId: socket.riderTokenId,
    });

    // Try to detect rider identity and auto-join rider room if this socket belongs to a Rider.
    // This makes sure a rider client receives their own location events without having to call joinRider explicitly.
    try {
      let detectedRiderId = null;

      // 1) If token explicitly had riderId, try that first
      if (socket.riderTokenId) {
        const r = await Rider.findById(socket.riderTokenId).select("_id");
        if (r) detectedRiderId = String(r._id);
      }

      // 2) If not, and token has userId, try to find Rider by linked user
      if (!detectedRiderId && socket.userId) {
        const r = await Rider.findOne({ user: socket.userId }).select("_id");
        if (r) detectedRiderId = String(r._id);
      }

      // 3) As a last attempt, if token userId might in fact be Rider._id (some tokens may store rider's id in userId)
      if (!detectedRiderId && socket.userId) {
        const r = await Rider.findById(socket.userId).select("_id");
        if (r) detectedRiderId = String(r._id);
      }

      if (detectedRiderId) {
        socket.riderId = detectedRiderId;
        socket.join(`rider:${detectedRiderId}`);
        console.log(`Socket ${socket.id} auto-joined rider:${detectedRiderId}`);
      }
    } catch (err) {
      console.warn("Error detecting rider on connect:", err?.message || err);
    }

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
        const isAdmin = socket.user && socket.user.isAdmin;
        const tokenUserId = socket.userId;
        const tokenRiderId = socket.riderTokenId || socket.riderId;

        if ((tokenUserId && String(order.user?._id) === String(tokenUserId)) || isAdmin) {
          socket.join(`order:${orderId}`);
          return;
        }

        // allow if order.publicTracking true
        if (order.publicTracking === true) {
          socket.join(`order:${orderId}`);
          return;
        }

        // additionally allow if the token identifies the assigned rider for this order
        if (order.assignedRider && tokenRiderId && String(order.assignedRider) === String(tokenRiderId)) {
          socket.join(`order:${orderId}`);
          return;
        }

        socket.emit("error", { message: "Unauthorized to join this order" });
      } catch (err) {
        console.error("joinOrder error:", err);
        socket.emit("error", { message: "Server error on joinOrder" });
      }
    });

    // rider private room (explicit join available)
    socket.on("joinRider", (riderId) => {
      try {
        if (!riderId) return;
        socket.join(`rider:${riderId}`);
      } catch (err) {
        console.warn("joinRider error:", err?.message || err);
      }
    });

    // rider -> server: update location
    socket.on("rider:updateLocation", async (payload) => {
      try {
        if (!payload) return;
        const { riderId: payloadRiderId, lat, lng, heading = 0, speed = 0, ts } = payload;
        if (!payloadRiderId || lat == null || lng == null) {
          socket.emit("error", { message: "Invalid location payload" });
          return;
        }

        // Determine identity from token and payload
        const tokenUserId = socket.userId || null;
        const tokenRiderId = socket.riderTokenId || socket.riderId || null;

        const socketUserId = tokenUserId;
        const socketRiderId = tokenRiderId;

        const isAdmin = socket.user && socket.user.isAdmin;

        // Authorize: allowed if admin OR token identifies the rider (either as riderId or as linked user)
        let allowed = false;

        if (isAdmin) allowed = true;
        if (socketRiderId && String(socketRiderId) === String(payloadRiderId)) allowed = true;
        if (socketUserId && String(socketUserId) === String(payloadRiderId)) {
          // this handles tokens that put the Rider._id in userId field
          allowed = true;
        }

        // As fallback, check Rider.user linking (if token has a userId and that user is linked to rider)
        if (!allowed && socketUserId) {
          const maybeRider = await Rider.findById(payloadRiderId).lean();
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
            payloadRiderId,
            {
              isActive: true,
              lastLocation: {
                lat: Number(lat),
                lng: Number(lng),
                heading: Number(heading) || 0,
                speed: Number(speed) || 0,
                updatedAt: ts ? new Date(ts) : new Date(),
              },
              // also keep geo location coordinates consistent (optional)
              location: {
                type: "Point",
                coordinates: [Number(lng), Number(lat)],
              },
            },
            { new: true }
          );
        } catch (err) {
          console.warn("Failed to update Rider.lastLocation:", err.message || err);
        }

        // emit to rider room (so rider client and any watchers in rider:<id> get it)
        io.to(`rider:${payloadRiderId}`).emit("rider.location", {
          riderId: String(payloadRiderId),
          lat: Number(lat),
          lng: Number(lng),
          heading,
          speed,
          ts: ts || Date.now(),
        });

        // emit to all orders assigned to this rider (status matters)
        try {
          const orders = await Order.find({
            assignedRider: payloadRiderId,
            status: { $in: ["Out for Delivery", "Confirmed", "Preparing"] },
          })
            .select("_id")
            .lean();

          orders.forEach((o) => {
            io.to(`order:${o._id}`).emit("order.riderLocation", {
              orderId: String(o._id),
              riderId: String(payloadRiderId),
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

        console.log("socket rider:updateLocation payload:", {
          socketId: socket.id,
          payload,
          socketUserId,
          socketRiderId,
        });
      } catch (err) {
        console.error("rider:updateLocation handler error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}

module.exports = initSocket;
