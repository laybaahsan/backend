const mongoose = require('mongoose');
const Medicine = require('./models/medicine');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

mongoose.connect( process.env.MONGODB_URI||'mongodb+srv://laybaahsan5:HWzhGojYtSCC8Rtq@medscancluster.nbjfwhf.mongodb.net/?retryWrites=true&w=majority&appName=MedscanCluster', { 

})
.then(async () => {
  console.log('MongoDB connected');


const medicines = JSON.parse(fs.readFileSync("./medicines.json", "utf-8"));

const importData = async () => {
  try {
    await Medicine.insertMany(medicines);
    console.log("✅ Data imported successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error importing data", err);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    await Medicine.deleteMany();
    console.log("🗑️ Data deleted successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error deleting data", err);
    process.exit(1);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
}
)
