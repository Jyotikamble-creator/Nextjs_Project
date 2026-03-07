import Video, { IVideo } from "@/server/models/Video"
import { connectToDatabase } from "@/server/db"
import { Logger, LogTags } from "@/lib/logger"
import { updateUserStats, USER_POPULATE_OPTIONS, isValidObjectId } from "@/server/utils/apiHelpers"
import { buildSearchQuery, buildCategoryQuery, buildUserQuery, mergeQueries } from "@/server/utils/queryHelpers"
import mongoose from "mongoose"

interface VideoFilters {
  category?: string | null
  search?: string | null
  userId?: string | null
  limit?: number
}

interface CreateVideoData {
  title: string
  description?: string
  videoUrl: string
  thumbnailUrl: string
  category?: string
  tags?: string[]
  isPublic?: boolean
  privacy?: string
  fileId?: string
  fileName?: string
  size?: number
  duration?: number
  transformation?: any
  album?: string
  location?: string
}

interface DeleteResult {
  success: boolean
  message: string
  notFound?: boolean
}

/**
 * Video Service
 * Contains all business logic for video operations
 * Handles database interactions and data processing
 */
export class VideoService {
  /**
   * Get videos with optional filters
   */
  async getVideos(filters: VideoFilters): Promise<IVideo[]> {
    await connectToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connected for video fetch')

    const query: Record<string, unknown> = {}
    
    // Build category filter
    if (filters.category) {
      Object.assign(query, buildCategoryQuery(filters.category))
    }

    // Build search filter
    if (filters.search) {
      Object.assign(query, buildSearchQuery(filters.search, ["title", "description"]))
    }

    // Build user filter
    if (filters.userId) {
      if (!isValidObjectId(filters.userId)) {
        throw new Error("Invalid user ID format")
      }
      Object.assign(query, buildUserQuery(filters.userId, "uploader"))
    }

    Logger.d(LogTags.VIDEO_FETCH, 'Executing video query', { query, limit: filters.limit })

    const videos = await Video.find(query)
      .populate("uploader", USER_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 20)
      .lean()

    Logger.i(LogTags.VIDEO_FETCH, `Found ${videos.length} videos`)

    return videos as unknown as IVideo[]
  }

  /**
   * Get video by ID
   */
  async getVideoById(
    videoId: string, 
    options: { incrementViews?: boolean } = {}
  ): Promise<IVideo | null> {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new Error("Invalid video ID format")
    }

    Logger.d(LogTags.VIDEO_FETCH, 'Fetching video by ID', { videoId, incrementViews: options.incrementViews })

    // Increment views if requested
    if (options.incrementViews) {
      const video = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { views: 1 } },
        { new: true }
      )
        .populate("uploader", USER_POPULATE_OPTIONS)
        .lean()

      Logger.d(LogTags.VIDEO_FETCH, 'Video views incremented', { videoId })
      
      return video as IVideo | null
    }

    // Just fetch without incrementing views
    const video = await Video.findById(videoId)
      .populate("uploader", USER_POPULATE_OPTIONS)
      .lean()

    return video as unknown as IVideo | null
  }

  /**
   * Get user's videos
   */
  async getUserVideos(userId: string, limit: number = 20): Promise<IVideo[]> {
    await connectToDatabase()

    if (!isValidObjectId(userId)) {
      throw new Error("Invalid user ID format")
    }

    Logger.d(LogTags.VIDEO_FETCH, 'Fetching videos for user', { userId, limit })

    const videos = await Video.find({ uploader: userId })
      .populate("uploader", USER_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    Logger.i(LogTags.VIDEO_FETCH, `Found ${videos.length} videos for user`, { userId })

    return videos as unknown as IVideo[]
  }

  /**
   * Create new video
   */
  async createVideo(userId: string, videoData: CreateVideoData): Promise<IVideo> {
    await connectToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connected for video creation')

    if (!isValidObjectId(userId)) {
      throw new Error("Invalid user ID format")
    }

    // Create video document
    const video = await Video.create({
      ...videoData,
      uploader: userId,
      views: 0,
      likes: 0,
      commentCount: 0,
      createdAt: new Date()
    })

    Logger.d(LogTags.VIDEO_UPLOAD, 'Video document created', { videoId: video._id })

    // Update user stats
    await updateUserStats(userId, { totalVideos: 1 })
    Logger.d(LogTags.VIDEO_UPLOAD, 'User stats updated', { userId })

    // Populate and return
    const populatedVideo = await Video.findById(video._id)
      .populate("uploader", USER_POPULATE_OPTIONS)
      .lean()

    Logger.i(LogTags.VIDEO_UPLOAD, 'Video created successfully', { 
      videoId: video._id, 
      title: videoData.title,
      userId 
    })

    return populatedVideo as unknown as IVideo
  }

  /**
   * Delete video (with ownership check)
   */
  async deleteVideo(videoId: string, userId: string): Promise<DeleteResult> {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new Error("Invalid video ID format")
    }

    Logger.d(LogTags.VIDEO_DELETE, 'Attempting to delete video', { videoId, userId })

    // Find video
    const video = await Video.findById(videoId).lean() as any

    if (!video) {
      Logger.w(LogTags.VIDEO_DELETE, 'Video not found', { videoId })
      return {
        success: false,
        message: "Video not found",
        notFound: true
      }
    }

    // Check ownership
    if (video.uploader.toString() !== userId) {
      Logger.w(LogTags.VIDEO_DELETE, 'Unauthorized delete attempt', { videoId, userId, ownerId: video.uploader })
      return {
        success: false,
        message: "Unauthorized to delete this video"
      }
    }

    // Delete video
    await Video.findByIdAndDelete(videoId)
    Logger.d(LogTags.VIDEO_DELETE, 'Video deleted from database', { videoId })

    // Update user stats
    await updateUserStats(userId, { totalVideos: -1 })
    Logger.d(LogTags.VIDEO_DELETE, 'User stats decremented', { userId })

    Logger.i(LogTags.VIDEO_DELETE, 'Video deleted successfully', { videoId, userId })

    return {
      success: true,
      message: "Video deleted successfully"
    }
  }

  /**
   * Update video (future implementation)
   */
  async updateVideo(videoId: string, userId: string, updates: Partial<CreateVideoData>): Promise<IVideo | null> {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new Error("Invalid video ID format")
    }

    // Find and check ownership
    const video = await Video.findById(videoId).lean() as any
    if (!video || video.uploader.toString() !== userId) {
      return null
    }

    // Update video
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { $set: updates },
      { new: true }
    )
      .populate("uploader", USER_POPULATE_OPTIONS)
      .lean()

    Logger.i(LogTags.VIDEO_UPDATE, 'Video updated successfully', { videoId, userId })

    return updatedVideo as unknown as IVideo
  }

  /**
   * Get videos by category
   */
  async getVideosByCategory(category: string, limit: number = 20): Promise<IVideo[]> {
    await connectToDatabase()

    Logger.d(LogTags.VIDEO_FETCH, 'Fetching videos by category', { category, limit })

    const videos = await Video.find({ category, privacy: 'public' })
      .populate("uploader", USER_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return videos as unknown as IVideo[]
  }

  /**
   * Search videos
   */
  async searchVideos(searchTerm: string, limit: number = 20): Promise<IVideo[]> {
    await connectToDatabase()

    const query = buildSearchQuery(searchTerm, ["title", "description"])

    Logger.d(LogTags.VIDEO_FETCH, 'Searching videos', { searchTerm, limit })

    const videos = await Video.find(query)
      .populate("uploader", USER_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    Logger.i(LogTags.VIDEO_FETCH, `Found ${videos.length} videos matching search`, { searchTerm })

    return videos as unknown as IVideo[]
  }

  /**
   * Get trending videos (by views)
   */
  async getTrendingVideos(limit: number = 10): Promise<IVideo[]> {
    await connectToDatabase()

    Logger.d(LogTags.VIDEO_FETCH, 'Fetching trending videos', { limit })

    const videos = await Video.find({ privacy: 'public' })
      .populate("uploader", USER_POPULATE_OPTIONS)
      .sort({ views: -1, createdAt: -1 })
      .limit(limit)
      .lean()

    return videos as unknown as IVideo[]
  }
}
