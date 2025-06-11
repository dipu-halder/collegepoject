
require('dotenv').config();
const express = require("express") 
const app = express(); 
const cors =require("cors")
const authroute =require("./router/auth-router")
const contactroute = require("./router/contact-model")
const adminRoute = require("./router/admin-router")
const connectDb = require("./utils/db");
const errorMiddleware = require('./middlewares/error-middleware');

const corsOptions ={
   origin: [
    "http://localhost:3000",
    "https://heartfelt-griffin-946104.netlify.app",
   "https://collegepoject-erpw.vercel.app/",

  ],
    methods:"GET, POST, put, DELETE, PATCH, HEAD",
    credentials: true // if you use cookies or auth headers
};
app.use(cors(corsOptions));
 
app.use(express.json());

app.use("/api/auth", authroute);
app.use("/api/from", contactroute)
  
app.use("/api/admin", adminRoute)

app.use(errorMiddleware)

const PORT = process.env.PORT || 5000;

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at port: ${PORT}`);
  });
});
