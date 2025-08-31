// backend/middlewares/rider-auth-middleware.js
const jwt = require("jsonwebtoken");
const Rider = require("../models/Rider");

function extractToken(headerValue) {
  if (!headerValue) return null;
  const parts = headerValue.split(" ");
  if (parts.length === 1) return parts[0];
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") return parts[1];
  return null;
}

const riderAuth = async (req, res, next) => {
  try {
    const header = req.header("Authorization") || req.headers["authorization"];
    const token = extractToken(header);
    if (!token) return res.status(401).json({ message: "Unauthorized. Token missing" });

    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Try both: token might contain riderId or userId
    let rider = null;
    if (payload.riderId) {
      rider = await Rider.findById(payload.riderId);
    }
    // sometimes payload.userId is actually the Rider._id OR a linked User id
    if (!rider && payload.userId) {
      // try treat userId as Rider._id
      rider = await Rider.findById(payload.userId);
    }
    if (!rider && payload.userId) {
      // try find rider by linking user field
      rider = await Rider.findOne({ user: payload.userId });
    }

    if (!rider) return res.status(404).json({ message: "Rider not found" });

    req.rider = rider;
    req.riderTokenPayload = payload;
    next();
  } catch (err) {
    console.error("Rider auth error:", err);
    return res.status(401).json({ message: "Unauthorized. Invalid token" });
  }
};

module.exports = riderAuth;
