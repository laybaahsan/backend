const express = require('express');
const router = express.Router();
const userModel = require('../models/user');
const { signup , login , logout , getProfile,showHome,showLogin,showSignup} = require('../controller/user');
const {isAuthenticated, restrictToAuthenticated} = require('../middleware/auth');



// Debug imports
console.log({ signup, login, getProfile, logout }); 



// Routes for rendering pages 
router.get('/signup', showSignup); // Render signup page
router.get('/login', showLogin); // Render login page
router.get('/home',showHome);
//goole login
router.get('/google',
    passport.authenticate('google',{scope: ['profile', 'email'] } )
);

      

// Authentication routes

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', isAuthenticated , restrictToAuthenticated , logout); 
router.get('/profile',isAuthenticated, restrictToAuthenticated , getProfile,); 



module.exports = router;