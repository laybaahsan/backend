const Medicine = require('../models/medicine');
const { saveHistory } = require('./history'); // Correct import
const Tesseract = require('tesseract.js');

// Helper: Check if request body is empty
function isBodyEmpty(req) {
  return !req.body || Object.keys(req.body).length === 0;
}

// Escape special regex characters in user input
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Manual Search
const manualSearch = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Medicine name is required and must be a non-empty string' });
    }

    const safeName = escapeRegex(name.trim());
    const medicine = await Medicine.findOne({ name: new RegExp(`^${safeName}$`, 'i') });

    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    // Save history (reusing your historyController)
    await saveHistory({ user: req.user, body: { searchTerm: name.trim(), searchType: 'manual', medicine } });

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

    // Convert base64 to buffer
    const buffer = Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    // Use Tesseract worker
    const worker = await Tesseract.createWorker();
    await worker.loadLanguage('eng');
    await worker.reinitialize('eng');
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();

    const extractedText = text.toLowerCase().trim();
    if (!extractedText) return res.status(400).json({ error: 'No text detected in image' });

    const firstLine = extractedText.split('\n').map(line => line.trim()).filter(Boolean)[0];
    const safeText = escapeRegex(firstLine || extractedText);

    const medicine = await Medicine.findOne({ name: new RegExp(`^${safeText}$`, 'i') });

    // Save history
    await saveHistory({ user: req.user, body: { searchTerm: extractedText, searchType: 'ocr', medicine } });

    return res.json(medicine || { name: 'Unknown', description: 'No description found' });

  } catch (err) {
    console.error('OCR Scan Error:', err);
    return res.status(500).json({ error: 'OCR search failed' });
  }
};


  const getMedicines = async (req,res)=>{
    try {
    const medicines = await Medicine.find();
    res.json({ success: true, data: medicines });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  };



module.exports ={
  scanMedicineImage ,
  manualSearch ,
  getMedicines
}