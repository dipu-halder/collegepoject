
// models/user-model.js
// models/user-model.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userschema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  phone:    { type: String, required: true },
  password: { type: String, required: true },
  isAdmin:  { type: Boolean, default: false },
}, { timestamps: true });

userschema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userschema.methods.comparePassword = async function(password){
  return bcrypt.compare(password, this.password);
};

userschema.methods.generateToken = function () {
  return jwt.sign({ userId: this._id.toString(), email: this.email, isAdmin: this.isAdmin }, process.env.JWT_SECRET_KEY, { expiresIn: "30d" });
};

const User = mongoose.models.User || mongoose.model("User", userschema);
module.exports = User;
