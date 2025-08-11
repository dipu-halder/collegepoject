// backend/controllers/orderController.js
const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { userInfo, cartItems, totalAmount } = req.body;
    if (!cartItems || cartItems.length === 0) return res.status(400).json({ message: "Cart empty" });

    const order = new Order({
      items: cartItems,
      total: totalAmount,
      user: userInfo
    });

    await order.save();

    const io = req.app.get('io');
    if (io) io.emit('orderCreated', order);

    return res.status(201).json({ message: 'Order placed', orderId: order._id });
  } catch (err) {
    console.error('createOrder error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });
    return res.json(order);
  } catch (err) {
    console.error('getOrderById error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

