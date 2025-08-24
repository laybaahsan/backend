const History = require('../models/history');
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../offlineHistory.json');

// Save history (works both online DB & offline JSON)
const saveHistory = async (req) => {
  try {
    const { user, body } = req;
    if (!user || user.role === 'visitor') return;

    const { searchTerm, searchType, medicine } = body;

    if (medicine && medicine._id) {
      // Save online DB
      const historyData = {
        userId: user._id,
        email: user.email,
        searchTerm,
        type: searchType,
        searchQuery: searchTerm,
        medicineId: medicine._id,
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
        description: medicine.description || 'No description available',
        result: JSON.stringify(medicine),
        timestamp: new Date()
      };
      return await History.create(historyData);
    }

    // Save offline if medicine not found
    const offlineHistory = readOfflineHistory();
    const newOffline = {
      _id: Date.now().toString(),
      userId: user._id,
      searchTerm,
      type: searchType,
      medicineName: medicine?.name || 'Unknown',
      timestamp: new Date().toISOString()
    };
    offlineHistory.push(newOffline);
    writeOfflineHistory(offlineHistory);
    return newOffline;

  } catch (err) {
    console.error('Save History Error:', err);
    return null;
  }
};

// Get user's search history
const getHistory = async (req, res) => {
  try {
    const { user } = req;
    if (!user || user.role === 'visitor') return res.status(403).send("Visitors cannot view history");

    const history = await History.find({ email: user.email })
      .populate("medicineId", 'name description barcode')
      .sort({ timestamp: -1 });

    if (history.length > 0) return res.json({ history });

    const offlineHistory = readOfflineHistory();
    if (offlineHistory.length === 0) return res.status(404).send("No history found");

    return res.render("history", { history: offlineHistory });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while fetching history");
  }
};

// Delete all history for a user
const deleteAllHistory = async (req, res) => {
  try {
    const { user } = req;
    if (!user || user.role === 'visitor') return res.status(403).json({ error: 'Visitors cannot access history' });

    await History.deleteMany({ userId: user._id });
    writeOfflineHistory([]);
    res.json({ message: 'All history deleted (online + offline)' });

  } catch (err) {
    console.error('Delete All History Error', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Copy history details for clipboard
const shareHistory = async (req, res) => {
  try {
    const { user, body } = req;
    if (!user || user.role === 'visitor') return res.status(403).json({ error: 'Visitors cannot access history' });

    const { historyIds } = body;
    if (!historyIds || !Array.isArray(historyIds) || historyIds.length === 0) {
      return res.status(400).json({ error: 'At least one history ID is required' });
    }

    const history = await History.find({
      _id: { $in: historyIds },
      userId: user._id,
    }).populate('medicineId');

    if (!history || history.length === 0) return res.status(404).json({ error: 'No history entries found' });

    const historyText = history.map(h => {
      const med = h.medicineId || {};
      return `
Medicine: ${med.name || 'Unknown'}
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
Search Type: ${h.type || 'N/A'}
Searched On: ${h.timestamp ? new Date(h.timestamp).toLocaleDateString() : 'N/A'}
`;
    }).join('\n---\n');

    res.json({ shareText: historyText });

  } catch (err) {
    console.error('Share History Error:', err);
    res.status(500).json({ error: 'Failed to prepare history for copying' });
  }
};

// Offline Helpers
function readOfflineHistory() {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeOfflineHistory(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  saveHistory,
  getHistory,
  deleteAllHistory,
  shareHistory
};
