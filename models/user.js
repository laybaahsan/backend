const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({

  FirstName: {
    type: String,    
    required: true
  },
LastName: {
    type: String,    
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 
      'Please enter a valid email']
  },

  password: {
    type: String,
    required: function(){
  
    },
    minlength :8
  },

  createdAt: {
    type: Date,
    default: Date.now
  }, 

  role:{
        type:String,
        required:true,
        enum: ['admin','visitor','user'],
        default :'user',
    },
  refreshTokens: [
    { token: String,
     }
    ],

     isGuest:{ 
        type: Boolean,
         default: false
     },

     resetCode:{
         type:String
     }, 

     resetCodeExpires:{
         type:Date
     },

     //forgot password
   resetToken: String,
   resetTokenExpiry: Date,
  },
  
 {
  timestamps: true
}
);


module.exports = mongoose.model('User', UserSchema);








  
   
   