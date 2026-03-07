import Follow from "@/server/models/Follow"
import { Logger, LogTags } from "@/lib/logger"
import mongoose from "mongoose"

export interface FollowFilters {
  follower?: string | mongoose.Types.ObjectId
  following?: string | mongoose.Types.ObjectId
}

export const FOLLOW_USER_POPULATE_OPTIONS =
  "name email avatar bio stats.followerCount stats.followingCount"

export class FollowRepository {
  /**
   * Find follow relationship by ID
   */
  async findById(followId: string | mongoose.Types.ObjectId) {
    return Follow.findById(followId).lean()
  }

  /**
   * Find specific follow relationship
   */
  async findOne(
    followerId: string | mongoose.Types.ObjectId,
    followingId: string | mongoose.Types.ObjectId
  ) {
    return Follow.findOne({
      follower: followerId,
      following: followingId,
    }).lean()
  }

  /**
   * Check if user A follows user B
   */
  async isFollowing(
    followerId: string | mongoose.Types.ObjectId,
    followingId: string | mongoose.Types.ObjectId
  ): Promise<boolean> {
    const follow = await this.findOne(followerId, followingId)
    return !!follow
  }

  /**
   * Check if two users follow each other (mutual follow)
   */
  async areMutualFollowers(
    userId1: string | mongoose.Types.ObjectId,
    userId2: string | mongoose.Types.ObjectId
  ): Promise<boolean> {
    const follow1 = await this.isFollowing(userId1, userId2)
    const follow2 = await this.isFollowing(userId2, userId1)
    return follow1 && follow2
  }

  /**
   * Get all followers for a user
   */
  async findFollowers(
    userId: string | mongoose.Types.ObjectId,
    limit = 50,
    skip = 0
  ) {
    return Follow.find({ following: userId })
      .populate("follower", FOLLOW_USER_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
  }

  /**
   * Get all users that a user is following
   */
  async findFollowing(
    userId: string | mongoose.Types.ObjectId,
    limit = 50,
    skip = 0
  ) {
    return Follow.find({ follower: userId })
      .populate("following", FOLLOW_USER_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
  }

  /**
   * Get follower list (just user objects)
   */
  async getFollowersList(
    userId: string | mongoose.Types.ObjectId,
    limit = 50
  ) {
    const follows = await this.findFollowers(userId, limit)
    return follows.map((f: any) => f.follower).filter((u) => u)
  }

  /**
   * Get following list (just user objects)
   */
  async getFollowingList(
    userId: string | mongoose.Types.ObjectId,
    limit = 50
  ) {
    const follows = await this.findFollowing(userId, limit)
    return follows.map((f: any) => f.following).filter((u) => u)
  }

  /**
   * Create a follow relationship
   */
  async create(
    followerId: string | mongoose.Types.ObjectId,
    followingId: string | mongoose.Types.ObjectId
  ) {
    // Check if already following
    const existing = await this.findOne(followerId, followingId)
    if (existing) {
      Logger.w(LogTags.AUTH, "User already following this user")
      return null
    }

    // Can't follow yourself
    if (followerId.toString() === followingId.toString()) {
      Logger.w(LogTags.AUTH, "User cannot follow themselves")
      return null
    }

    const follow = await Follow.create({
      follower: followerId,
      following: followingId,
    })

    Logger.i(LogTags.AUTH, `Follow created: ${follow._id}`, {
      follower: followerId,
      following: followingId,
    })

    return follow.toObject()
  }

  /**
   * Delete a follow relationship
   */
  async delete(
    followerId: string | mongoose.Types.ObjectId,
    followingId: string | mongoose.Types.ObjectId
  ) {
    const result = await Follow.findOneAndDelete({
      follower: followerId,
      following: followingId,
    })

    if (result) {
      Logger.i(LogTags.AUTH, `Follow deleted: ${result._id}`)
    }

    return result
  }

  /**
   * Delete follow by ID
   */
  async deleteById(followId: string | mongoose.Types.ObjectId) {
    const result = await Follow.findByIdAndDelete(followId)
    if (result) {
      Logger.i(LogTags.AUTH, `Follow deleted: ${followId}`)
    }
    return result
  }

  /**
   * Count followers for a user
   */
  async countFollowers(userId: string | mongoose.Types.ObjectId): Promise<number> {
    return Follow.countDocuments({ following: userId })
  }

  /**
   * Count following for a user
   */
  async countFollowing(userId: string | mongoose.Types.ObjectId): Promise<number> {
    return Follow.countDocuments({ follower: userId })
  }

  /**
   * Get follow statistics for user
   */
  async getUserStats(userId: string | mongoose.Types.ObjectId) {
    const [followerCount, followingCount] = await Promise.all([
      this.countFollowers(userId),
      this.countFollowing(userId),
    ])

    return {
      followerCount,
      followingCount,
      ratio: followingCount > 0 ? followerCount / followingCount : 0,
    }
  }

  /**
   * Get mutual followers (users who follow each other with this user)
   */
  async getMutualFollowers(
    userId: string | mongoose.Types.ObjectId,
    limit = 50
  ) {
    // Get users this user follows
    const following = await Follow.find({ follower: userId })
      .select("following")
      .lean()
    const followingIds = following.map((f: any) => f.following)

    // Get users who follow this user AND are in the following list
    return Follow.find({
      following: userId,
      follower: { $in: followingIds },
    })
      .populate("follower", FOLLOW_USER_POPULATE_OPTIONS)
      .limit(limit)
      .lean()
  }

  /**
   * Get suggested users to follow (friends of friends)
   */
  async getSuggestedFollows(
    userId: string | mongoose.Types.ObjectId,
    limit = 10
  ) {
    // Get users this user follows
    const following = await Follow.find({ follower: userId })
      .select("following")
      .lean()
    const followingIds = following.map((f: any) => f.following.toString())

    // Get users that people this user follows also follow
    const suggestions = await Follow.find({
      follower: { $in: followingIds },
      following: { $ne: userId, $nin: followingIds },
    })
      .populate("following", FOLLOW_USER_POPULATE_OPTIONS)
      .limit(limit * 3) // Get more to deduplicate
      .lean()

    // Count occurrences (more mutual connections = better suggestion)
    const suggestionMap = new Map()
    suggestions.forEach((s: any) => {
      const id = s.following._id.toString()
      if (!suggestionMap.has(id)) {
        suggestionMap.set(id, { user: s.following, count: 0 })
      }
      suggestionMap.get(id).count++
    })

    // Sort by count and return top suggestions
    return Array.from(suggestionMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((s) => s.user)
  }

  /**
   * Delete all follows for a user (when user is deleted)
   */
  async deleteAllByUser(userId: string | mongoose.Types.ObjectId) {
    const [asFollower, asFollowing] = await Promise.all([
      Follow.deleteMany({ follower: userId }),
      Follow.deleteMany({ following: userId }),
    ])

    Logger.i(
      LogTags.AUTH,
      `Deleted ${asFollower.deletedCount} following and ${asFollowing.deletedCount} followers for user ${userId}`
    )

    return {
      deletedAsFollower: asFollower.deletedCount,
      deletedAsFollowing: asFollowing.deletedCount,
      total: asFollower.deletedCount + asFollowing.deletedCount,
    }
  }

  /**
   * Get recent followers (newest followers)
   */
  async getRecentFollowers(
    userId: string | mongoose.Types.ObjectId,
    limit = 10
  ) {
    return Follow.find({ following: userId })
      .populate("follower", FOLLOW_USER_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }

  /**
   * Get recent following (newest users followed)
   */
  async getRecentFollowing(
    userId: string | mongoose.Types.ObjectId,
    limit = 10
  ) {
    return Follow.find({ follower: userId })
      .populate("following", FOLLOW_USER_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }

  /**
   * Bulk check if user follows multiple users
   */
  async isFollowingMultiple(
    followerId: string | mongoose.Types.ObjectId,
    followingIds: (string | mongoose.Types.ObjectId)[]
  ): Promise<{ [userId: string]: boolean }> {
    const follows = await Follow.find({
      follower: followerId,
      following: { $in: followingIds },
    })
      .select("following")
      .lean()

    const result: { [userId: string]: boolean } = {}
    followingIds.forEach((id) => {
      result[id.toString()] = false
    })

    follows.forEach((follow: any) => {
      result[follow.following.toString()] = true
    })

    return result
  }

  /**
   * Get follow activity timeline (recent follows in network)
   */
  async getFollowActivity(
    userId: string | mongoose.Types.ObjectId,
    limit = 20
  ) {
    // Get users this user follows
    const following = await Follow.find({ follower: userId })
      .select("following")
      .lean()
    const followingIds = following.map((f: any) => f.following)

    // Get recent follow activity from these users
    return Follow.find({ follower: { $in: followingIds } })
      .populate("follower", FOLLOW_USER_POPULATE_OPTIONS)
      .populate("following", FOLLOW_USER_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }
}

// Export singleton instance
export const followRepository = new FollowRepository()
