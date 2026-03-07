import Like from "@/server/models/Like"
import { Logger, LogTags } from "@/lib/logger"
import mongoose from "mongoose"

export interface LikeFilters {
  user?: string | mongoose.Types.ObjectId
  contentType?: "video" | "photo" | "journal"
  contentId?: string | mongoose.Types.ObjectId
}

export class LikeRepository {
  /**
   * Find like by ID
   */
  async findById(likeId: string | mongoose.Types.ObjectId) {
    return Like.findById(likeId).lean()
  }

  /**
   * Find like by user and content
   */
  async findOne(
    userId: string | mongoose.Types.ObjectId,
    contentType: "video" | "photo" | "journal",
    contentId: string | mongoose.Types.ObjectId
  ) {
    return Like.findOne({
      user: userId,
      contentType,
      contentId,
    }).lean()
  }

  /**
   * Check if user has liked content
   */
  async hasLiked(
    userId: string | mongoose.Types.ObjectId,
    contentType: "video" | "photo" | "journal",
    contentId: string | mongoose.Types.ObjectId
  ): Promise<boolean> {
    const like = await this.findOne(userId, contentType, contentId)
    return !!like
  }

  /**
   * Find all likes for content
   */
  async findByContent(
    contentType: "video" | "photo" | "journal",
    contentId: string | mongoose.Types.ObjectId,
    limit = 100
  ) {
    return Like.find({ contentType, contentId })
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }

  /**
   * Find all likes by user
   */
  async findByUser(
    userId: string | mongoose.Types.ObjectId,
    contentType?: "video" | "photo" | "journal",
    limit = 100,
    skip = 0
  ) {
    const query: any = { user: userId }
    
    if (contentType) {
      query.contentType = contentType
    }

    return Like.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
  }

  /**
   * Create a like
   */
  async create(likeData: {
    user: string | mongoose.Types.ObjectId
    contentType: "video" | "photo" | "journal"
    contentId: string | mongoose.Types.ObjectId
  }) {
    // Check if already liked
    const existing = await this.findOne(
      likeData.user,
      likeData.contentType,
      likeData.contentId
    )

    if (existing) {
      Logger.w(LogTags.AUTH, "User already liked this content")
      return null
    }

    const like = await Like.create(likeData)
    Logger.i(LogTags.AUTH, `Like created: ${like._id}`, {
      user: likeData.user,
      contentType: likeData.contentType,
    })
    return like.toObject()
  }

  /**
   * Delete a like
   */
  async delete(
    userId: string | mongoose.Types.ObjectId,
    contentType: "video" | "photo" | "journal",
    contentId: string | mongoose.Types.ObjectId
  ) {
    const result = await Like.findOneAndDelete({
      user: userId,
      contentType,
      contentId,
    })

    if (result) {
      Logger.i(LogTags.AUTH, `Like deleted: ${result._id}`)
    }

    return result
  }

  /**
   * Delete like by ID
   */
  async deleteById(likeId: string | mongoose.Types.ObjectId) {
    const result = await Like.findByIdAndDelete(likeId)
    if (result) {
      Logger.i(LogTags.AUTH, `Like deleted: ${likeId}`)
    }
    return result
  }

  /**
   * Count likes for content
   */
  async countByContent(
    contentType: "video" | "photo" | "journal",
    contentId: string | mongoose.Types.ObjectId
  ): Promise<number> {
    return Like.countDocuments({ contentType, contentId })
  }

  /**
   * Count likes by user
   */
  async countByUser(
    userId: string | mongoose.Types.ObjectId,
    contentType?: "video" | "photo" | "journal"
  ): Promise<number> {
    const query: any = { user: userId }
    
    if (contentType) {
      query.contentType = contentType
    }

    return Like.countDocuments(query)
  }

  /**
   * Get like statistics for user
   */
  async getUserStats(userId: string | mongoose.Types.ObjectId) {
    const stats = await Like.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId as string) } },
      {
        $group: {
          _id: "$contentType",
          count: { $sum: 1 },
        },
      },
    ])

    const result = {
      total: 0,
      videos: 0,
      photos: 0,
      journals: 0,
    }

    stats.forEach((stat) => {
      result.total += stat.count
      if (stat._id === "video") result.videos = stat.count
      if (stat._id === "photo") result.photos = stat.count
      if (stat._id === "journal") result.journals = stat.count
    })

    return result
  }

  /**
   * Get most liked content for user
   */
  async getMostLikedByUser(
    userId: string | mongoose.Types.ObjectId,
    contentType?: "video" | "photo" | "journal",
    limit = 10
  ) {
    const query: any = { user: userId }
    
    if (contentType) {
      query.contentType = contentType
    }

    return Like.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }

  /**
   * Delete all likes for content (when content is deleted)
   */
  async deleteByContent(
    contentType: "video" | "photo" | "journal",
    contentId: string | mongoose.Types.ObjectId
  ) {
    const result = await Like.deleteMany({ contentType, contentId })
    Logger.i(LogTags.AUTH, `${result.deletedCount} likes deleted for ${contentType} ${contentId}`)
    return result
  }

  /**
   * Delete all likes by user (when user is deleted)
   */
  async deleteByUser(userId: string | mongoose.Types.ObjectId) {
    const result = await Like.deleteMany({ user: userId })
    Logger.i(LogTags.AUTH, `${result.deletedCount} likes deleted for user ${userId}`)
    return result
  }

  /**
   * Get users who liked content
   */
  async getUsersWhoLiked(
    contentType: "video" | "photo" | "journal",
    contentId: string | mongoose.Types.ObjectId,
    limit = 50
  ) {
    const likes = await Like.find({ contentType, contentId })
      .populate("user", "name email avatar stats.followerCount")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return likes.map((like: any) => like.user).filter((user) => user)
  }

  /**
   * Bulk check if user liked multiple content items
   */
  async hasLikedMultiple(
    userId: string | mongoose.Types.ObjectId,
    contentType: "video" | "photo" | "journal",
    contentIds: (string | mongoose.Types.ObjectId)[]
  ): Promise<{ [contentId: string]: boolean }> {
    const likes = await Like.find({
      user: userId,
      contentType,
      contentId: { $in: contentIds },
    })
      .select("contentId")
      .lean()

    const result: { [contentId: string]: boolean } = {}
    contentIds.forEach((id) => {
      result[id.toString()] = false
    })

    likes.forEach((like: any) => {
      result[like.contentId.toString()] = true
    })

    return result
  }
}

// Export singleton instance
export const likeRepository = new LikeRepository()
