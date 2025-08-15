// // backend/routes/orderRoutes.js
// const express = require('express');
// const router = express.Router();
// const { createOrder, getOrderById } = require('../controllers/orderController');

// router.post('/', createOrder);              // POST /api/order
// router.get('/:id', getOrderById);           // GET  /api/order/:id

// module.exports = router;
const express = require("express");
const router = express.Router();
const { createOrder, getUserOrders, getOrderById } = require("../controllers/orderController");
const authMiddleware = require("../middlewares/auth-middleware");

// Place new order
router.post("/", authMiddleware, createOrder);

// Get user order history
router.get("/history", authMiddleware, getUserOrders);

// Get single order details
router.get("/:id", authMiddleware, getOrderById);

module.exports = router;
