
// require('dotenv').config();
// const express = require("express") 
// const app = express(); 
// const cors =require("cors")
// const authroute =require("./router/auth-router")
// const contactroute = require("./router/contact-model")
// const adminRoute = require("./router/admin-router")
// const connectDb = require("./utils/db");
// const errorMiddleware = require('./middlewares/error-middleware');

// // const corsOptions ={
// //    origin: [
// //     "http://localhost:5173",
// //     "https://heartfelt-griffin-946104.netlify.app",
// //    "https://collegepoject-erpw.vercel.app/",

// //   ],
// //    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],

// //     credentials: true // if you use cookies or auth headers
// // };
// // const allowedOrigins = [
// //   "http://localhost:5173",
// //   "https://heartfelt-griffin-946104.netlify.app",
// //   "https://collegepoject-erpw.vercel.app"
// // ];

// // const corsOptions = {
// //   origin: function (origin, callback) {
// //     if (!origin || allowedOrigins.includes(origin)) {
// //       callback(null, true);
// //     } else {
// //       callback(new Error("Not allowed by CORS"));
// //     }
// //   },
// //   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],
// //   credentials: true
// // };

// // app.use(cors(corsOptions));

// app.use(cors({
//   origin: "*",
//   methods: ["GET", "POST", "OPTIONS"],
// }));
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

// app.use(errorMiddleware)

// const PORT = process.env.PORT || 5000;

// connectDb().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server is running at port: ${PORT}`);
//   });
// });

require('dotenv').config();
const express = require("express");
const cors = require("cors");
const authroute = require("./router/auth-router");
const contactroute = require("./router/contact-model");
const adminRoute = require("./router/admin-router");
const connectDb = require("./utils/db");
const errorMiddleware = require('./middlewares/error-middleware');

const app = express();

// Remove duplicate declaration of cors here

const allowedOrigins = [
  "http://localhost:5173",
  "https://heartfelt-griffin-946104.netlify.app",
  "https://collegepoject-erpw.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.options("*", cors(corsOptions));

// Request logging for debugging
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  console.log("Origin Header:", req.headers.origin);
  next();
});

// Body Parser
app.use(express.json());

// Routes
app.use("/api/auth", authroute);
app.use("/api/from", contactroute);
app.use("/api/admin", adminRoute);

// Error Middleware
app.use(errorMiddleware);

// Start Server
const PORT = process.env.PORT || 5000;

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
