

// backend/router/admin-router.js
const express = require('express');
const router = express.Router();
const adminController = require("../controllers/admincontrollers");
const authMiddleware = require("../middlewares/auth-middleware");
const adminMiddleware = require("../middlewares/admin-middleware");

// health check
router.get('/ping', (req, res) => {
  res.json({ ok: true, at: '/api/admin', router: 'admin-router' });
});

// Users
router.route('/users').get(authMiddleware, adminMiddleware, adminController.getAllUser);
router.route('/users/:id').get(authMiddleware, adminMiddleware, adminController.getUserById);
router.route('/users/update/:id').patch(authMiddleware, adminMiddleware, adminController.updateUserId);
router.route('/users/delete/:id').delete(authMiddleware, adminMiddleware, adminController.deleteUserBYId);

// Contacts
router.route('/contacts').get(authMiddleware, adminMiddleware, adminController.getAllcontacts);
router.route('/contacts/delete/:id').delete(authMiddleware, adminMiddleware, adminController.deleteContactBYId);

// Orders
router.route('/orders').get(authMiddleware, adminMiddleware, adminController.getAllOrders);
router.route('/orders/:id/status').patch(authMiddleware, adminMiddleware, adminController.updateOrderStatus);

// Assign / Unassign Rider (direct)
router.route('/orders/:id/assign-rider').patch(authMiddleware, adminMiddleware, adminController.assignRider);

// Offer riders (ask riders to accept/reject)
router.route('/orders/:id/offer-riders').post(authMiddleware, adminMiddleware, adminController.offerRiders);

// Riders
router.route('/Riders/pending').get(authMiddleware, adminMiddleware, adminController.getPendingRiders);
router.route('/Riders/all').get(authMiddleware, adminMiddleware, adminController.getAllRiders);
router.route('/Riders/approve/:id').patch(authMiddleware, adminMiddleware, adminController.approveRider);
router.route('/Riders/reject/:id').delete(authMiddleware, adminMiddleware, adminController.rejectRider);

module.exports = router;
