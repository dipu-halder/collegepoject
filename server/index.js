
// require('dotenv').config();
// const express = require("express") 
// const app = express(); 
// const cors =require("cors")
// const authroute =require("./router/auth-router")
// const contactroute = require("./router/contact-router")
// const adminRoute = require("./router/admin-router")
// const orderRoute = require("./router/order-router");
// const connectDb = require("./utils/db");


// const errorMiddleware = require('./middlewares/error-middleware');

// const corsOptions ={
//    origin: [
//     "http://localhost:5173",
//     "https://heartfelt-griffin-946104.netlify.app",
//    "https://collegepoject-erpw.vercel.app/",

//   ],
//    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],

//     credentials: true // if you use cookies or auth headers
// };


// app.use(cors(corsOptions));



// // app.use(cors(corsOptions));
// app.use((req, res, next) => {
//   console.log("Request Origin:", req.headers.origin);
//   next();
// });  
 
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.url}`);
//   next();
// });
// app.use(express.json());

// app.use("/api/auth", authroute);
// app.use("/api/from", contactroute)
  
// app.use("/api/admin", adminRoute)
// app.use("/api/order", orderRoute);


// app.use(errorMiddleware)

// const PORT = process.env.PORT || 5000;

// connectDb().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server is running at port: ${PORT}`);
//   });
// });


// require('dotenv').config();
// const express = require("express");
// const http = require("http");
// const cors = require("cors");
// const { Server } = require("socket.io");

// const authroute = require("./router/auth-router");
// const contactroute = require("./router/contact-router");
// const adminRoute = require("./router/admin-router");
// // const orderRoute = require("./router/order-router"); // ✅ Corrected path
// const riderRoute = require("./router/rider-router");
// const connectDb = require("./utils/db");
// const errorMiddleware = require('./middlewares/error-middleware');

// const app = express();
// const server = http.createServer(app); // ✅ Create HTTP server for socket.io

// // ✅ Setup Socket.IO server
// const io = new Server(server, {
//   cors: {
//     origin: [
//       "http://localhost:5173",
//       "https://heartfelt-griffin-946104.netlify.app",
//       "https://collegepoject-erpw.vercel.app/",
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],
//     credentials: true
//   }
// });

// // ✅ Make io accessible in controllers
// app.set('io', io);

// // ✅ Socket.io events
// // index.js me io.on("connection") ke andar yeh add karo:

// io.on("connection", (socket) => {
//   console.log("🔌 New client connected:", socket.id);

//   // ✅ Rider sends update
//   socket.on("rider:update", (data) => {
//     console.log("📡 Rider update received:", data);

//     // 🔔 Broadcast to all clients (customer tracking page)
//     io.emit(`order:update:${data.orderId}`, data);
//   });

//   socket.on("disconnect", () => {
//     console.log("❌ Client disconnected:", socket.id);
//   });
// });


// const corsOptions = {
//   origin: [
//     "http://localhost:5173",
//     "https://heartfelt-griffin-946104.netlify.app",
//     "https://collegepoject-erpw.vercel.app/",
//   ],
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],
//   credentials: true
// };

// app.use(cors(corsOptions));

// app.use((req, res, next) => {
//   console.log("Request Origin:", req.headers.origin);
//   next();
// });

// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.url}`);
//   next();
// });

// app.use(express.json());

// app.use("/api/auth", authroute);
// app.use("/api/from", contactroute);
// app.use("/api/admin", adminRoute);
// app.use("/api/order", orderRoute); // ✅ Order routes with socket support
// // app.use("/api/admin", adminOrderRoute);

// app.use("/api/rider",  riderRoute);


// app.use(errorMiddleware);

// const PORT = process.env.PORT || 5000;

// connectDb().then(() => {
//   server.listen(PORT, () => { // ✅ Listen on HTTP server, not app
//     console.log(`🚀 Server is running at port: ${PORT}`);
//   });
// });
// backend/server.js (or index.js / app.js - integrate accordingly)
// server.js (or app.js)
// index.js
// index.js
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
    "https://yourfrontend.netlify.app", // netlify deploy
    "https://yourfrontend.vercel.app",  // vercel deploy
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
