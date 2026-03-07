import Photo, { IPhoto } from "@/server/models/Photo"
import { connectToDatabase } from "@/server/db"
import { Logger, LogTags } from "@/lib/logger"
import { updateUserStats, USER_POPULATE_OPTIONS, isValidObjectId } from "@/server/utils/apiHelpers"
import { buildSearchQuery, buildAlbumQuery, buildUserQuery, mergeQueries } from "@/server/utils/queryHelpers"
import mongoose from "mongoose"

interface PhotoFilters {
  album?: string | null
  search?: string | null
  userId?: string | null
  limit?: number
}

interface CreatePhotoData {
  title?: string
  description?: string
  url: string
  thumbnailUrl?: string
  width?: number
  height?: number
  tags?: string[]
  album?: string
  location?: string
  takenAt?: Date
  privacy?: string
  fileId?: string
  fileName?: string
  size?: number
}

interface DeleteResult {
  success: boolean
  message: string
  notFound?: boolean
}

/**
 * Photo Service
 * Contains all business logic for photo operations
 * Handles database interactions and data processing
 */
export class PhotoService {
  /**
   * Get photos with optional filters
   */
  async getPhotos(filters: PhotoFilters): Promise<IPhoto[]> {
    await connectToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connected for photo fetch')

    const query: Record<string, unknown> = {}
    
    // Build album filter
    if (filters.album) {
      Object.assign(query, buildAlbumQuery(filters.album))
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

    Logger.d(LogTags.PHOTO_FETCH, 'Executing photo query', { query, limit: filters.limit })

    const photos = await Photo.find(query)
      .populate("uploader", USER_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 20)
      .lean()

    Logger.i(LogTags.PHOTO_FETCH, `Found ${photos.length} photos`)

    return photos as unknown as IPhoto[]
  }

  /**
   * Get photo by ID
   */
  async getPhotoById(photoId: string): Promise<IPhoto | null> {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(photoId)) {
      throw new Error("Invalid photo ID format")
    }

    Logger.d(LogTags.PHOTO_FETCH, 'Fetching photo by ID', { photoId })

    const photo = await Photo.findById(photoId)
      .populate("uploader", USER_POPULATE_OPTIONS)
      .lean()

    return photo as unknown as IPhoto | null
  }

  /**
   * Get user's photos
   */
  async getUserPhotos(userId: string, limit: number = 20): Promise<IPhoto[]> {
    await connectToDatabase()

    if (!isValidObjectId(userId)) {
      throw new Error("Invalid user ID format")
    }

    Logger.d(LogTags.PHOTO_FETCH, 'Fetching photos for user', { userId, limit })

    const photos = await Photo.find({ uploader: userId })
      .populate("uploader", USER_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    Logger.i(LogTags.PHOTO_FETCH, `Found ${photos.length} photos for user`, { userId })

    return photos as unknown as IPhoto[]
  }

  /**
   * Create new photo
   */
  async createPhoto(userId: string, photoData: CreatePhotoData): Promise<IPhoto> {
    await connectToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connected for photo creation')

    if (!isValidObjectId(userId)) {
      throw new Error("Invalid user ID format")
    }

    // Create photo document
    const photo = await Photo.create({
      ...photoData,
      uploader: userId,
      createdAt: new Date()
    })

    Logger.d(LogTags.PHOTO_UPLOAD, 'Photo document created', { photoId: photo._id })

    // Update user stats
    await updateUserStats(userId, { totalPhotos: 1 })
    Logger.d(LogTags.PHOTO_UPLOAD, 'User stats updated', { userId })

    // Populate and return
    const populatedPhoto = await Photo.findById(photo._id)
      .populate("uploader", USER_POPULATE_OPTIONS)
      .lean()

    Logger.i(LogTags.PHOTO_UPLOAD, 'Photo created successfully', { 
      photoId: photo._id, 
      title: photoData.title,
      userId 
    })

    return populatedPhoto as unknown as IPhoto
  }

  /**
   * Update photo (with ownership check)
   */
  async updatePhoto(photoId: string, userId: string, updates: Partial<CreatePhotoData>): Promise<IPhoto | null> {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(photoId)) {
      throw new Error("Invalid photo ID format")
    }

    Logger.d(LogTags.PHOTO_UPDATE, 'Attempting to update photo', { photoId, userId })

    // Find and check ownership
    const photo = await Photo.findById(photoId).lean() as any
    if (!photo || photo.uploader.toString() !== userId) {
      Logger.w(LogTags.PHOTO_UPDATE, 'Photo not found or unauthorized', { photoId, userId })
      return null
    }

    // Update photo
    const updatedPhoto = await Photo.findByIdAndUpdate(
      photoId,
      { $set: updates },
      { new: true }
    )
      .populate("uploader", USER_POPULATE_OPTIONS)
      .lean()

    Logger.i(LogTags.PHOTO_UPDATE, 'Photo updated successfully', { photoId, userId })

    return updatedPhoto as unknown as IPhoto
  }

  /**
   * Delete photo (with ownership check)
   */
  async deletePhoto(photoId: string, userId: string): Promise<DeleteResult> {
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(photoId)) {
      throw new Error("Invalid photo ID format")
    }

    Logger.d(LogTags.PHOTO_DELETE, 'Attempting to delete photo', { photoId, userId })

    // Find photo
    const photo = await Photo.findById(photoId).lean() as any

    if (!photo) {
      Logger.w(LogTags.PHOTO_DELETE, 'Photo not found', { photoId })
      return {
        success: false,
        message: "Photo not found",
        notFound: true
      }
    }

    // Check ownership
    if (photo.uploader.toString() !== userId) {
      Logger.w(LogTags.PHOTO_DELETE, 'Unauthorized delete attempt', { photoId, userId, ownerId: photo.uploader })
      return {
        success: false,
        message: "Unauthorized to delete this photo"
      }
    }

    // Delete photo
    await Photo.findByIdAndDelete(photoId)
    Logger.d(LogTags.PHOTO_DELETE, 'Photo deleted from database', { photoId })

    // Update user stats
    await updateUserStats(userId, { totalPhotos: -1 })
    Logger.d(LogTags.PHOTO_DELETE, 'User stats decremented', { userId })

    Logger.i(LogTags.PHOTO_DELETE, 'Photo deleted successfully', { photoId, userId })

    return {
      success: true,
      message: "Photo deleted successfully"
    }
  }

  /**
   * Get photos by album
   */
  async getPhotosByAlbum(album: string, limit: number = 20): Promise<IPhoto[]> {
    await connectToDatabase()

    Logger.d(LogTags.PHOTO_FETCH, 'Fetching photos by album', { album, limit })

    const photos = await Photo.find({ album, privacy: 'public' })
      .populate("uploader", USER_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return photos as unknown as IPhoto[]
  }

  /**
   * Search photos
   */
  async searchPhotos(searchTerm: string, limit: number = 20): Promise<IPhoto[]> {
    await connectToDatabase()

    const query = buildSearchQuery(searchTerm, ["title", "description"])

    Logger.d(LogTags.PHOTO_FETCH, 'Searching photos', { searchTerm, limit })

    const photos = await Photo.find(query)
      .populate("uploader", USER_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    Logger.i(LogTags.PHOTO_FETCH, `Found ${photos.length} photos matching search`, { searchTerm })

    return photos as unknown as IPhoto[]
  }

  /**
   * Get photos by tag
   */
  async getPhotosByTag(tag: string, limit: number = 20): Promise<IPhoto[]> {
    await connectToDatabase()

    Logger.d(LogTags.PHOTO_FETCH, 'Fetching photos by tag', { tag, limit })

    const photos = await Photo.find({ tags: tag, privacy: 'public' })
      .populate("uploader", USER_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return photos as unknown as IPhoto[]
  }
}
