
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const connectDb = require("./utils/db");

// Routers
const authRoute = require("./router/auth-router");
const contactRoute = require("./router/contact-router");
const adminRoute = require("./router/admin-router");
const orderRoute = require("./router/order-router");
const riderRoute = require("./router/riderRoutes");

const initSocket = require("./utils/initSocket");

const app = express();
const server = http.createServer(app);

// ✅ CORS setup
const corsOptions = {
  origin: [
    "http://localhost:5173", // local frontend
    "https://heartfelt-griffin-946104.netlify.app",
    "https://collegepoject-erpw.vercel.app/",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoute);
app.use("/api/contact", contactRoute);
app.use("/api/admin", adminRoute);
app.use("/api/order", orderRoute);
app.use("/api/rider", riderRoute);
console.log("✅ All routes mounted successfully");

// ✅ Socket.io
const io = new Server(server, { cors: corsOptions });
app.set("io", io);
initSocket(io);

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("🚀 Backend up & running!");
});

// ✅ Start server only after DB connection
const PORT = process.env.PORT || 5000;
connectDb()
  .then(() => {
    server.listen(PORT, () =>
      console.log(`✅ Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ DB connection failed, server not started", err);
    process.exit(1);
  });
