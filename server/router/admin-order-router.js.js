// const express = require('express');
// const router = express.Router();
// const Order = require('../models/Order');

// // Get all orders
// router.get('/orders', async (req, res) => {
//   try {
//     const orders = await Order.find().sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching orders' });
//   }
// });

// // Update order status
// router.patch('/orders/:id/status', async (req, res) => {
//   try {
//     const { status } = req.body;
//     const order = await Order.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     );
//     if (!order) return res.status(404).json({ message: 'Order not found' });
//     res.json(order);
//   } catch (err) {
//     res.status(500).json({ message: 'Error updating status' });
//   }
// });

// module.exports = router;
