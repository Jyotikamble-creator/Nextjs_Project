import { Schema, model, models, type Document, Types } from "mongoose"

export interface IFollow extends Document {
  follower: Types.ObjectId // User who is following
  following: Types.ObjectId // User being followed
  createdAt: Date
}

const followSchema = new Schema<IFollow>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to ensure unique follow relationships and optimize queries
followSchema.index({ follower: 1, following: 1 }, { unique: true })
followSchema.index({ following: 1 }) // Optimize queries for followers list
followSchema.index({ follower: 1 }) // Optimize queries for following list
followSchema.index({ createdAt: -1 }) // Sort by recent follows

const Follow = models?.Follow || model<IFollow>("Follow", followSchema)
export default Follow
