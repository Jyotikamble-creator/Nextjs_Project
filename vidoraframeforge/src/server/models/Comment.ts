import { Schema, model, models, type Document, Types } from "mongoose"

export interface IComment extends Document {
  author: Types.ObjectId
  contentType: "video" | "photo" | "journal"
  contentId: Types.ObjectId
  content: string
  likes: Types.ObjectId[] // Array of user IDs who liked the comment
  parentComment?: Types.ObjectId // For nested replies
  isEdited: boolean
  createdAt: Date
  updatedAt: Date
}

const commentSchema = new Schema<IComment>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentType: {
      type: String,
      enum: ["video", "photo", "journal"],
      required: true,
    },
    contentId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "contentTypeModel",
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
      trim: true,
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual for the correct model reference based on contentType
commentSchema.virtual("contentTypeModel").get(function() {
  switch (this.contentType) {
    case "video": return "Video"
    case "photo": return "Photo"
    case "journal": return "Journal"
    default: return "Video"
  }
})

// Virtual for like count
commentSchema.virtual("likeCount").get(function() {
  return this.likes?.length || 0
})

// Indexes for optimized queries
commentSchema.index({ contentType: 1, contentId: 1, createdAt: -1 })
commentSchema.index({ author: 1, createdAt: -1 })
commentSchema.index({ parentComment: 1 })
commentSchema.index({ createdAt: -1 })

const Comment = models?.Comment || model<IComment>("Comment", commentSchema)
export default Comment
