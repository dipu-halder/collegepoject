const express = require('express');
const router = express.Router(); 
const adminController = require("../controllers/admin-controllers");
const authMiddleware = require("../middlewares/auth-middleware")
const adminMiddleware =require("../middlewares/admin-middleware")

router.route('/users').get(authMiddleware,adminMiddleware, adminController.getAllUser)
router.route('/users/:id').get(authMiddleware, adminMiddleware, adminController.getUserById);
router.route('/users/update/:id').patch(authMiddleware, adminMiddleware, adminController.updateUserId);
router.route('/users/delete/:id').delete(authMiddleware, adminMiddleware, adminController.deleteUserBYId);

router.route('/contacts').get(authMiddleware, adminMiddleware, adminController.getAllcontacts);
router.route('/contacts/delete/:id').delete(authMiddleware, adminMiddleware, adminController.deleteContactBYId);

module.exports = router;