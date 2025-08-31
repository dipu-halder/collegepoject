// const jwt = require("jsonwebtoken");
// const User = require("../models/user-model");

// const authMiddleware = async (req, res, next) => {
//   // const token = req.header("Authorization");

//   // if (!token) {
//   //   return res.status(401).json({ message: "Unauthorized. Token not provided" });
//   // }

//   // // Remove 'Bearer ' from the token
//   // const jwtToken = token.replace("Bearer", "").trim();
//   // console.log("Token from auth middleware:", token);
//   const token = req.header("Authorization");

// if (!token) {
//   return res.status(401).json({ message: "Unauthorized. Token not provided" });
// }

// const parts = token.split(" ");
// if (parts.length !== 2 || parts[0] !== "Bearer") {
//   return res.status(401).json({ message: "Unauthorized. Invalid token format" });
// }

// const jwtToken = parts[1]; // Only the actual token part
// console.log("Token from auth middleware:", jwtToken);

//   try {
//     const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);

//     const userData = await User.findOne({ email: isVerified.email }).select({password: 0,});

//     if (!userData) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     console.log(userData);
    

//     req.user = userData;
//     req.token = jwtToken;
//     req.userID = userData._id;

//     next();
//   } catch (error) {
//     console.error("JWT verification error:", error);
//     return res.status(401).json({ message: "Unauthorized. Invalid token" });
//   }
// };

// module.exports = authMiddleware;   
// middlewares/auth-middleware.js
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
