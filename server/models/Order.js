// // // backend/models/Order.js
// // const mongoose = require("mongoose");

// // const orderItemSchema = new mongoose.Schema({
// //   name: { type: String, required: true },
// //   price: { type: Number, required: true },
// //   quantity: { type: Number, required: true, default: 1 },
// //   img: { type: String } // store absolute URL or relative path
// // }, { _id: false });

// // const orderSchema = new mongoose.Schema({
// //   items: { type: [orderItemSchema], default: [] },
// //   total: { type: Number, required: true, default: 0 },
// //   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
// //   // snapshot of user details at order time (useful if populate fails or user changes)
// //   userInfo: {
// //     name: String,
// //     email: String,
// //     mobile: String,
// //     address: String
// //   },
// //   status: {
// //     type: String,
// //     enum: ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered"],
// //     default: "Pending"
// //   }
// // }, { timestamps: true });

// // module.exports = mongoose.model("Order", orderSchema);
//  // backend/models/Order.js
// // backend/models/Order.js
// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema({
//   items: [
//     {
//       name: String,
//       price: Number,
//       quantity: Number,
//       img: String
//     }
//   ],
//   total: Number,
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: false // <-- changed to optional
//   },
//   customerName: {
//     type: String,
//     required: true
//   },
//   customerPhone: {
//     type: String,
//     required: true
//   },
//   customerAddress: {
//     type: String,
//     required: true
//   },
//   customerEmail: {
//     type: String,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered"],
//     default: "Pending"
//   },
//   // assigned rider ref (optional)
//   assignedRider: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Rider",
//     required: false
//   }
// }, { timestamps: true });

// module.exports = mongoose.model("Order", orderSchema);
// // backend/models/Order.js
// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema({
//   items: [
//     {
//       name: String,
//       price: Number,
//       quantity: Number,
//       img: String
//     }
//   ],
//   total: Number,
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: false
//   },
//   customerName: {
//     type: String,
//     required: true
//   },
//   customerPhone: {
//     type: String,
//     required: true
//   },
//   customerAddress: {
//     type: String,
//     required: true
//   },
//   customerEmail: {
//     type: String,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered"],
//     default: "Pending"
//   },
//   // assigned rider ref (optional)
//   assignedRider: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Rider",
//     required: false
//   },
//   // riders that were offered this order (pending acceptance)
//   pendingOffers: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Rider"
//     }
//   ]
// }, { timestamps: true });

// module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
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
