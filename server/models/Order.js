// backend/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [
    {
      title: String,
      price: Number,
      quantity: Number,
      image: String
    }
  ],
  total: Number,
  user: {
    name: String,
    email: String,
    mobile: String,
    address: String
  },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered"],
    default: "Pending"
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
