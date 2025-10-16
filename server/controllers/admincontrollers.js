
// backend/controllers/admincontrollers.js
const User = require("../models/user-model");
const Contacts = require("../models/contact-model");
const Order = require("../models/Order");
const Rider = require("../models/Rider");

// ===== USERS =====
const getAllUser = async (req, res, next) => {
  try {
    const users = await User.find({}, { password: 0 });
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

const deleteUserBYId = async (req, res, next) => {
  try {
    const id = req.params.id;
    await User.deleteOne({ _id: id });
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = await User.findById(id, { password: 0 });
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const updateUserId = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updatedUserData = req.body;
    const updateUser = await User.findByIdAndUpdate(id, updatedUserData, { new: true });
    return res.status(200).json(updateUser);
  } catch (error) {
    next(error);
  }
};

// ===== CONTACTS =====
const getAllcontacts = async (req, res, next) => {
  try {
    const contacts = await Contacts.find();
    if (!contacts || contacts.length === 0) {
      return res.status(404).json({ message: "No contacts found" });
    }
    return res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
};

const deleteContactBYId = async (req, res, next) => {
  try {
    const id = req.params.id;
    await Contacts.deleteOne({ _id: id });
    return res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ===== ORDERS =====
/**
 * Get all orders for admin.
 * Now populates user, assignedRider and pendingOffers.
 */
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email mobile address")
      .populate("assignedRider", "name phone vehicle")
      .populate("pendingOffers", "name phone vehicle");

    // return array (empty if none)
    return res.status(200).json(Array.isArray(orders) ? orders : []);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user", "name email mobile address")
     .populate("assignedRider", "name phone vehicle")
     .populate("pendingOffers", "name phone vehicle");

    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

/**
 * Assign a rider to an order (admin direct assign).
 * PATCH /api/admin/orders/:id/assign-rider
 */
const assignRider = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    let { riderId } = req.body;

    if (riderId === "" || riderId === null) riderId = null;

    if (riderId) {
      const rider = await Rider.findById(riderId);
      if (!rider) return res.status(404).json({ message: "Rider not found" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { assignedRider: riderId, pendingOffers: [] },
      { new: true }
    )
      .populate("user", "name email mobile address")
      .populate("assignedRider", "name phone vehicle")
      .populate("pendingOffers", "name phone vehicle");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // emit socket events if io available
    try {
      const io = req.app && req.app.get && req.app.get("io");
      if (io) {
        if (riderId) {
          io.to(`order:${orderId}`).emit("order.assigned", {
            orderId,
            rider: order.assignedRider
          });
          io.to(`rider:${riderId}`).emit("assigned.order", {
            orderId,
            order: {
              _id: order._id,
              items: order.items,
              total: order.total,
              customerName: order.customerName,
              customerAddress: order.customerAddress,
              customerPhone: order.customerPhone
            }
          });
        } else {
          io.to(`order:${orderId}`).emit("order.unassigned", { orderId });
        }
      }
    } catch (emitErr) {
      console.warn("Socket emit after assignRider failed:", emitErr);
    }

    return res.status(200).json({ message: riderId ? "Rider assigned" : "Rider unassigned", order });
  } catch (error) {
    next(error);
  }
};

/**
 * Offer order to a set of riders (admin flow).
 * POST /api/admin/orders/:id/offer-riders
 * Body: { riderIds: [ ... ] }
 */
const offerRiders = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { riderIds } = req.body;

    if (!Array.isArray(riderIds) || riderIds.length === 0) {
      return res.status(400).json({ message: "Provide an array of riderIds" });
    }

    // validate riders exist (ignore invalid ids)
    const validRiders = await Rider.find({ _id: { $in: riderIds } }).select("_id name phone");
    const validIds = validRiders.map(r => r._id.toString());
    if (validIds.length === 0) {
      return res.status(400).json({ message: "No valid riders found in riderIds" });
    }

    // add to pendingOffers (use addToSet to avoid duplicates)
    const order = await Order.findByIdAndUpdate(
      orderId,
      { $addToSet: { pendingOffers: { $each: validIds } } },
      { new: true }
    )
      .populate("user", "name email mobile address")
      .populate("assignedRider", "name phone vehicle")
      .populate("pendingOffers", "name phone vehicle");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // emit socket event to each rider
    try {
      const io = req.app && req.app.get && req.app.get("io");
      if (io) {
        validIds.forEach((rid) => {
          io.to(`rider:${rid}`).emit("order.offer", {
            order: {
              _id: order._id,
              items: order.items,
              total: order.total,
              customerName: order.customerName,
              customerAddress: order.customerAddress,
              customerPhone: order.customerPhone,
              status: order.status
            }
          });
        });
      }
    } catch (emitErr) {
      console.warn("Socket emit after offerRiders failed:", emitErr);
    }

    return res.status(200).json({ message: "Offered to riders", order });
  } catch (error) {
    next(error);
  }
};

// ===== RIDERS =====
const getAllRiders = async (req, res) => {
  try {
    const riders = await Rider.find();
    return res.status(200).json(riders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getPendingRiders = async (req, res) => {
  try {
    const riders = await Rider.find({ isApproved: false });
    return res.status(200).json(riders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const approveRider = async (req, res) => {
  try {
    const rider = await Rider.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!rider) return res.status(404).json({ message: "Rider not found" });
    return res.status(200).json(rider);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const rejectRider = async (req, res) => {
  try {
    const rider = await Rider.findByIdAndDelete(req.params.id);
    if (!rider) return res.status(404).json({ message: "Rider not found" });
    return res.status(200).json({ message: "Rider rejected and removed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  // users
  getAllUser,
  deleteUserBYId,
  getUserById,
  updateUserId,
  // contacts
  getAllcontacts,
  deleteContactBYId,
  // orders
  getAllOrders,
  updateOrderStatus,
  assignRider,
  offerRiders,
  // riders
  getAllRiders,
  getPendingRiders,
  approveRider,
  rejectRider,
};
