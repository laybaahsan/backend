const mongoose= require('mongoose');

const connectDB = async () =>{
    try{
       
         mongoose.connect(process.env.MONGO_URI ||"mongodb+srv://laybaahsan5:HWzhGojYtSCC8Rtq@medscancluster.nbjfwhf.mongodb.net/?retryWrites=true&w=majority&appName=MedscanCluster",{
            serverSelectionTimeoutMS:5000,
            socketTimeoutMS: 45000,
    });
        console.log('Mongodb connected');

    }
    catch(err){
        console.error('Mongodb connection error:' ,err);
        console.log('trying to connect to:',process.env.MONGODB_URI);
         setTimeout(connectDB,5000);//retry after 5 sec
          exists(1);
      
    }
};

module.exports=connectDB;

