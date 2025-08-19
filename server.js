const dotenv=require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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
const adminRoutes = require('./routes/admin');
const swaggerRoutes = require ('./routes/swagger');

// Initialize express app
const app = express();

// ===========================Middleware================================//

app.use(cors());
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
  secret: process.env.SESSION_SECRET|| 'session-secret', // Use env variable
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' } //  HTTPS for production
}));


// //Passport authentication
// app.use(passport.initialize());
// app.use(passport.session());


//================================ejs view engine==============================//


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.get('/', (req, res) => res.send('Welcome to MedScan!'));


// Define User Routes
app.use('/user', userRoutes);
app.use('/medicine', medicineRoutes);
app.use('/ocr', medicineRoutes);
app.use('/barcode', medicineRoutes);
app.use('/history', historyRoutes);
app.use('/forgetPassword',forgetPasswordRoutes);
app.use('/admin',adminRoutes);
app.use('/api-docs',swaggerRoutes);


// --- sample route ---
app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Backend is live!' });
});

// Non-blocking database connection
connectDB().catch(err => console.error('Database connection error:', err));

// Error handlers (must be after routes)
app.use((req, res) => {
  res.status(404).send('Not Found');
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {console.log(`Server running on port ${PORT}`)

// }
// );

// if(process.env.NODE_ENV !=='production');{
//   app.listen(PORT,()=>{
//     console.log(`Server is running on port ${PORT}`);
//   })
//}
//export for vercel
 module.exports = app;








