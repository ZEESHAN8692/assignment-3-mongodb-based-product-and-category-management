import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const Database = async ()=> {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URL);
        console.log("Database connected successfully:");
        
        
    } catch (error) {
        console.error("Database connection failed:", error);
        
    }
}

export default Database;