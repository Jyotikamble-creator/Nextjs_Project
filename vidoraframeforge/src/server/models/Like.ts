import { Schema, model, models, type Document, Types } from "mongoose"

export interface ILike extends Document {
  user: Types.ObjectId
  contentType: "video" | "photo" | "journal"
  contentId: Types.ObjectId
  createdAt: Date
}

const likeSchema = new Schema<ILike>(
  {
    user: {
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
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to ensure unique likes and optimize queries
likeSchema.index({ user: 1, contentType: 1, contentId: 1 }, { unique: true })
likeSchema.index({ contentType: 1, contentId: 1, createdAt: -1 })
likeSchema.index({ user: 1, createdAt: -1 })

const Like = models?.Like || model<ILike>("Like", likeSchema)
export default Like
