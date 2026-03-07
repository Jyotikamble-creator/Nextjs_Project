import Photo from "@/server/models/Photo"
import { Logger, LogTags } from "@/lib/logger"
import mongoose from "mongoose"

export interface PhotoFilters {
  uploader?: string | mongoose.Types.ObjectId
  album?: string
  tags?: string | string[]
  search?: string
  startDate?: Date
  endDate?: Date
  privacy?: boolean
}

export const PHOTO_POPULATE_OPTIONS = "name email avatar"

export class PhotoRepository {
  /**
   * Find photo by ID
   */
  async findById(photoId: string | mongoose.Types.ObjectId, populate = true) {
    const query = Photo.findById(photoId)
    
    if (populate) {
      query.populate("uploader", PHOTO_POPULATE_OPTIONS)
    }
    
    return query.lean()
  }

  /**
   * Find photos by user ID
   */
  async findByUser(
    userId: string | mongoose.Types.ObjectId,
    limit = 50,
    skip = 0
  ) {
    return Photo.find({ uploader: userId })
      .populate("uploader", PHOTO_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
  }

  /**
   * Find all photos with filters
   */
  async findAll(filters: PhotoFilters = {}, limit = 50, skip = 0) {
    const query: any = {}

    // User filter
    if (filters.uploader) {
      query.uploader = filters.uploader
    }

    // Album filter
    if (filters.album) {
      query.album = filters.album
    }

    // Privacy filter
    if (filters.privacy !== undefined) {
      query.isPublic = filters.privacy
    } else {
      // Default to public
      query.isPublic = true
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

    return Photo.find(query)
      .populate("uploader", PHOTO_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
  }

  /**
   * Search photos with text search
   */
  async search(searchTerm: string, limit = 50) {
    return Photo.find(
      { $text: { $search: searchTerm }, isPublic: true },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .populate("uploader", PHOTO_POPULATE_OPTIONS)
      .limit(limit)
      .lean()
  }

  /**
   * Create a new photo
   */
  async create(photoData: {
    uploader: string | mongoose.Types.ObjectId
    title?: string
    description?: string
    photoUrl: string
    thumbnailUrl?: string
    fileId?: string
    fileName?: string
    size?: number
    width?: number
    height?: number
    album?: string
    tags?: string[]
    location?: string
    takenAt?: Date
    isPublic?: boolean
  }) {
    const photo = await Photo.create(photoData)
    Logger.i(LogTags.PHOTO_UPLOAD, `Photo created: ${photo._id}`, {
      title: photo.title,
      uploader: photo.uploader,
    })
    return photo.toObject()
  }

  /**
   * Update photo by ID
   */
  async update(
    photoId: string | mongoose.Types.ObjectId,
    updateData: Partial<{
      title: string
      description: string
      album: string
      tags: string[]
      location: string
      isPublic: boolean
    }>
  ) {
    const photo = await Photo.findByIdAndUpdate(
      photoId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    )
      .populate("uploader", PHOTO_POPULATE_OPTIONS)
      .lean()

    Logger.i(LogTags.PHOTO_UPDATE, `Photo updated: ${photoId}`)
    return photo
  }

  /**
   * Delete photo by ID
   */
  async delete(photoId: string | mongoose.Types.ObjectId) {
    const result = await Photo.findByIdAndDelete(photoId)
    if (result) {
      Logger.i(LogTags.PHOTO_DELETE, `Photo deleted: ${photoId}`)
    }
    return result
  }

  /**
   * Increment photo likes
   */
  async incrementLikes(
    photoId: string | mongoose.Types.ObjectId,
    amount = 1
  ) {
    return Photo.findByIdAndUpdate(
      photoId,
      { $inc: { likes: amount } },
      { new: true }
    ).lean()
  }

  /**
   * Increment comment count
   */
  async incrementComments(
    photoId: string | mongoose.Types.ObjectId,
    amount = 1
  ) {
    return Photo.findByIdAndUpdate(
      photoId,
      { $inc: { commentCount: amount } },
      { new: true }
    ).lean()
  }

  /**
   * Get photos by album
   */
  async findByAlbum(
    album: string,
    userId?: string | mongoose.Types.ObjectId,
    limit = 50
  ) {
    const query: any = { album }
    
    if (userId) {
      query.uploader = userId
    } else {
      query.isPublic = true
    }

    return Photo.find(query)
      .populate("uploader", PHOTO_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }

  /**
   * Get photos by tags
   */
  async findByTags(tags: string[], limit = 50) {
    return Photo.find({ tags: { $in: tags }, isPublic: true })
      .populate("uploader", PHOTO_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }

  /**
   * Get photos by location
   */
  async findByLocation(location: string, limit = 50) {
    return Photo.find({
      location: { $regex: location, $options: "i" },
      isPublic: true,
    })
      .populate("uploader", PHOTO_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }

  /**
   * Count photos with filters
   */
  async count(filters: PhotoFilters = {}): Promise<number> {
    const query: any = {}

    if (filters.uploader) {
      query.uploader = filters.uploader
    }

    if (filters.album) {
      query.album = filters.album
    }

    if (filters.tags) {
      query.tags = Array.isArray(filters.tags)
        ? { $in: filters.tags }
        : filters.tags
    }

    if (filters.privacy !== undefined) {
      query.isPublic = filters.privacy
    }

    return Photo.countDocuments(query)
  }

  /**
   * Check if photo exists and user is owner
   */
  async isOwner(
    photoId: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId
  ): Promise<boolean> {
    const photo = await Photo.findById(photoId).select("uploader").lean()
    return photo?.uploader?.toString() === userId.toString()
  }

  /**
   * Get unique albums for user
   */
  async getUserAlbums(userId: string | mongoose.Types.ObjectId): Promise<string[]> {
    const albums = await Photo.distinct("album", { uploader: userId })
    return albums.filter((a) => a) // Filter out null/undefined
  }

  /**
   * Get unique tags from user's photos
   */
  async getUserTags(userId: string | mongoose.Types.ObjectId): Promise<string[]> {
    const photos = await Photo.find({ uploader: userId })
      .select("tags")
      .lean()
    
    const allTags = photos.flatMap((p) => p.tags || [])
    return [...new Set(allTags)].sort()
  }

  /**
   * Get photo statistics for user
   */
  async getUserStats(userId: string | mongoose.Types.ObjectId) {
    const stats = await Photo.aggregate([
      { $match: { uploader: new mongoose.Types.ObjectId(userId as string) } },
      {
        $group: {
          _id: null,
          totalPhotos: { $sum: 1 },
          totalLikes: { $sum: "$likes" },
          totalSize: { $sum: "$size" },
        },
      },
    ])

    return stats[0] || {
      totalPhotos: 0,
      totalLikes: 0,
      totalSize: 0,
    }
  }

  /**
   * Get recent photos (global)
   */
  async findRecent(limit = 20) {
    return Photo.find({ isPublic: true })
      .populate("uploader", PHOTO_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }

  /**
   * Get photos taken in a date range
   */
  async findByDateTaken(startDate: Date, endDate: Date, limit = 50) {
    return Photo.find({
      takenAt: { $gte: startDate, $lte: endDate },
      isPublic: true,
    })
      .populate("uploader", PHOTO_POPULATE_OPTIONS)
      .sort({ takenAt: -1 })
      .limit(limit)
      .lean()
  }

  /**
   * Get album count for user
   */
  async getAlbumCount(userId: string | mongoose.Types.ObjectId): Promise<number> {
    const albums = await this.getUserAlbums(userId)
    return albums.length
  }

  /**
   * Get photos count by album for user
   */
  async getPhotosPerAlbum(userId: string | mongoose.Types.ObjectId) {
    return Photo.aggregate([
      { $match: { uploader: new mongoose.Types.ObjectId(userId as string) } },
      { $group: { _id: "$album", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
  }
}

// Export singleton instance
export const photoRepository = new PhotoRepository()
