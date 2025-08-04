const express = require('express');
const router = express.Router();
const Order = require('../models/order');

router.post("/", async (req, res) => {
  try {
    const { cartItems, totalAmount, userInfo } = req.body;

    console.log("Received Order:", req.body); // ✅ Debug log

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const order = new Order({
      items: cartItems,
      total: totalAmount,
      user: userInfo,
    });
 console.log("Incoming Order:", req.body);

    await order.save();

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;


