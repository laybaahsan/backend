const jwt = require('jsonwebtoken');
const User=require('../models/user');


const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // id, email, role
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

module.exports = { protect, isAdmin };

const isAuthenticated = async (req, res, next) => {
  
  try {
     // Token le lo ya to cookies se, ya headers se
    const token= req.cookies ?.token || req.headers.authorization?.split(" ")[1];
    console.log("Cookie token:",token);

    //agr token nhi mila to unauthorized
    if (!token) {
      return res.status(401).json({message:'Unauthorized: No token provided'});
    }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded JWT:',decoded);
//find user
      const user = await User.findById(decoded.id);
      console.log('Found User', user);

      if (!user) {
         return res.status(401).json({ message:'Unauthorized : User not found' });
      }
      req.user = user;
      next();

  } catch (err) {
    console.log('Auth error:',err.message);
return res.status(401).json({message:"Unauthorized : Invalid token"});
  
  }
};

//=============================================================================//

// Restrict to authenticated users (no history for visitors)
const restrictToAuthenticated = (req, res, next) => {
  if (!req.user || (req.user.isGuest === true)) {
    return res.status(401).render('login', { error: 'Please log in to access this feature' });
  }
  next();
};


//=============================================================================//

// Validation middleware for search
const validateSearch = (req, res, next) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
  }
  next();
};

// Validation middleware for scan
const validateImageData = (req, res, next) => {
  const { imageData } = req.body;
  if (!imageData || typeof imageData !== 'string') {
      return res.status(400).json({ error: 'Valid image data is required' });
    }
  next();
};

module.exports = {
  protect,
  isAdmin,
  isAuthenticated,
  restrictToAuthenticated,
  validateImageData,
  validateSearch,
};