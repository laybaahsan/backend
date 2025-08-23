const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const userModel = require('../models/user');

// ---------- Helper: Generate JWT ----------

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secure-secret-key-here',
   

    { expiresIn: '1d' } 
  );
  
};

//render pages

const showHome=( req , res) =>{
  const isAuthenticated= !req.user&& req.user.role !=='visitor';
  res.render('home',{isAuthenticated, error : null});
};


const showSignup=(req,res)=>{
    res.render('signup',{error:null});
};

const showLogin=(req,res)=>{
    res.render('login',{error:null});
};

//==========Signup handler=============//

const signup = async (req,res)=>{
    try{
        const { FirstName, LastName , email , password , role } = req.body;

        // 1.Validate input
     if (!FirstName || !LastName || !email || !password) {
    
    const error = "All fields are required";
    return req.accepts('json')
    ? res.status(400) .json({error})
    : res.status(400) .render('signup',{error});

 
  };

       // 2.check if user already exists

      const existingUser=await userModel.findOne({email});
        if (existingUser){
    
      const error = 'User already exists';
      return req.accepts('json')
        ? res.status(400).json({ error })
        : res.status(400).render('signup', { error });
    };

  // hashed  apssword
    const hashedPassword = await bcrypt.hash(password, 10);

    //validate roles
    const validRoles = ['user','visitor','admin'];
    const userRole = validRoles.includes(role) ? role :'user'; 
         
    
    // 4.  Create  new user
    const createdUser = await userModel.create({
       FirstName,
       LastName,
       email,
       password: hashedPassword,
       role : userRole,
    }
      );
    console.log("User saved in DB:", createdUser);

    //5. Generate JWT token
   const token = generateToken(createdUser);

    
    
   // 6 Responce

  if( req.accepts('json')){
    return res.status(201).json({
      message: 'User Signup Successfully',
      token,
      user:{
      id:createdUser ._id,//prperties
      FirstName:createdUser.FirstName,
      LastName:createdUser.LastName,
      email:createdUser.email,
      password:createdUser.password,
      role: createdUser.role,
    },
          
 });

  } else 
    {
      // Response for Browser (EJS)
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 , //1 day
      });

      return res.redirect('/user/login');
    }
  }
catch(err)
{
  
    console.error('Signup error:', err);
    const error = 'Server error during signup';
    return req.accepts('json')
      ? res.status(500).json({ error })
      : res.status(500).render('signup', { error });
  }
 };

//============login handler=============//
const login = async (req, res) => {
   try {
     const { email, password } = req.body;

     // 1.Validate Input
      if (!email || !password) {
        const error= 'Email and password required';
        return req.accepts('json')
         ?res.status(400).json({error}):
         res.status(400).render('login', { error});
    }

    // 2. Check if user exists
     const user = await userModel.findOne({ email });
 if (!user){

    const error = 'User with this email not found';
      return req.accepts('json')
        ? res.status(401).json({ error })
        : res.status(401).render('login', { error });
    }
  

     //3. verify password
     const isMatch = await bcrypt.compare(password, user.password);//find password from user object
     if (!isMatch) { 

    const error = 'Invalid credentials';
      return req.accepts('json')
        ? res.status(401).json({ error })
        : res.status(401).render('login', { error });
    }

    //4 Generate token
     const token = generateToken(user);

   
    // 5. Responce

    if (req.accepts('json')) {
      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
         id: user._id,
        FirstName: user.FirstName,
        LastName:user.LastName, 
        email: user.email,
        role : user.role
        },
    });

    } else {
      res.cookie('token',token,{
        httpOnly : true,
       secure :process.env.NODE_ENV === 'production',
       sameSite : 'strict'   ,
       maxAge : 60 * 60 * 1000 ,       //1 hr
    });
      return res.redirect("/home");
    }

   }catch (err) {
    console.error('Login error:', err);
    const error = 'Server error during login';
    return req.accepts('json')
      ? res.status(500).json({ error })
      : res.status(500).render('login', { error });
  }
};

//==============get profile==============//

const getProfile = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await userModel.findById(req.user.id).select('-password');
    if (!user){
      return res.status(400).json({error: 'User not found'});
    
  }
    res.json({
      success: true,
      data:user // it gives al data of user
    });

  } catch (error) {
    console.log('Get profile error',error);
    res.status(500).json({ message: 'Server error' });
  }
};

//==============logout handler================//
const logout=(req,res)=>{
    res.clearCookie("token",{
      httpOnly:true,
      secure: process.env.NODE_ENV==="production",
      sameSite :'strict'
    });

    if(req.accepts('json')){
      return res.status(200).json({message:'logged out successfully'});  
      }else{
        return res.redirect("/user/login");
      }
};




module.exports = {
    showHome,
    showSignup,
    showLogin,
    signup,
    login,
    logout,
    getProfile,
    
};



