const express = require('express');
const {manualSearch,scanMedicineImage,getMedicines, addMedicine, updateMedicine ,deleteMedicine} = require('../controller/medicine');
const { validateSearch, validateImageData , isAuthenticated, restrictToAuthenticated, protect  } = require('../middleware/auth');
const checkInternet = require ('../middleware/internet');
const { adminOnly } = require("../middleware/admin");

const router = express.Router();

//both can see meds
router.get("/",getMedicines );


router.post('/manual', isAuthenticated,validateSearch,checkInternet, manualSearch); //basic manual
router.post('/scan-ocr', isAuthenticated, validateImageData, checkInternet,scanMedicineImage); // OCR scan

  
// Sirf Admin ko add/update/delete ki permission
router.post("/", protect, adminOnly, addMedicine);
router.put("/:id", protect, adminOnly, updateMedicine);
router.delete("/:id", protect, adminOnly, deleteMedicine);


module.exports=router;



