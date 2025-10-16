
 // models/Order.js
// backend/models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  items: [{ name: String, price: Number, quantity: Number, img: String }],
  total: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerAddress: { type: String, required: true },
  customerEmail: { type: String, required: true },

  // location for tracking
  customerLat: { type: Number, required: true },
  customerLng: { type: Number, required: true },

  // allow admin to enable public tracking if needed
  publicTracking: { type: Boolean, default: false },

  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered"],
    default: "Pending"
  },
  assignedRider: { type: mongoose.Schema.Types.ObjectId, ref: "Rider", required: false },
  pendingOffers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rider" }]
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
