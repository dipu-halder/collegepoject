const Rider = require("../models/Rider");
const User = require("../models/user-model");
const Order = require("../models/Order");

/** ========================
 *  RIDER REGISTRATION + PROFILE
 *  ======================= */

/* ----- registerRider ----- */
const registerRider = async (req, res) => {
  try {
    const { name, phone, vehicleType, vehicleRegNo } = req.body;
    if (!name || !phone || !vehicleType || !vehicleRegNo)
      return res.status(400).json({ message: "All fields required" });

    const existing = await Rider.findOne({
      $or: [{ user: req.user._id }, { phone }],
    });
    if (existing)
      return res.status(400).json({
        message: "You already submitted a rider application or phone already used",
      });

    const rider = new Rider({
      user: req.user._id,
      name,
      phone,
      vehicle: { type: vehicleType, regNo: vehicleRegNo },
      isApproved: false,
      // keep lastLocation defaults from schema
    });
    await rider.save();
    return res.status(201).json({ message: "Rider registration submitted", rider });
  } catch (err) {
    console.error("registerRider error:", err);
    return res.status(500).json({ message: "Error registering rider" });
  }
};

const getMyRiderProfile = async (req, res) => {
  try {
    let rider = await Rider.findOne({ user: req.user._id });
    if (!rider && req.user.phone) {
      rider = await Rider.findOne({ phone: req.user.phone });
    }
    if (!rider) return res.status(404).json({ message: "No rider profile found" });
    return res.status(200).json(rider);
  } catch (err) {
    console.error("getMyRiderProfile error:", err);
    return res.status(500).json({ message: "Error fetching rider profile" });
  }
};

/** ========================
 *  ADMIN RIDER MGMT
 *  ======================= */

const getPendingRiders = async (req, res) => {
  try {
    const riders = await Rider.find({ isApproved: false });
    return res.status(200).json(riders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAllRiders = async (req, res) => {
  try {
    const riders = await Rider.find();
    return res.status(200).json(riders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const approveRider = async (req, res) => {
  try {
    const { riderId } = req.params;
    const rider = await Rider.findByIdAndUpdate(
      riderId,
      { isApproved: true },
      { new: true }
    );
    if (!rider) return res.status(404).json({ message: "Rider not found" });
    return res.status(200).json({ message: "Rider approved", rider });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const rejectRider = async (req, res) => {
  try {
    const { riderId } = req.params;
    const rider = await Rider.findByIdAndDelete(riderId);
    if (!rider) return res.status(404).json({ message: "Rider not found" });
    return res.status(200).json({ message: "Rider rejected and removed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/** ========================
 *  RIDER ORDER ACTIONS
 *  ======================= */

const acceptOrder = async (req, res) => {
  try {
    const riderId = req.rider._id;
    const orderId = req.params.id;

    if (!req.rider.isApproved)
      return res.status(403).json({ message: "Rider not approved yet" });

    const order = await Order.findById(orderId).populate("pendingOffers", "name");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.assignedRider) {
      return res.status(409).json({ message: "Order already assigned to another rider" });
    }

    const offeredIds = order.pendingOffers.map((r) => String(r._id));
    if (!offeredIds.includes(String(riderId))) {
      return res.status(403).json({ message: "This order was not offered to you" });
    }

    order.assignedRider = riderId;
    order.status = "Out for Delivery";
    order.pendingOffers = [];
    await order.save();

    const io = req.app?.get("io");
    if (io) {
      io.to(`order:${orderId}`).emit("order.assigned", { orderId, riderId });
      io.to(`rider:${riderId}`).emit("assigned.order", { orderId });
    }

    res.json({ message: "Order accepted successfully", order });
  } catch (err) {
    console.error("acceptOrder error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const rejectOffer = async (req, res) => {
  try {
    const orderId = req.params.id;
    const riderId = req.rider._id;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { $pull: { pendingOffers: riderId } },
      { new: true }
    ).populate("pendingOffers", "name phone");

    if (!order) return res.status(404).json({ message: "Order not found" });

    const io = req.app?.get("io");
    if (io) {
      io.to(`order:${orderId}`).emit("order.offer.rejected", { orderId, riderId });
    }

    return res.status(200).json({ message: "Offer rejected", order });
  } catch (err) {
    console.error("rejectOffer error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getRiderOrders = async (req, res) => {
  try {
    const riderId = req.rider._id;
    const orders = await Order.find({
      status: { $ne: "Delivered" },
      $or: [{ assignedRider: riderId }, { pendingOffers: riderId }],
    })
      .sort({ createdAt: -1 })
      .populate("user", "name email mobile address")
      .populate("assignedRider", "name phone vehicle")
      .populate("pendingOffers", "name phone vehicle");

    return res.status(200).json(orders || []);
  } catch (err) {
    console.error("getRiderOrders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getRiderHistory = async (req, res) => {
  try {
    const riderId = req.rider._id;
    const days = parseInt(req.query.days, 10) || 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const orders = await Order.find({
      assignedRider: riderId,
      status: "Delivered",
      updatedAt: { $gte: since },
    })
      .sort({ updatedAt: -1 })
      .populate("user", "name email mobile address")
      .populate("assignedRider", "name phone vehicle");

    return res.status(200).json(orders || []);
  } catch (err) {
    console.error("getRiderHistory error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const markDelivered = async (req, res) => {
  try {
    const riderId = req.rider._id;
    const orderId = req.params.id;

    const order = await Order.findOne({ _id: orderId }).populate("assignedRider", "_id");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!order.assignedRider || order.assignedRider._id.toString() !== riderId.toString()) {
      return res.status(403).json({ message: "You are not the assigned rider for this order" });
    }

    const updated = await Order.findByIdAndUpdate(
      orderId,
      { status: "Delivered" },
      { new: true }
    )
      .populate("user", "name email mobile address")
      .populate("assignedRider", "name phone vehicle");

    const io = req.app?.get("io");
    if (io) {
      io.to(`order:${orderId}`).emit("order.status.updated", { orderId, status: "Delivered" });
      io.to(`rider:${riderId}`).emit("order.delivered", { orderId });
    }

    return res.status(200).json({ message: "Order marked Delivered", order: updated });
  } catch (err) {
    console.error("markDelivered error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/** ========================
 *  RIDER'S OWN LOCATIONS
 *  ======================= */
/* ----- updateLocation (fixes: use req.rider, update lastLocation, emit same events as socket code) ----- */
const updateLocation = async (req, res) => {
  try {
    // riderAuth sets req.rider
    const riderId = req.rider && (req.rider._id || req.rider.id);
    if (!riderId) return res.status(401).json({ message: "Unauthorized" });

    const { lat, lng, heading = 0, speed = 0, ts } = req.body;
    if (lat == null || lng == null) {
      return res.status(400).json({ message: "Latitude and longitude required" });
    }

    // update Rider.lastLocation (consistent with initSocket.js)
    const updated = await Rider.findByIdAndUpdate(
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

    // emit to rider room and order rooms (same behavior as socket handler)
    const io = req.app?.get("io");
    if (io) {
      io.to(`rider:${riderId}`).emit("rider.location", {
        riderId: String(riderId),
        lat: Number(lat),
        lng: Number(lng),
        heading,
        speed,
        ts: ts || Date.now(),
      });

      // emit to any non-delivered orders assigned to this rider
      try {
        const orders = await Order.find({
          assignedRider: riderId,
          status: { $in: ["Out for Delivery", "Confirmed", "Preparing"] },
        }).select("_id").lean();

        orders.forEach((o) => {
          io.to(`order:${o._id}`).emit("order.riderLocation", {
            orderId: String(o._id),
            riderId: String(riderId),
            lat: Number(lat),
            lng: Number(lng),
            heading,
            speed,
            ts: ts || Date.now(),
          });
        });
      } catch (err) {
        console.warn("Failed to emit to order rooms (HTTP update):", err?.message || err);
      }
    }

    return res.json({ message: "Location updated", lastLocation: updated?.lastLocation || { lat, lng } });
  } catch (err) {
    console.error("Error updating rider location:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/* ----- getRiderLocation (return lastLocation) ----- */
const getRiderLocation = async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.riderId).select("lastLocation");
    if (!rider || !rider.lastLocation || rider.lastLocation.lat == null) {
      return res.status(404).json({ message: "Rider location not found" });
    }

    res.json({
      riderId: rider._id,
      lastLocation: rider.lastLocation,
    });
  } catch (err) {
    console.error("Error fetching rider location:", err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  registerRider,
  getMyRiderProfile,
  getPendingRiders,
  getAllRiders,
  approveRider,
  rejectRider,
  acceptOrder,
  rejectOffer,
  getRiderOrders,
  getRiderHistory,
  markDelivered,
  getMyOrders: getRiderOrders, // kept compatibility
  getCompletedOrders: getRiderHistory, // kept compatibility
  updateLocation, // 🚀 new
  getRiderLocation,
};
