const express = require('express');
const {manualSearch,scanMedicineImage ,getMedicines} = require('../controller/medicine');
const { validateSearch, validateImageData , isAuthenticated, restrictToAuthenticated, protect , isAdmin } = require('../middleware/auth');
const checkInternet = require ('../middleware/internet');
const Medicine = require("../models/medicine");

const router = express.Router();

//both can see meds
router.get("/", isAuthenticated,getMedicines );


router.post('/manual', isAuthenticated,validateSearch,checkInternet, manualSearch); //basic manual
router.post('/scan-ocr', isAuthenticated, validateImageData, checkInternet,scanMedicineImage); // OCR scan

  // Add medicine
router.post("/add", protect, isAdmin, async (req, res) => {
  try {
    const medicine = new Medicine(req.body);
    await medicine.save();
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update medicine
router.put("/:id", protect, isAdmin, async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Delete medicine
router.delete("/:id", protect, isAdmin, async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ message: "Medicine deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports=router;



