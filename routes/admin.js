// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const Medicine = require('../models/medicine');
const { isAuthenticated } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// Add Medicine
router.post('/medicines', isAuthenticated, adminOnly, async (req, res) => {
  try {
    const medicine = new Medicine(req.body);
    await medicine.save();
    res.json({ success: true, medicine });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Medicine
router.put('/medicines/:id', isAuthenticated, adminOnly, async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, medicine });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Medicine
router.delete('/medicines/:id', isAuthenticated, adminOnly, async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Medicine deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
