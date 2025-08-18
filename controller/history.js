const History = require('../models/history');
const path = require('path');
const fs =require('fs');
const filePath = path.join(__dirname, '../offlineHistory.json');

// controllers/history.js me
const saveHistory = async (req, res) => {
  try {
    if (!req.user || req.user.role === 'visitor') {
      return res.status(403).json({ error: 'Visitors cannot save history' });
    }

    const {searchTerm, searchType, medicine } = req.body;
    if(! medicine._id || !medicine ){
    
       const offlineHistory = readOfflineHistory();
      const newOffline = {
        _id: Date.now().toString(), // unique id
        userId: req.user._id,
        searchTerm,
        type: searchType,
        medicineName: medicine?.name || "Unknown",
        timestamp: new Date()
      };
      offlineHistory.push(newOffline);
      writeOfflineHistory(offlineHistory);
      return res.status(201).json({ message: "History saved offline", history: newOffline });
    }


    const newHistory = new History({
      email: req.user.email,
      userId: req.user._id,
      searchTerm,
      type :searchType, 
      searchQuery :searchTerm,  //store what user search       
      medicineId :medicine._id,
      medicineName: medicine.name || 'Unknown',
      genericName: medicine.genericName || 'N/A',
      brand: medicine.brand || 'N/A',
      manufacturer: medicine.manufacturer || 'N/A',
      formula: medicine.formula || 'N/A',
      dosage: medicine.dosage || 'N/A',
      usageInstructions: medicine.usageInstructions || 'N/A',
      sideEffects: medicine.sideEffects || 'N/A',
      contraindications: medicine.contraindications || 'N/A',
      prescriptionRequired: medicine.prescriptionRequired || false,
      expiryDate: medicine.expiryDate || null,
      result:JSON.stringify(medicine) ,//save med detail as json string
      timestamp: new Date()
      }
    
    );
        await newHistory.save();

    res.status(201).json({ message: 'History saved', history: newHistory });
  } catch (err) {
    console.error('Save History Error:', err);
    res.status(500).json({ error: 'Failed to save history' });
  }
};

//====================================================================//
// Get user's search history
 const getHistory = async (req, res) => {
  try {
    if (!req.user || req.user.role==='visitor') {
            return res.status(403).send("Visitors cannot view history");
        }
        //get online
 const history = await History.find({ email:req.user.email })
     .populate("medicineId", 'name description barcode')
     .sort({ timestamp: -1 });

//  if (!history || history.length === 0) {
//       return res.status(404).send("No history found");
//    }
   if(history && history.length >0){
    return res.render('history',{history});
   }

        // Render view for server-side rendering
  //  res.render("history", { history }); // Pass history array
  // Agar DB empty hai to offline history dikhao
    const offlineHistory = readOfflineHistory();
    if (offlineHistory.length === 0) {
      return res.status(404).send("No history found");
    }

    return res.render("history", { history: offlineHistory });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error while fetching history");
    };
};
 
//=============================================================//
// Delete a history item
const deleteHistory = async (req, res) => {
  try {
    if (!req.user || req.user.role === 'visitor') {
      return res.status(403).json({ error: 'Visitors cannot access history' });
    }
//try  DB delete
    const history = await History.findOneAndDelete({
      _id: req.body.id,//_id: req.params.id,
      userId: req.user._id, // Ensure user owns the history
    });
    if (history) {
      return res.status(404).json({ message: 'History deleted online' });
    }
    //agr db main nhi mila to offline delete
    let offlineHistory= readOfflineHistory();
    const newOffline = offlineHistory.filter(item => item._id !== req.body.id);
    if(newOffline.length === offlineHistory.length){
      return res.status(404).json({ message: 'History not found' });
    }
    writeOfflineHistory (newOffline);
    res.json({ message: 'History deleted offline' });
  } catch (err) {
    console.error('Deleted History Error ',err.message);

    }
    res.status(500).json({ message: 'Server error' });
  };


//============================================================//
// Delete all history for a user
 const deleteAllHistory = async (req, res) => {
  try {
    if (!req.user || req.user.role === 'visitor') {
      return res.status(403).json({ error: 'Visitors cannot access history' });
    }
    //online deleted
    await History.deleteMany({ userId: req.user._id });
   //offline
     writeOfflineHistory([]);
  res.json({ message: 'All history deleted (online + offline)' });
  }
  catch (err) {
    console.error('Delete All History Error',err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

//=================================================================//
// Copy history details for clipboard
const shareHistory = async (req, res) => {
  try {
    if (!req.user || req.user.role === 'visitor') {
      return res.status(403).json({ error: 'Visitors cannot access history' });
    }
    const { historyIds } = req.body; // Expect array of history IDs
    if (!historyIds|| !Array.isArray(historyIds) || historyIds.length === 0) {
      return res.status(400).json({ error: 'At least one history ID is required' });
    }
    const history = await History.find({
      _id: { $in: historyIds },
      userId: req.user._id,
    }).populate('medicineId', 'name description');

    if (!history || history.length === 0) {
      return res.status(404).json({ error: 'No history entries found' });
    }


    // Format history details for copying
  const historyText = history.map(h => {
  const med = h.medicineId || {};

  return `
Medicine: ${med.name || 'Unknown'}
type:${med.type||'N/A'}
Generic Name: ${med.genericName || 'N/A'}
Brand: ${med.brand || 'N/A'}
Manufacturer: ${med.manufacturer || 'N/A'}
Formula: ${med.formula || 'N/A'}
Dosage: ${med.dosage || 'N/A'}
Usage Instructions: ${med.usageInstructions || 'N/A'}
Side Effects: ${med.sideEffects || 'N/A'}
Contraindications: ${med.contraindications || 'N/A'}
Prescription Required: ${med.prescriptionRequired ? 'Yes' : 'No'}
Expiry Date: ${med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : 'N/A'}
Searched Term: ${h.searchTerm || 'N/A'}
Search Type: ${h.type || 'N/A'},
result: ${JSON.stringify(medicine) || 'N/A'} ,
Searched On: ${h.timestamp ? new Date(h.timestamp).toLocaleDateString() : 'N/A'}
`;
}).join('\n---\n');
res.json({ shareText: historyText });
  } catch (err) {
    console.error('Share History Error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid history ID' });
    }
    res.status(500).json({ error: 'Failed to prepare history for copying' });
  }
};

// Local JSON File Offline History Helpers
function readOfflineHistory() {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeOfflineHistory(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

 module.exports=
 {
   saveHistory,
   getHistory,
   deleteHistory,
   deleteAllHistory,
   shareHistory,
   
 };