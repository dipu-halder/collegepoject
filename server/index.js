
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
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDb = require("./utils/db");

const authRoute = require("./router/auth-router");
const contactRoute = require("./router/contact-router");
const adminRoute = require("./router/admin-router");
const orderRoute = require("./router/order-router");
const errorMiddleware = require('./middlewares/error-middleware');

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://heartfelt-griffin-946104.netlify.app",
    "https://collegepoject-erpw.vercel.app/",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],
  credentials: true,
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Debugging logs
app.use((req, res, next) => {
  console.log(`Request Origin: ${req.headers.origin}`);
  console.log(`${req.method} ${req.url}`);
  next();
});

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/from", contactRoute);
app.use("/api/admin", adminRoute);
app.use("/api/order", orderRoute);

// Error handler
app.use(errorMiddleware);

// Start Server
const PORT = process.env.PORT || 5000;
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server is running at port: ${PORT}`);
  });
});

