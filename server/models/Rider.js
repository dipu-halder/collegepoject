// backend/models/Rider.js
const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  vehicle: {
    type: { type: String, default: "" },
    regNo: { type: String, default: "" },
  },
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },

  // last known simple lat/lng snapshot (used for quick UI)
  lastLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    heading: { type: Number, default: 0 },
    speed: { type: Number, default: 0 },
    updatedAt: { type: Date, default: null },
  },

  // optional: GeoJSON 'location' for spatial queries (useful later)
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
}, { timestamps: true });

// create 2dsphere index if you will use location geo-queries
riderSchema.index({ location: "2dsphere" });

module.exports = mongoose.models.Rider || mongoose.model("Rider", riderSchema);
