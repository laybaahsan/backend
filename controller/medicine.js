const Medicine = require('../models/medicine');
const History = require('../models/history');
const Tesseract = require('tesseract.js');
const { BrowserMultiFormatReader } = require('@zxing/library');



//Helper: Check if request body is empty
function isBodyEmpty(req) {
  return !req.body || Object.keys(req.body).length === 0;
}


//  Helper Save history 
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
      



// Manual Search
const manualSearch = async (req, res) => {
  try {

    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Medicine name is required and must be a non-empty string' });
    }

    const medicine = await Medicine.findOne({ name: new RegExp(name.trim(), 'i') });
     if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    await saveHistory(req, 'manual',name.trim(),medicine);
return res.json(medicine);

} catch (err) {
    console.error('Manual Search Error:', err);
    return res.status(500).json({ error: 'Server error' });
   
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
    return res.json(medicine || {name :'Unknown' , description:' No description found'});

  }catch (err) {
    console.error('OCR Scan Error:', err);
   return res.status(500).json({error:'OCR search failed'});
   }
};


// Barcode Scan
const barcodeScan = async (req, res) => {
  try {
     if (isBodyEmpty(req)) {
      return res.status(400).json({ error: 'Request body is missing' });
    }
    
    const { imageData } = req.body;
   if( !imageData || typeof imageData !== 'string'){
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
      return res.json(medicine);

    } catch {
      return res.status(400).json({ error: 'No barcode detected' });
    } finally {
      reader.reset();
    }
  } catch (err) {
    console.error('Barcode Scan Error:', err);
    const error = 'Something went wrong during Barcode search';
    return res.status(500).json({error:'Barcode search failed'});
  }
};
     

module.exports = { manualSearch, scanMedicineImage, barcodeScan };

