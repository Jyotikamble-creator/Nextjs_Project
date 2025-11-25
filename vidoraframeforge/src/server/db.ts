import mongoose from "mongoose"
import { Logger, LogTags } from "@/lib/logger"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  Logger.e(LogTags.DB_CONNECT, 'MONGODB_URI environment variable is not defined');
  throw new Error("Please define the MONGODB_URI environment variable")
}

// Extend global type for mongoose caching
declare global {
  var mongoose: {
    conn: mongoose.Connection | null
    promise: Promise<mongoose.Connection> | null
  }
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectionToDatabase() {
  if (cached.conn) {
    Logger.d(LogTags.DB_CONNECT, 'Using existing database connection');
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }

    Logger.d(LogTags.DB_CONNECT, 'Creating new database connection promise');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      Logger.i(LogTags.DB_CONNECT, 'MongoDB Connected successfully');
      return mongooseInstance.connection
    })
  }

  try {
    cached.conn = await cached.promise
    Logger.d(LogTags.DB_CONNECT, 'Database connection established and cached');
  } catch (e) {
    cached.promise = null
    Logger.e(LogTags.DB_CONNECT, `MongoDB Connection Error: ${String(e)}`);
    throw e
  }

  return cached.conn
}

export async function disconnectFromDatabase() {
  try {
    if (cached.conn) {
      await mongoose.disconnect()
      cached.conn = null
      cached.promise = null
      Logger.i(LogTags.DB_CONNECT, 'MongoDB Disconnected successfully');
    }
  } catch (error) {
    Logger.e(LogTags.DB_CONNECT, `Error disconnecting from MongoDB: ${String(error)}`);
    throw error
  }
}
