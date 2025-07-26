import mongoose from "mongoose";
import dotenv from "dotenv";
import { logInfo, logError } from "../utils/logger";

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI!, {
      dbName: process.env.DB_NAME || "your_db_name",
    });

    logInfo(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logError("MongoDB connection failed", error);
    process.exit(1);
  }
};

export default connectDB;
