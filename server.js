const dotenv=require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const cookieParser=require('cookie-parser');
const session = require('express-session');


//import DB connection
const connectDB = require('./config/db');

//import routes
const userRoutes = require('./routes/user');
const medicineRoutes = require('./routes/medicine');
const historyRoutes = require('./routes/history');
const forgetPasswordRoutes=require('./routes/forgetPassword');



// Initialize express app
const app = express();

const cors = require('cors');
const  allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:8081',
 ] .filter(Boolean);


 app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow requests like Postman
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
 console.warn("Blocked CORS request from:", origin);
      callback(new Error("CORS not allowed from this origin"));
    }
  },
  credentials: true, // allow cookies/sessions
}));


app.use(express.static("public"));

//JSON and URL parsing
app.use(express.json( {
  strict :true,
  limit : '50mb',
  verify :(req,res,buf)=>{
    if (!buf.length){
      req.body = {};//empty objects instead of throughing errors
    }
  }
}
));


app.use(express.urlencoded({ extended: true , limit :'50mb' }));
app.use(cookieParser());
app.use(session({            //Session Management
  secret: process.env.SESSION_SECRET, // Use env variable
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' } //  HTTPS for production
}));



//================================ejs view engine==============================//


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.get('/', (req, res) => res.send('Welcome to MedScan App '));


// Define User Routes
app.use('/user', userRoutes);
app.use('/medicine', medicineRoutes);
app.use('/ocr', medicineRoutes);
app.use('/history', historyRoutes);
app.use('/forgetPassword',forgetPasswordRoutes);






// --- sample route ---
app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Backend is live!' });
});

// Non-blocking database connection
connectDB().catch(err => console.error('Database connection error:', err));


//export for vercel
 module.exports = app;








