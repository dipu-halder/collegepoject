

const User = require("../models/user-model");
const bcrypt = require("bcryptjs");


// Home Route
const home = async (req, res) => {
  try {
    res.status(200).send("Welcome to using router");
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Register Route
const register = async (req, res) => {
  try {
    console.log(req.body);

    const { username, email, phone, password } = req.body;

    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const userCreated = await User.create({ username, email, phone, password });

    res.status(201).json({
      msg:userCreated,
      token: await userCreated.generateToken(),
      userId: userCreated._id.toString(),
    });
  } catch (error) {
    // console.error(error);
    // res.status(500).json({ msg: "Something went wrong on the server" });
    next(error);
  }
};

//user login logic
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await userExist.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = await userExist.generateToken();
    res.status(200).json({
      msg: "Login successful",
      token,
      userId: userExist._id.toString(),
    });

  } catch (error) {
    next(error);
  }
};


// User logic to send user data
const user = async (req, res) => {
  try {
    const userData = req.user; // Set by authMiddleware
    console.log("User data:", userData);

    return res.status(200).json({ userData });
  } catch (error) {
    console.error(`Error from the user route: ${error}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};




module.exports = { home, register, login, user, };
