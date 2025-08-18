const express = require('express');
const router = express.Router();

 //const authMiddleware = require('../middleware/auth');
const {manualSearch,scanMedicineImage,barcodeScan} = require('../controller/medicine');
const { validateSearch, validateImageData , isAuthenticated, restrictToAuthenticated,  } = require('../middleware/auth');
const checkInternet = require ('../middleware/internet');

//manual /barcode / ocr  search routes 
router.post('/manual', isAuthenticated,validateSearch,checkInternet, manualSearch); //basic manual
// router.post('/search', isAuthenticated, validateSearch, manualSearch); // Manual search by name
router.post('/scan-ocr', isAuthenticated, validateImageData, checkInternet,scanMedicineImage); // OCR scan
router.post('/scan-barcode', isAuthenticated, validateImageData,checkInternet, barcodeScan); // Barcode scan
  


module.exports=router;



