import { Schema, model, models, type Document } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: "admin" | "user"
  avatar?: string
  bio?: string
  stats: {
    totalPhotos: number
    totalVideos: number
    totalJournals: number
    lastActive: Date
    streak: number
    followerCount: number
    followingCount: number
  }
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: [200, "Bio cannot exceed 200 characters"],
      default: "",
    },
    stats: {
      totalPhotos: {
        type: Number,
        default: 0,
      },
      totalVideos: {
        type: Number,
        default: 0,
      },
      totalJournals: {
        type: Number,
        default: 0,
      },
      lastActive: {
        type: Date,
        default: Date.now,
      },
      streak: {
        type: Number,
        default: 0,
      },
      followerCount: {
        type: Number,
        default: 0,
      },
      followingCount: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for optimized queries
// Note: email field already has unique: true which creates an index automatically
userSchema.index({ 'stats.lastActive': -1 })
userSchema.index({ createdAt: -1 })

const User = models?.User || model<IUser>("User", userSchema)
export default User
