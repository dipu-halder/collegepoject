// scripts/linkRidersToUsers.js
require('dotenv').config();
const mongoose = require('mongoose');
const Rider = require('../backend/models/Rider'); // adjust path
const User = require('../backend/models/user-model');

async function run() {
  const MONGO = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!MONGO) throw new Error("Set MONGO_URI in .env");
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });

  const riders = await Rider.find({ $or: [{ user: { $exists: false } }, { user: null }] });
  console.log(`Found ${riders.length} rider(s) without user field.`);

  for (const r of riders) {
    const phone = (r.phone || "").toString();
    if (!phone) {
      console.log(`Skipping ${r._id} — no phone`);
      continue;
    }

    const user = await User.findOne({ $or: [{ phone }, { mobile: phone }, { email: phone }] });
    if (user) {
      r.user = user._id;
      await r.save();
      console.log(`Linked rider ${r._id} -> user ${user._id} (phone ${phone})`);
    } else {
      console.log(`No user found for rider ${r._id} (phone ${phone})`);
    }
  }

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch(err => { console.error(err); process.exit(1); });
