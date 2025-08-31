// router/auth-router.js
const express = require("express");
const router = express.Router();
const authcontroller = require("../controllers/auth-controller");
const authMiddleware = require("../middlewares/auth-middleware");

router.get("/", authcontroller.home);
router.post("/register", authcontroller.register);
router.post("/login", authcontroller.login);
router.get("/user", authMiddleware, authcontroller.user);

module.exports = router;
