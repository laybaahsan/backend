const express = require('express');
const {manualSearch,scanMedicineImage ,getMedicines} = require('../controller/medicine');
const { validateSearch, validateImageData , isAuthenticated, restrictToAuthenticated, protect  } = require('../middleware/auth');
const checkInternet = require ('../middleware/internet');


const router = express.Router();

//both can see meds
router.get("/", isAuthenticated,getMedicines );


router.post('/manual', isAuthenticated,validateSearch,checkInternet, manualSearch); //basic manual
router.post('/scan-ocr', isAuthenticated, validateImageData, checkInternet,scanMedicineImage); // OCR scan

  

module.exports=router;



