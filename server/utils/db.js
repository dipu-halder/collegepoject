const mongoose = require("mongoose")


const URI = process.env.MONGODB_URI;
// mongoose.connect(uri);

const connectdb = async () => {

    try {
        await mongoose.connect(URI);
        console.log("successfull to databass");
        
    } catch (error) {
        console.error("database conation failed");
        process.exit(0);
    }
}

module.exports = connectdb;