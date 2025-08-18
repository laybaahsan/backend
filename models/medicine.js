const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name:  {
    type: String,
    required: true,
    trim: true,
    index: true
  },

  genericName:{
    type: String,
    trim: true
  },

   brand:{ 
      type: String
     },

    addedBy:{
       type: String,
        required: true
       },

  manufacturer:  {
    type: String,
    trim: true
  },
  DrugBankID:{
    type:String,
    required:true
  },
  Modality:{
   type :String,
   required :true
},

  description:  {
    type: String
  },

  dosage: {
    type: String
  },

  usageInstructions: {
    type: String
  },

  sideEffects: {
    type:String
  },

  contraindications: {
    type:String
  },

  prescriptionRequired:  {
    type: Boolean,
    default: false
  },

  barcodeNumber:{
    type: String,
    trim: true,
    index: true
  },

  createdAt:  {
    type: Date,
    default: Date.now
  },

   updatedAt:  {
     type: Date, 
     default: Date.now
     },

  expiryDate: { 
    type: Date, 
    required: true
   },
   formula:{
    type:String,
    required:true
   },
},
 {
  timestamps: true
}
);

// Text index for search functionality
MedicineSchema.index({ 
  name: 'text', 
  genericName: 'text', 
  manufacturer: 'text',
  description: 'text'
});

module.exports = mongoose.model('Medicine', MedicineSchema, 'medicines');