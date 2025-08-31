// controllers/auth-controller.js
const User = require("../models/user-model");

const home = async (req, res) => res.status(200).send("Welcome to auth router");

const register = async (req, res, next) => {
  try {
    const { username, email, phone, password } = req.body;
    if (!username || !email || !phone || !password) return res.status(400).json({ message: "Missing fields" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({ username, email, phone, password });
    const token = user.generateToken();
    return res.status(201).json({ message: "User created", token, userId: user._id.toString() });
  } catch (err) {
    console.error("Registration error:", err);
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    const token = user.generateToken();
    return res.status(200).json({ msg: "Login successful", token, userId: user._id.toString() });
  } catch (err) {
    next(err);
  }
};

const user = async (req, res) => {
  try {
    return res.status(200).json({ userData: req.user });
  } catch (err) {
    console.error("user route error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { home, register, login, user };
