// router/riderRoutes.js
const express = require("express");
const router = express.Router();
const riderController = require("../controllers/riderController");
const riderAuth = require("../middlewares/rider-auth-middleware");
const authMiddleware = require("../middlewares/auth-middleware");
const adminMiddleware = (req, res, next) => { // placeholder admin check
  if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin required" });
  next();
};

router.get("/me", authMiddleware, riderController.getMyRiderProfile);
router.post("/register", authMiddleware, riderController.registerRider);

router.get("/pending", authMiddleware, adminMiddleware, riderController.getPendingRiders);
router.get("/all", authMiddleware, adminMiddleware, riderController.getAllRiders);
router.patch("/approve/:riderId", authMiddleware, adminMiddleware, riderController.approveRider);
router.delete("/reject/:riderId", authMiddleware, adminMiddleware, riderController.rejectRider);

// rider-auth protected
router.post("/orders/:id/accept", riderAuth, riderController.acceptOrder);
router.post("/orders/:id/reject", riderAuth, riderController.rejectOffer);

router.get("/orders", riderAuth, riderController.getRiderOrders);
router.get("/orders/history", riderAuth, riderController.getRiderHistory);
router.patch("/orders/:id/mark-delivered", riderAuth, riderController.markDelivered);

// Assigned Orders
router.get("/my-orders", riderAuth, riderController.getMyOrders);

// Completed Orders
router.get("/completed-orders", riderAuth, riderController.getCompletedOrders);

// Update Rider Live Location (lat/lng)
router.post("/update-location", riderAuth, riderController.updateLocation);

// Get Rider Location (for customer to track)
router.get("/:riderId/location", authMiddleware, riderController.getRiderLocation);


module.exports = router;
