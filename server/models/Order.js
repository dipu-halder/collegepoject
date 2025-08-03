const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  email: String,
  address: String,
  city: String,
  state: String,
  totalAmount: Number,
  totalQuantity: Number,
  cartItems: [
    {
      title: String,
      price: Number,
      quantity: Number,
      image: String,
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
