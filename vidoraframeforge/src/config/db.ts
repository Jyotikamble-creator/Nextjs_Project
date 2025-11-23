
import mongoose from "mongoose"
import dotenv from "dotenv"
import { logInfo, logError } from "../server/utils/logger"

dotenv.config()

const connectDB = async () => {
  try {
    // Prevent multiple connections
    if (mongoose.connections[0].readyState) {
      logInfo("MongoDB already connected")
      return
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI!, {
      dbName: process.env.DB_NAME || "video_platform",
    })

    logInfo(`MongoDB Connected: ${conn.connection.host}`)

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      logError("MongoDB connection error:", err)
    })

    mongoose.connection.on("disconnected", () => {
      logInfo("MongoDB disconnected")
    })
  } catch (error) {
    logError("MongoDB connection failed", error)
    process.exit(1)
  }
}

export default connectDB
