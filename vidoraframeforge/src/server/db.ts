import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
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
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("✅ MongoDB Connected")
      return mongooseInstance.connection
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error("❌ MongoDB Connection Error:", e)
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
      console.log("🔌 MongoDB Disconnected")
    }
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error)
    throw error
  }
}
