import mongoose from "mongoose";

const connect = async ()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`connected to MongoDB: ${conn.connection.host}`);
    }catch(error){
        console.log(`MongoDB connection error: ${error}`);
    }
}

export default connect;