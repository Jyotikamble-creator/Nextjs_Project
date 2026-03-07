import Journal from "@/server/models/Journal"
import { Logger, LogTags } from "@/lib/logger"
import mongoose from "mongoose"

export interface JournalFilters {
  author?: string | mongoose.Types.ObjectId
  mood?: string
  tags?: string | string[]
  search?: string
  startDate?: Date
  endDate?: Date
  privacy?: "public" | "private" | "friends"
}

export const JOURNAL_POPULATE_OPTIONS = "name email avatar"

export class JournalRepository {
  /**
   * Find journal by ID
   */
  async findById(journalId: string | mongoose.Types.ObjectId, populate = true) {
    const query = Journal.findById(journalId)
    
    if (populate) {
      query.populate("author", JOURNAL_POPULATE_OPTIONS)
    }
    
    return query.lean()
  }

  /**
   * Find journals by user ID
   */
  async findByUser(
    userId: string | mongoose.Types.ObjectId,
    limit = 50,
    skip = 0
  ) {
    return Journal.find({ author: userId })
      .populate("author", JOURNAL_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
  }

  /**
   * Find all journals with filters
   */
  async findAll(filters: JournalFilters = {}, limit = 50, skip = 0) {
    const query: any = {}

    // User filter (note: journals use 'author' not 'uploader')
    if (filters.author) {
      query.author = filters.author
    }

    // Mood filter
    if (filters.mood) {
      query.mood = filters.mood
    }

    // Privacy filter
    if (filters.privacy) {
      query.privacy = filters.privacy
    } else {
      // Default to public
      query.privacy = "public"
    }

    // Tags filter
    if (filters.tags) {
      if (Array.isArray(filters.tags)) {
        query.tags = { $in: filters.tags }
      } else {
        query.tags = filters.tags
      }
    }

    // Search filter (title and content)
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { content: { $regex: filters.search, $options: "i" } },
        { tags: { $regex: filters.search, $options: "i" } },
      ]
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      query.createdAt = {}
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate
      }
    }

    return Journal.find(query)
      .populate("author", JOURNAL_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
  }

  /**
   * Search journals with text search
   */
  async search(searchTerm: string, limit = 50) {
    return Journal.find(
      { $text: { $search: searchTerm }, privacy: "public" },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .populate("author", JOURNAL_POPULATE_OPTIONS)
      .limit(limit)
      .lean()
  }

  /**
   * Create a new journal
   */
  async create(journalData: {
    author: string | mongoose.Types.ObjectId
    title: string
    content: string
    mood?: string
    location?: string
    tags?: string[]
    attachments?: Array<{
      type: "photo" | "video"
      url: string
      thumbnailUrl?: string
      fileId?: string
      fileName?: string
      size?: number
      width?: number
      height?: number
    }>
    privacy?: "public" | "private" | "friends"
  }) {
    const journal = await Journal.create(journalData)
    Logger.i(LogTags.JOURNAL_CREATE, `Journal created: ${journal._id}`, {
      title: journal.title,
      author: journal.author,
    })
    return journal.toObject()
  }

  /**
   * Update journal by ID
   */
  async update(
    journalId: string | mongoose.Types.ObjectId,
    updateData: Partial<{
      title: string
      content: string
      mood: string
      location: string
      tags: string[]
      attachments: any[]
      privacy: "public" | "private" | "friends"
    }>
  ) {
    const journal = await Journal.findByIdAndUpdate(
      journalId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    )
      .populate("author", JOURNAL_POPULATE_OPTIONS)
      .lean()

    Logger.i(LogTags.JOURNAL_UPDATE, `Journal updated: ${journalId}`)
    return journal
  }

  /**
   * Delete journal by ID
   */
  async delete(journalId: string | mongoose.Types.ObjectId) {
    const result = await Journal.findByIdAndDelete(journalId)
    if (result) {
      Logger.i(LogTags.JOURNAL_DELETE, `Journal deleted: ${journalId}`)
    }
    return result
  }

  /**
   * Increment journal likes
   */
  async incrementLikes(
    journalId: string | mongoose.Types.ObjectId,
    amount = 1
  ) {
    return Journal.findByIdAndUpdate(
      journalId,
      { $inc: { likes: amount } },
      { new: true }
    ).lean()
  }

  /**
   * Increment comment count
   */
  async incrementComments(
    journalId: string | mongoose.Types.ObjectId,
    amount = 1
  ) {
    return Journal.findByIdAndUpdate(
      journalId,
      { $inc: { commentCount: amount } },
      { new: true }
    ).lean()
  }

  /**
   * Get journals by mood
   */
  async findByMood(
    mood: string,
    userId?: string | mongoose.Types.ObjectId,
    limit = 50
  ) {
    const query: any = { mood }
    
    if (userId) {
      query.author = userId
    } else {
      query.privacy = "public"
    }

    return Journal.find(query)
      .populate("author", JOURNAL_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }

  /**
   * Get journals by tags
   */
  async findByTags(tags: string[], limit = 50) {
    return Journal.find({ tags: { $in: tags }, privacy: "public" })
      .populate("author", JOURNAL_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }

  /**
   * Get mood frequency for user
   */
  async getMoodFrequency(userId: string | mongoose.Types.ObjectId) {
    return Journal.aggregate([
      {
        $match: {
          author: new mongoose.Types.ObjectId(userId as string),
          mood: { $exists: true, $nin: [null, ""] },
        },
      },
      { $group: { _id: "$mood", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
  }

  /**
   * Count journals with filters
   */
  async count(filters: JournalFilters = {}): Promise<number> {
    const query: any = {}

    if (filters.author) {
      query.author = filters.author
    }

    if (filters.mood) {
      query.mood = filters.mood
    }

    if (filters.tags) {
      query.tags = Array.isArray(filters.tags)
        ? { $in: filters.tags }
        : filters.tags
    }

    if (filters.privacy) {
      query.privacy = filters.privacy
    }

    return Journal.countDocuments(query)
  }

  /**
   * Check if journal exists and user is owner
   */
  async isOwner(
    journalId: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId
  ): Promise<boolean> {
    const journal = await Journal.findById(journalId).select("author").lean()
    return journal?.author?.toString() === userId.toString()
  }

  /**
   * Get unique moods for user
   */
  async getUserMoods(userId: string | mongoose.Types.ObjectId): Promise<string[]> {
    const moods = await Journal.distinct("mood", {
      author: userId,
      mood: { $exists: true, $ne: null },
    })
    return moods.filter((m) => m) // Filter out null/undefined
  }

  /**
   * Get unique tags from user's journals
   */
  async getUserTags(userId: string | mongoose.Types.ObjectId): Promise<string[]> {
    const journals = await Journal.find({ author: userId })
      .select("tags")
      .lean()
    
    const allTags = journals.flatMap((j) => j.tags || [])
    return [...new Set(allTags)].sort()
  }

  /**
   * Get journal statistics for user
   */
  async getUserStats(userId: string | mongoose.Types.ObjectId) {
    const stats = await Journal.aggregate([
      { $match: { author: new mongoose.Types.ObjectId(userId as string) } },
      {
        $group: {
          _id: null,
          totalJournals: { $sum: 1 },
          totalLikes: { $sum: "$likes" },
          averageContentLength: { $avg: { $strLenCP: "$content" } },
          totalAttachments: { $sum: { $size: { $ifNull: ["$attachments", []] } } },
        },
      },
    ])

    return stats[0] || {
      totalJournals: 0,
      totalLikes: 0,
      averageContentLength: 0,
      totalAttachments: 0,
    }
  }

  /**
   * Get recent journals (global)
   */
  async findRecent(limit = 20) {
    return Journal.find({ privacy: "public" })
      .populate("author", JOURNAL_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }

  /**
   * Get journals with attachments
   */
  async findWithAttachments(
    userId?: string | mongoose.Types.ObjectId,
    limit = 50
  ) {
    const query: any = {
      attachments: { $exists: true, $not: { $size: 0 } },
    }

    if (userId) {
      query.author = userId
    } else {
      query.privacy = "public"
    }

    return Journal.find(query)
      .populate("author", JOURNAL_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }

  /**
   * Get monthly journal count for user
   */
  async getMonthlyCount(
    userId: string | mongoose.Types.ObjectId,
    months = 12
  ) {
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    return Journal.aggregate([
      {
        $match: {
          author: new mongoose.Types.ObjectId(userId as string),
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ])
  }

  /**
   * Get longest journal entry for user
   */
  async findLongest(userId: string | mongoose.Types.ObjectId) {
    return Journal.findOne({ author: userId })
      .sort({ $expr: { $strLenCP: "$content" } })
      .populate("author", JOURNAL_POPULATE_OPTIONS)
      .lean()
  }
}

// Export singleton instance
export const journalRepository = new JournalRepository()
