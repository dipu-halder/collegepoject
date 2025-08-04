// models/order-model.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  items: [
    {
      title: String,
      price: Number,
      quantity: Number,
      image: String,
    },
  ],
  total: Number,
  user: {
    name: String,
    email: String,
    address: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
