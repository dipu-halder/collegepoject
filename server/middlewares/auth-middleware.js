
// backend/middlewares/auth-middleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/user-model");

function extractToken(headerValue) {
  if (!headerValue) return null;
  const parts = headerValue.split(" ");
  if (parts.length === 1) return parts[0];
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") return parts[1];
  return null;
}

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.header("Authorization") || req.headers["authorization"];
    const token = extractToken(header);
    if (!token) return res.status(401).json({ message: "Unauthorized. Token not provided" });

    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userData = await User.findById(payload.userId).select({ password: 0 });
    if (!userData) return res.status(404).json({ message: "User not found" });

    req.user = userData;
    req.token = token;
    req.userID = userData._id;
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(401).json({ message: "Unauthorized. Invalid token" });
  }
};

module.exports = authMiddleware;
