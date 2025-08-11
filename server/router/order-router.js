// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { createOrder, getOrderById } = require('../controllers/orderController');

router.post('/', createOrder);              // POST /api/order
router.get('/:id', getOrderById);           // GET  /api/order/:id

module.exports = router;
