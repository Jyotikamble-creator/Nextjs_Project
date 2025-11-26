import { Schema, model, models, type Document } from "mongoose"

export interface IPhoto extends Document {
  title?: string
  description?: string
  url: string
  thumbnailUrl?: string
  uploader: Schema.Types.ObjectId | {
    _id: Schema.Types.ObjectId
    name: string
    avatar?: string
  }
  fileId: string
  fileName: string
  size: number
  width?: number
  height?: number
  tags?: string[]
  album?: string
  location?: string
  takenAt?: Date
  isPublic: boolean
  views?: number
  likes?: number
  createdAt: Date
  updatedAt: Date
}

const photoSchema = new Schema<IPhoto>(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    url: {
      type: String,
      required: [true, "URL is required"],
    },
    thumbnailUrl: String,
    uploader: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileId: {
      type: String,
      required: [true, "File ID is required"],
    },
    fileName: {
      type: String,
      required: [true, "File name is required"],
    },
    size: {
      type: Number,
      required: [true, "File size is required"],
    },
    width: Number,
    height: Number,
    tags: [{
      type: String,
      trim: true,
      maxlength: [50, "Tag cannot exceed 50 characters"],
    }],
    album: {
      type: String,
      trim: true,
      maxlength: [100, "Album name cannot exceed 100 characters"],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    takenAt: Date,
    isPublic: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better query performance
photoSchema.index({ uploader: 1, createdAt: -1 })
photoSchema.index({ tags: 1 })
photoSchema.index({ album: 1 })
photoSchema.index({ isPublic: 1, createdAt: -1 })

const Photo = models?.Photo || model<IPhoto>("Photo", photoSchema)
export default Photo