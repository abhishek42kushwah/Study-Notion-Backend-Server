const mongoose = require("mongoose");

require("dotenv").config();

exports.connect  = () =>{
      mongoose.connect(process.env.MONGOS_URL , {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }) 
      .then(()=>console.log("DB connection SuccessFully"))
      .catch((error)=> {
        console.log(error)
      console.log("DB Connection me problem hai",error);
      console.error("error aa rha de kho kha h ",
        process.exit(1) 
      );
      console.log(error);
      process.exit(1) 

      }
      );
} 