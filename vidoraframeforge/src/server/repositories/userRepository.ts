import User from "@/server/models/User"
import { Logger, LogTags } from "@/lib/logger"
import mongoose from "mongoose"

export interface UserFilters {
  email?: string
  role?: string
  search?: string
}

export class UserRepository {
  /**
   * Find user by ID
   */
  async findById(userId: string | mongoose.Types.ObjectId) {
    return User.findById(userId).lean()
  }

  /**
   * Find user by ID with password included (for authentication)
   */
  async findByIdWithPassword(userId: string | mongoose.Types.ObjectId) {
    return User.findById(userId).select("+password").lean()
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    return User.findOne({ email: email.toLowerCase().trim() }).lean()
  }

  /**
   * Find user by email with password (for authentication)
   */
  async findByEmailWithPassword(email: string) {
    return User.findOne({ email: email.toLowerCase().trim() })
      .select("+password")
      .lean()
  }

  /**
   * Find multiple users with filters
   */
  async findAll(filters: UserFilters = {}, limit = 50, skip = 0) {
    const query: any = {}

    if (filters.email) {
      query.email = filters.email.toLowerCase().trim()
    }

    if (filters.role) {
      query.role = filters.role
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } },
      ]
    }

    return User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
  }

  /**
   * Create a new user
   */
  async create(userData: {
    name: string
    email: string
    password: string
    role?: string
    avatar?: string
  }) {
    const user = await User.create({
      ...userData,
      email: userData.email.toLowerCase().trim(),
    })
    Logger.i(LogTags.AUTH, `User created: ${user._id}`)
    return user.toObject()
  }

  /**
   * Update user by ID
   */
  async update(
    userId: string | mongoose.Types.ObjectId,
    updateData: Partial<{
      name: string
      email: string
      password: string
      avatar: string
      bio: string
      role: string
    }>
  ) {
    const user = await User.findByIdAndUpdate(
      userId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    )
      .select("-password")
      .lean()

    Logger.i(LogTags.USER_UPDATE, `User updated: ${userId}`)
    return user
  }

  /**
   * Update user stats
   */
  async updateStats(
    userId: string | mongoose.Types.ObjectId,
    statsUpdate: {
      totalPhotos?: number
      totalVideos?: number
      totalJournals?: number
      streak?: number
      followerCount?: number
      followingCount?: number
    }
  ) {
    const updateFields: any = {}
    
    Object.entries(statsUpdate).forEach(([key, value]) => {
      updateFields[`stats.${key}`] = value
    })

    return User.findByIdAndUpdate(userId, updateFields, { new: true })
      .select("-password")
      .lean()
  }

  /**
   * Increment user stats
   */
  async incrementStats(
    userId: string | mongoose.Types.ObjectId,
    field: "totalPhotos" | "totalVideos" | "totalJournals" | "followerCount" | "followingCount",
    amount = 1
  ) {
    return User.findByIdAndUpdate(
      userId,
      { $inc: { [`stats.${field}`]: amount } },
      { new: true }
    )
      .select("-password")
      .lean()
  }

  /**
   * Update last active timestamp
   */
  async updateLastActive(userId: string | mongoose.Types.ObjectId) {
    return User.findByIdAndUpdate(
      userId,
      { "stats.lastActive": new Date() },
      { new: true }
    )
      .select("-password")
      .lean()
  }

  /**
   * Delete user by ID
   */
  async delete(userId: string | mongoose.Types.ObjectId) {
    const result = await User.findByIdAndDelete(userId)
    if (result) {
      Logger.i(LogTags.AUTH, `User deleted: ${userId}`)
    }
    return result
  }

  /**
   * Check if user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await User.countDocuments({
      email: email.toLowerCase().trim(),
    })
    return count > 0
  }

  /**
   * Check if user exists by ID
   */
  async existsById(userId: string | mongoose.Types.ObjectId): Promise<boolean> {
    const count = await User.countDocuments({ _id: userId })
    return count > 0
  }

  /**
   * Count total users
   */
  async count(filters: UserFilters = {}): Promise<number> {
    const query: any = {}

    if (filters.role) {
      query.role = filters.role
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } },
      ]
    }

    return User.countDocuments(query)
  }

  /**
   * Get user statistics
   */
  async getStats(userId: string | mongoose.Types.ObjectId) {
    const user = await User.findById(userId).select("stats").lean()
    return user?.stats || null
  }

  /**
   * Find users by IDs (for populating multiple users)
   */
  async findByIds(userIds: (string | mongoose.Types.ObjectId)[]) {
    return User.find({ _id: { $in: userIds } })
      .select("name email avatar stats.followerCount stats.followingCount")
      .lean()
  }
}

// Export singleton instance
export const userRepository = new UserRepository()
