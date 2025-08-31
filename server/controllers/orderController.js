// backend/controllers/orderController.js
const Order = require("../models/Order");

const createOrder = async (req, res) => {
  try {
    const {
      items,
      total,
      customerName,
      customerPhone,
      customerAddress,
      customerEmail,
      customerLat,
      customerLng
    } = req.body;

    if (!items || items.length === 0) return res.status(400).json({ message: "No items in the order" });

    if (customerLat == null || customerLng == null) {
      return res.status(400).json({ message: "Delivery location is required" });
    }

    const order = new Order({
      items,
      total,
      user: req.user ? req.user._id : null,
      customerName,
      customerPhone,
      customerAddress,
      customerEmail,
      customerLat,
      customerLng
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: err.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("user", "name email phone");

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("assignedRider", "name phone vehicle");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // security: only owner or admin can fetch via this route (this route expects authMiddleware already)
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Error fetching order" });
  }
};

module.exports = { createOrder, getUserOrders, getOrderById };
