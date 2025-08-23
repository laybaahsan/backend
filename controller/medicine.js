const Medicine = require('../models/medicine');
const History = require('../models/history');
const Tesseract = require('tesseract.js');
const { BrowserMultiFormatReader } = require('@zxing/library');



//Helper: Check if request body is empty
function isBodyEmpty(req) {
  return !req.body || Object.keys(req.body).length === 0;
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


     

// Add Medicine (Admin Only)
const addMedicine = async (req, res) => {
  try {
    const medicine = new Medicine(req.body);
    await medicine.save();
    res.status(201).json(medicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update Medicine (Admin Only)
const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });
    res.json(medicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Medicine (Admin Only)
const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });
    res.json({ message: "Medicine deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



// Get Medicines (For All)
const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




module.exports = { manualSearch, scanMedicineImage , addMedicine, updateMedicine, deleteMedicine, getMedicines};

