const Medicine = require('../models/medicine');
const History = require('../models/history');
const Tesseract = require('tesseract.js');
const { BrowserMultiFormatReader } = require('@zxing/library');


// Save history 
async function saveHistory(req,searchType ,searchTerm , medicine){
   if(req.user?._id && req.user.role !== 'visitor'){
         try{
           const history = await History.create({
            userId  :req.user._id,
            medicineId: medicine ?._id ||null,
            searchType,
            searchTerm: searchTerm || '',
            createdAt:new Date()
            
        });
        
         console.log("History saved:", history);
         
    } catch(err) {
      console.log('History save error', err);
    }
  } else {
    console.log("User not logged in or role is visitor, history not saved");
  
     } 
  }
      

// Helper: Check if request body is empty
// function isBodyEmpty(req) {
//   return !req.body || Object.keys(req.body).length === 0;
// }


// Manual Search
const manualSearch = async (req, res) => {
  try {

//  if (isBodyEmpty(req)) {
//       return res.status(400).json({ error: 'Request body is missing' });
//     }

    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Medicine name is required and must be a non-empty string' });
    }
    const userId = req.user ? req.user._id:null;
    const medicine = await Medicine.findOne({ name: new RegExp(name.trim(), 'i') });

    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    await saveHistory(req, 'manual',name.trim(),medicine);

    if(req.accepts('json')){
   res.status(200).json(medicine);
} else {
  res.render('searchResults', {query :name.trim(),result:medicine});
   }
} catch (err) {
    console.error('Manual Search Error:', err);
    //res.status(500).json({ error: 'Server error' });
    const error = 'Something went wrong during manual search';
    return req.accepts('json')
      ? res.status(500).json({ error })
      : res.status(500).render('searchResults', { error });
  }
};


// OCR Scan
const scanMedicineImage = async (req, res) => {
  try {
     if (isBodyEmpty(req)) {
      return res.status(400).json({ error: 'Request body is missing' });
    }
    
    const { imageData } = req.body;
    if (!imageData || typeof imageData !== 'string') {
      return res.status(400).json({ error: 'Valid image data is required' });
    }

    const buffer = Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const result = await Tesseract.recognize(buffer, 'eng');
    const extractedText = result.data.text.toLowerCase().trim();

    if (!extractedText) {
      return res.status(400).json({ error: 'No text detected in image' });
    }

    const firstLine = extractedText.split('\n').map(line => line.trim()).filter(Boolean)[0];//First non-empty line
    const medicine = await Medicine.findOne({ name: new RegExp(firstLine || extractedText, 'i') });


    await saveHistory(req, 'ocr',extractedText, medicine);

if(req.accepts('json')){
     res.status(200).json(medicine ||{
      name :'Unknown',
      description :'No description found'
     });
} else {
  res.render('searchResults', {query :extractedText,result:medicine});
   }

  }catch (err) {
    console.error('OCR Scan Error:', err);
    const error = 'Something went wrong during OCR search';
    return req.accepts('json')
      ? res.status(500).json({ error })
      : res.status(500).render('searchResults', { error });
  }
};

// Barcode Scan
const barcodeScan = async (req, res) => {
  try {
     if (isBodyEmpty(req)) {
      return res.status(400).json({ error: 'Request body is missing' });
    }
    
    const { imageData } = req.body;
    //if (!imageData || !imageData.match(/^data:image\/[a-z]+;base64,/))
   if( !imageData || typeof imageData !== 'string')
       {
      return res.status(400).json({ error: 'Valid barcode image data is required' });
    }


    const buffer = Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const reader = new BrowserMultiFormatReader();
    try {
      const result = await reader.decodeFromBuffer(buffer);
      const barcode = result.getText();

      const medicine = await Medicine.findOne({ barcode });
      if (!medicine) {
        return res.status(404).json({ error: 'Medicine not found' });
      }

      
      await saveHistory(req, 'barcodeScan',barcode,medicine);
if(req.accepts('json')){
     res.status(200).json({
     medicine : medicine.name|| 'Unknown',
    description :medicine.description || 'No description found',
  });
} else {
        res.render('searchResults', { query: barcode, result: medicine });
      }
    } catch {
      return res.status(400).json({ error: 'No barcode detected' });
    } finally {
      reader.reset();
    }
  } catch (err) {
    console.error('Barcode Scan Error:', err);
    const error = 'Something went wrong during Barcode search';
    return req.accepts('json')
      ? res.status(500).json({ error })
      : res.status(500).render('searchResults', { error });
  }
};
     

// //update medicine
// const updateMedicine = async (req, res) => {
//   try {
//     const { name, description, expiryDate } = req.body;
//     await Medicine.findByIdAndUpdate(req.params.id, {
//       name,
//       description,
//       expiryDate,
//     });
//     res.send("Medicine updated");
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
// //delete medicine
// const deleteMedicine = async (req, res) => {
//   try {
//     await Medicine.findByIdAndDelete(req.params.id);
//     res.send("Medicine deleted");
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
// //get all medicine
// const getAllMedicines = async (req, res) => {
//   try {
//     const medicines = await Medicine.find();
//     res.json(medicines);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


module.exports = { manualSearch, scanMedicineImage, barcodeScan };

