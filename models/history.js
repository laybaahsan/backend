const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicineName:{
     type: String,
    default: "Unknown",
  },
  
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },

  searchType: {
    type: String,
    required:true,
    enum: ['manual', 'scan','barcode'],
    default: 'manual'
    
  },
  searchTerm :{
    type:String
  },

  searchQuery: {
    type: String,
    required:true,
  },

   result: {
        type: String, // Store result as JSON string or text
        required: true,
    },
    
  createdAt: {
    type: Date,
    default: Date.now
  },
type: {
   type: String, 
   enum: ['ocr', 'manual_search', 'barcode'],
    required: true 
  }
},
 {
  timestamps: true
}
);

module.exports = mongoose.model('History', HistorySchema);