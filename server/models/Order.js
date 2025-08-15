// // backend/models/Order.js
// const mongoose = require("mongoose");

// const orderItemSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   price: { type: Number, required: true },
//   quantity: { type: Number, required: true, default: 1 },
//   img: { type: String } // store absolute URL or relative path
// }, { _id: false });

// const orderSchema = new mongoose.Schema({
//   items: { type: [orderItemSchema], default: [] },
//   total: { type: Number, required: true, default: 0 },
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   // snapshot of user details at order time (useful if populate fails or user changes)
//   userInfo: {
//     name: String,
//     email: String,
//     mobile: String,
//     address: String
//   },
//   status: {
//     type: String,
//     enum: ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered"],
//     default: "Pending"
//   }
// }, { timestamps: true });

// module.exports = mongoose.model("Order", orderSchema);
 // backend/models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
      img: String
    }
  ],
  total: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  customerAddress: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered"],
    default: "Pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);


