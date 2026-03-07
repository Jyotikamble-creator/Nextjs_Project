import Comment from "@/server/models/Comment"
import { Logger, LogTags } from "@/lib/logger"
import mongoose from "mongoose"

export interface CommentFilters {
  author?: string | mongoose.Types.ObjectId
  contentType?: "video" | "photo" | "journal"
  contentId?: string | mongoose.Types.ObjectId
  parentComment?: string | mongoose.Types.ObjectId | null
}

export const COMMENT_POPULATE_OPTIONS = "name email avatar"

export class CommentRepository {
  /**
   * Find comment by ID
   */
  async findById(commentId: string | mongoose.Types.ObjectId, populate = true) {
    const query = Comment.findById(commentId)
    
    if (populate) {
      query.populate("author", COMMENT_POPULATE_OPTIONS)
    }
    
    return query.lean()
  }

  /**
   * Find root comments for content (no parent)
   */
  async findByContent(
    contentType: "video" | "photo" | "journal",
    contentId: string | mongoose.Types.ObjectId,
    limit = 50,
    skip = 0
  ) {
    return Comment.find({
      contentType,
      contentId,
      parentComment: { $exists: false },
    })
      .populate("author", COMMENT_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
  }

  /**
   * Find replies for a comment
   */
  async findReplies(
    parentCommentId: string | mongoose.Types.ObjectId,
    limit = 50
  ) {
    return Comment.find({ parentComment: parentCommentId })
      .populate("author", COMMENT_POPULATE_OPTIONS)
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean()
  }

  /**
   * Find all comments by user
   */
  async findByUser(
    userId: string | mongoose.Types.ObjectId,
    limit = 50,
    skip = 0
  ) {
    return Comment.find({ author: userId })
      .populate("author", COMMENT_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
  }

  /**
   * Find all comments with filters
   */
  async findAll(filters: CommentFilters = {}, limit = 50, skip = 0) {
    const query: any = {}

    if (filters.author) {
      query.author = filters.author
    }

    if (filters.contentType) {
      query.contentType = filters.contentType
    }

    if (filters.contentId) {
      query.contentId = filters.contentId
    }

    if (filters.parentComment !== undefined) {
      if (filters.parentComment === null) {
        query.parentComment = { $exists: false }
      } else {
        query.parentComment = filters.parentComment
      }
    }

    return Comment.find(query)
      .populate("author", COMMENT_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
  }

  /**
   * Create a comment
   */
  async create(commentData: {
    author: string | mongoose.Types.ObjectId
    contentType: "video" | "photo" | "journal"
    contentId: string | mongoose.Types.ObjectId
    content: string
    parentComment?: string | mongoose.Types.ObjectId
  }) {
    const comment = await Comment.create(commentData)
    Logger.i(LogTags.AUTH, `Comment created: ${comment._id}`, {
      author: commentData.author,
      contentType: commentData.contentType,
      isReply: !!commentData.parentComment,
    })
    return comment.toObject()
  }

  /**
   * Update comment
   */
  async update(
    commentId: string | mongoose.Types.ObjectId,
    content: string
  ) {
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      {
        content,
        isEdited: true,
        updatedAt: new Date(),
      },
      { new: true }
    )
      .populate("author", COMMENT_POPULATE_OPTIONS)
      .lean()

    Logger.i(LogTags.AUTH, `Comment updated: ${commentId}`)
    return comment
  }

  /**
   * Delete comment by ID
   */
  async delete(commentId: string | mongoose.Types.ObjectId) {
    const result = await Comment.findByIdAndDelete(commentId)
    if (result) {
      Logger.i(LogTags.AUTH, `Comment deleted: ${commentId}`)
    }
    return result
  }

  /**
   * Delete comment and all its replies
   */
  async deleteWithReplies(commentId: string | mongoose.Types.ObjectId) {
    // First delete all replies
    const repliesResult = await Comment.deleteMany({ parentComment: commentId })
    
    // Then delete the parent comment
    const commentResult = await Comment.findByIdAndDelete(commentId)

    Logger.i(
      LogTags.AUTH,
      `Comment deleted with ${repliesResult.deletedCount} replies: ${commentId}`
    )

    return {
      comment: commentResult,
      repliesDeleted: repliesResult.deletedCount,
    }
  }

  /**
   * Increment comment likes
   */
  async incrementLikes(
    commentId: string | mongoose.Types.ObjectId,
    amount = 1
  ) {
    return Comment.findByIdAndUpdate(
      commentId,
      { $inc: { likes: amount } },
      { new: true }
    ).lean()
  }

  /**
   * Count comments for content
   */
  async countByContent(
    contentType: "video" | "photo" | "journal",
    contentId: string | mongoose.Types.ObjectId,
    includeReplies = true
  ): Promise<number> {
    const query: any = { contentType, contentId }
    
    if (!includeReplies) {
      query.parentComment = { $exists: false }
    }

    return Comment.countDocuments(query)
  }

  /**
   * Count comments by user
   */
  async countByUser(userId: string | mongoose.Types.ObjectId): Promise<number> {
    return Comment.countDocuments({ author: userId })
  }

  /**
   * Count replies for comment
   */
  async countReplies(parentCommentId: string | mongoose.Types.ObjectId): Promise<number> {
    return Comment.countDocuments({ parentComment: parentCommentId })
  }

  /**
   * Check if user is comment owner
   */
  async isOwner(
    commentId: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId
  ): Promise<boolean> {
    const comment = await Comment.findById(commentId).select("author").lean()
    return comment?.author?.toString() === userId.toString()
  }

  /**
   * Get recent comments (global)
   */
  async findRecent(limit = 20) {
    return Comment.find({ parentComment: { $exists: false } })
      .populate("author", COMMENT_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }

  /**
   * Get user comment statistics
   */
  async getUserStats(userId: string | mongoose.Types.ObjectId) {
    const stats = await Comment.aggregate([
      { $match: { author: new mongoose.Types.ObjectId(userId as string) } },
      {
        $group: {
          _id: "$contentType",
          count: { $sum: 1 },
          totalLikes: { $sum: "$likes" },
        },
      },
    ])

    const result = {
      total: 0,
      totalLikes: 0,
      videos: 0,
      photos: 0,
      journals: 0,
    }

    stats.forEach((stat) => {
      result.total += stat.count
      result.totalLikes += stat.totalLikes
      if (stat._id === "video") result.videos = stat.count
      if (stat._id === "photo") result.photos = stat.count
      if (stat._id === "journal") result.journals = stat.count
    })

    return result
  }

  /**
   * Delete all comments for content (when content is deleted)
   */
  async deleteByContent(
    contentType: "video" | "photo" | "journal",
    contentId: string | mongoose.Types.ObjectId
  ) {
    const result = await Comment.deleteMany({ contentType, contentId })
    Logger.i(
      LogTags.AUTH,
      `${result.deletedCount} comments deleted for ${contentType} ${contentId}`
    )
    return result
  }

  /**
   * Delete all comments by user (when user is deleted)
   */
  async deleteByUser(userId: string | mongoose.Types.ObjectId) {
    const result = await Comment.deleteMany({ author: userId })
    Logger.i(
      LogTags.AUTH,
      `${result.deletedCount} comments deleted for user ${userId}`
    )
    return result
  }

  /**
   * Get top commented content
   */
  async getTopCommented(
    contentType?: "video" | "photo" | "journal",
    limit = 10
  ) {
    const matchStage: any = {}
    if (contentType) {
      matchStage.contentType = contentType
    }

    return Comment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { contentType: "$contentType", contentId: "$contentId" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ])
  }

  /**
   * Find comments with replies populated
   */
  async findWithReplies(
    contentType: "video" | "photo" | "journal",
    contentId: string | mongoose.Types.ObjectId,
    limit = 50
  ) {
    const rootComments = await this.findByContent(contentType, contentId, limit)

    // Fetch replies for each root comment
    const commentsWithReplies = await Promise.all(
      rootComments.map(async (comment: any) => {
        const replies = await this.findReplies(comment._id)
        return { ...comment, replies }
      })
    )

    return commentsWithReplies
  }

  /**
   * Get comment thread (parent and all ancestors)
   */
  async getThread(commentId: string | mongoose.Types.ObjectId) {
    const comment = await this.findById(commentId)
    if (!comment) return []

    const thread = [comment]

    // If has parent, recursively get parent thread
    if ((comment as any).parentComment) {
      const parentThread = await this.getThread((comment as any).parentComment)
      thread.unshift(...parentThread)
    }

    return thread
  }
}

// Export singleton instance
export const commentRepository = new CommentRepository()
