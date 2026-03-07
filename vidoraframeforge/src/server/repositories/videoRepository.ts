import Video from "@/server/models/Video"
import { Logger, LogTags } from "@/lib/logger"
import mongoose from "mongoose"

export interface VideoFilters {
  uploader?: string | mongoose.Types.ObjectId
  category?: string
  privacy?: "public" | "private" | "friends"
  tags?: string | string[]
  search?: string
  startDate?: Date
  endDate?: Date
}

export const VIDEO_POPULATE_OPTIONS = "name email avatar stats.followerCount"

export class VideoRepository {
  /**
   * Find video by ID
   */
  async findById(videoId: string | mongoose.Types.ObjectId, populate = true) {
    const query = Video.findById(videoId)
    
    if (populate) {
      query.populate("uploader", VIDEO_POPULATE_OPTIONS)
    }
    
    return query.lean()
  }

  /**
   * Find videos by user ID
   */
  async findByUser(
    userId: string | mongoose.Types.ObjectId,
    limit = 50,
    skip = 0
  ) {
    return Video.find({ uploader: userId })
      .populate("uploader", VIDEO_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
  }

  /**
   * Find all videos with filters
   */
  async findAll(filters: VideoFilters = {}, limit = 50, skip = 0) {
    const query: any = {}

    // User filter
    if (filters.uploader) {
      query.uploader = filters.uploader
    }

    // Category filter
    if (filters.category) {
      query.category = filters.category
    }

    // Privacy filter
    if (filters.privacy) {
      query.privacy = filters.privacy
    } else {
      // Default to public if not specified
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

    // Search filter (title and description)
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
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

    return Video.find(query)
      .populate("uploader", VIDEO_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
  }

  /**
   * Search videos with text search
   */
  async search(searchTerm: string, limit = 50) {
    return Video.find(
      { $text: { $search: searchTerm }, privacy: "public" },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .populate("uploader", VIDEO_POPULATE_OPTIONS)
      .limit(limit)
      .lean()
  }

  /**
   * Create a new video
   */
  async create(videoData: {
    uploader: string | mongoose.Types.ObjectId
    title: string
    description?: string
    videoUrl: string
    thumbnailUrl?: string
    fileId?: string
    fileName?: string
    size?: number
    duration?: number
    category?: string
    tags?: string[]
    privacy?: "public" | "private" | "friends"
    transformation?: any
  }) {
    const video = await Video.create(videoData)
    Logger.i(LogTags.VIDEO_UPLOAD, `Video created: ${video._id}`, {
      title: video.title,
      uploader: video.uploader,
    })
    return video.toObject()
  }

  /**
   * Update video by ID
   */
  async update(
    videoId: string | mongoose.Types.ObjectId,
    updateData: Partial<{
      title: string
      description: string
      category: string
      tags: string[]
      privacy: "public" | "private" | "friends"
      thumbnailUrl: string
    }>
  ) {
    const video = await Video.findByIdAndUpdate(
      videoId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    )
      .populate("uploader", VIDEO_POPULATE_OPTIONS)
      .lean()

    Logger.i(LogTags.VIDEO_UPDATE, `Video updated: ${videoId}`)
    return video
  }

  /**
   * Delete video by ID
   */
  async delete(videoId: string | mongoose.Types.ObjectId) {
    const result = await Video.findByIdAndDelete(videoId)
    if (result) {
      Logger.i(LogTags.VIDEO_DELETE, `Video deleted: ${videoId}`)
    }
    return result
  }

  /**
   * Increment video views
   */
  async incrementViews(videoId: string | mongoose.Types.ObjectId) {
    return Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    ).lean()
  }

  /**
   * Increment video likes
   */
  async incrementLikes(
    videoId: string | mongoose.Types.ObjectId,
    amount = 1
  ) {
    return Video.findByIdAndUpdate(
      videoId,
      { $inc: { likes: amount } },
      { new: true }
    ).lean()
  }

  /**
   * Increment comment count
   */
  async incrementComments(
    videoId: string | mongoose.Types.ObjectId,
    amount = 1
  ) {
    return Video.findByIdAndUpdate(
      videoId,
      { $inc: { commentCount: amount } },
      { new: true }
    ).lean()
  }

  /**
   * Get videos by category
   */
  async findByCategory(category: string, limit = 50) {
    return Video.find({ category, privacy: "public" })
      .populate("uploader", VIDEO_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }

  /**
   * Get videos by tags
   */
  async findByTags(tags: string[], limit = 50) {
    return Video.find({ tags: { $in: tags }, privacy: "public" })
      .populate("uploader", VIDEO_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }

  /**
   * Get trending videos (most views recently)
   */
  async findTrending(limit = 20) {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    return Video.find({
      privacy: "public",
      createdAt: { $gte: oneWeekAgo },
    })
      .populate("uploader", VIDEO_POPULATE_OPTIONS)
      .sort({ views: -1, likes: -1 })
      .limit(limit)
      .lean()
  }

  /**
   * Get recommended videos (similar tags or category)
   */
  async findRecommended(
    videoId: string | mongoose.Types.ObjectId,
    limit = 10
  ) {
    const currentVideo = await Video.findById(videoId).lean()
    if (!currentVideo) return []

    return Video.find({
      _id: { $ne: videoId },
      privacy: "public",
      $or: [
        { tags: { $in: currentVideo.tags || [] } },
        { category: currentVideo.category },
      ],
    })
      .populate("uploader", VIDEO_POPULATE_OPTIONS)
      .sort({ views: -1, createdAt: -1 })
      .limit(limit)
      .lean()
  }

  /**
   * Count videos with filters
   */
  async count(filters: VideoFilters = {}): Promise<number> {
    const query: any = {}

    if (filters.uploader) {
      query.uploader = filters.uploader
    }

    if (filters.category) {
      query.category = filters.category
    }

    if (filters.privacy) {
      query.privacy = filters.privacy
    }

    if (filters.tags) {
      query.tags = Array.isArray(filters.tags)
        ? { $in: filters.tags }
        : filters.tags
    }

    return Video.countDocuments(query)
  }

  /**
   * Check if video exists and user is owner
   */
  async isOwner(
    videoId: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId
  ): Promise<boolean> {
    const video = await Video.findById(videoId).select("uploader").lean()
    return video?.uploader?.toString() === userId.toString()
  }

  /**
   * Get unique categories
   */
  async getCategories(): Promise<string[]> {
    const categories = await Video.distinct("category", { privacy: "public" })
    return categories.filter((c) => c) // Filter out null/undefined
  }

  /**
   * Get unique tags from user's videos
   */
  async getUserTags(userId: string | mongoose.Types.ObjectId): Promise<string[]> {
    const videos = await Video.find({ uploader: userId })
      .select("tags")
      .lean()
    
    const allTags = videos.flatMap((v) => v.tags || [])
    return [...new Set(allTags)].sort()
  }

  /**
   * Get video statistics for user
   */
  async getUserStats(userId: string | mongoose.Types.ObjectId) {
    const stats = await Video.aggregate([
      { $match: { uploader: new mongoose.Types.ObjectId(userId as string) } },
      {
        $group: {
          _id: null,
          totalVideos: { $sum: 1 },
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: "$likes" },
          averageViews: { $avg: "$views" },
        },
      },
    ])

    return stats[0] || {
      totalVideos: 0,
      totalViews: 0,
      totalLikes: 0,
      averageViews: 0,
    }
  }
}

// Export singleton instance
export const videoRepository = new VideoRepository()
