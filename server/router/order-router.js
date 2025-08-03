const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.post('/', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully!" });
  } catch (error) {
    console.error("Order save error:", error);
    res.status(500).json({ error: "Error placing order" });
  }
});

module.exports = router;
