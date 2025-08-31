// // const express = require('express');
// // const router = express.Router(); 
// // const adminController = require("../controllers/admin-controllers");
// // const authMiddleware = require("../middlewares/auth-middleware")
// // const adminMiddleware =require("../middlewares/admin-middleware")

// // router.route('/users').get(authMiddleware,adminMiddleware, adminController.getAllUser)
// // router.route('/users/:id').get(authMiddleware, adminMiddleware, adminController.getUserById);
// // router.route('/users/update/:id').patch(authMiddleware, adminMiddleware, adminController.updateUserId);
// // router.route('/users/delete/:id').delete(authMiddleware, adminMiddleware, adminController.deleteUserBYId);

// // router.route('/contacts').get(authMiddleware, adminMiddleware, adminController.getAllcontacts);
// // router.route('/contacts/delete/:id').delete(authMiddleware, adminMiddleware, adminController.deleteContactBYId);

// // module.exports = router; 
// //   const express = require('express');
// // const router = express.Router(); 
// // const adminController = require("../controllers/admincontrollers");
// // const authMiddleware = require("../middlewares/auth-middleware")
// // const adminMiddleware = require("../middlewares/admin-middleware");

// // router.route('/users').get(authMiddleware, adminMiddleware, adminController.getAllUser);
// // router.route('/users/:id').get(authMiddleware, adminMiddleware, adminController.getUserById);
// // router.route('/users/update/:id').patch(authMiddleware, adminMiddleware, adminController.updateUserId);
// // router.route('/users/delete/:id').delete(authMiddleware, adminMiddleware, adminController.deleteUserBYId);

// // router.route('/contacts').get(authMiddleware, adminMiddleware, adminController.getAllcontacts);
// // router.route('/contacts/delete/:id').delete(authMiddleware, adminMiddleware, adminController.deleteContactBYId);


// // // ✅  orders
// // router.route('/orders').get(authMiddleware, adminMiddleware,adminController.getAllOrders);
// // router.route('/orders/:id/status').patch(authMiddleware, adminMiddleware,  adminController.updateOrderStatus);




// // // List pending riders
// // router.route('/pending').get(authMiddleware, adminMiddleware, adminController.getPendingRiders);


// // // Get all riders
// // router.route('/all').get(authMiddleware, adminMiddleware, adminController.getAllRiders);


// // // Approve rider
// // router.route('/approve/:id').patch(authMiddleware, adminMiddleware, adminController.approveRider);


// // // Reject rider
// // router.route('/reject/:id').delete(authMiddleware, adminMiddleware, adminController.rejectRider);



// // module.exports = router;
//  // router/admin-router.js
// // router/admin-router.js
// const express = require('express');
// const router = express.Router();
// const adminController = require("../controllers/admincontrollers");
// const authMiddleware = require("../middlewares/auth-middleware");
// const adminMiddleware = require("../middlewares/admin-middleware");

// // 🔎 TEMP: quick health check to confirm this router is actually mounted
// router.get('/ping', (req, res) => {
//   res.json({ ok: true, at: '/api/admin', router: 'admin-router' });
// });

// // ===== Users =====
// router.get('/users', authMiddleware, adminMiddleware, adminController.getAllUser);
// router.get('/users/:id', authMiddleware, adminMiddleware, adminController.getUserById);
// router.patch('/users/update/:id', authMiddleware, adminMiddleware, adminController.updateUserId);
// router.delete('/users/delete/:id', authMiddleware, adminMiddleware, adminController.deleteUserBYId);

// // ===== Contacts =====
// router.get('/contacts', authMiddleware, adminMiddleware, adminController.getAllcontacts);
// router.delete('/contacts/delete/:id', authMiddleware, adminMiddleware, adminController.deleteContactBYId);

// // ===== Orders =====
// router.get('/orders', authMiddleware, adminMiddleware, adminController.getAllOrders);
// router.patch('/orders/:id/status', authMiddleware, adminMiddleware, adminController.updateOrderStatus);

// // NEW: Assign rider to order
// router.patch('/orders/:id/assign', authMiddleware, adminMiddleware, adminController.assignRider);

// // ===== Riders =====
// router.get('/Riders/pending', authMiddleware, adminMiddleware, adminController.getPendingRiders);
// router.get('/Riders/all', authMiddleware, adminMiddleware, adminController.getAllRiders);
// router.patch('/Riders/approve/:id', authMiddleware, adminMiddleware, adminController.approveRider);
// router.delete('/Riders/reject/:id', authMiddleware, adminMiddleware, adminController.rejectRider);

// module.exports = router;

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
