import { Schema, model, models, type Document } from "mongoose"

export interface IJournal extends Document {
  title: string
  content: string
  author: Schema.Types.ObjectId | {
    _id: Schema.Types.ObjectId
    name: string
    avatar?: string
  }
  tags?: string[]
  attachments?: {
    type: "photo" | "video"
    url: string
    thumbnailUrl?: string
    fileId: string
    fileName: string
    size: number
  }[]
  isPublic: boolean
  mood?: string
  location?: string
  createdAt: Date
  updatedAt: Date
}

const journalSchema = new Schema<IJournal>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      maxlength: [10000, "Content cannot exceed 10,000 characters"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [50, "Tag cannot exceed 50 characters"],
    }],
    attachments: [{
      type: {
        type: String,
        enum: ["photo", "video"],
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      thumbnailUrl: String,
      fileId: {
        type: String,
        required: true,
      },
      fileName: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
    }],
    isPublic: {
      type: Boolean,
      default: false,
    },
    mood: {
      type: String,
      trim: true,
      maxlength: [50, "Mood cannot exceed 50 characters"],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better query performance
journalSchema.index({ author: 1, createdAt: -1 })
journalSchema.index({ tags: 1 })
journalSchema.index({ isPublic: 1, createdAt: -1 })

const Journal = models?.Journal || model<IJournal>("Journal", journalSchema)
export default Journal