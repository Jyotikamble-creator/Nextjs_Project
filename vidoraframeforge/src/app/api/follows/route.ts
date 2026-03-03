import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/server/db"
import Follow from "@/server/models/Follow"
import User from "@/server/models/User"
import { authOptions } from "@/server/auth-config/auth"
import { Logger, LogTags, categorizeError, DatabaseError } from "@/lib/logger"
import mongoose from "mongoose"

// GET /api/follows?userId=xxx&type=followers|following
export async function GET(request: NextRequest) {
  Logger.d(LogTags.AUTH, 'Follow list fetch request received');

  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const type = searchParams.get("type") || "followers" // followers or following
    const limit = parseInt(searchParams.get("limit") || "50")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    let query: Record<string, unknown>
    if (type === "followers") {
      query = { following: userId }
    } else {
      query = { follower: userId }
    }

    const follows = await Follow.find(query)
      .populate(type === "followers" ? "follower" : "following", "name email avatar bio stats.followerCount stats.followingCount")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    const users = follows.map(follow => 
      type === "followers" 
        ? (follow as any).follower 
        : (follow as any).following
    )

    Logger.i(LogTags.AUTH, `Fetched ${users.length} ${type}`)
    return NextResponse.json({ users, count: users.length })
  } catch (error) {
    const categorizedError = categorizeError(error)
    Logger.e(LogTags.AUTH, `Failed to fetch ${searchParams.get("type") || "followers"}`, { error: categorizedError })
    return NextResponse.json({ error: "Failed to fetch follow list" }, { status: 500 })
  }
}

// POST /api/follows - Follow a user
export async function POST(request: NextRequest) {
  Logger.d(LogTags.AUTH, 'Follow user request received');

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      Logger.w(LogTags.AUTH, 'Follow request failed: unauthorized');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const body = await request.json()
    const { userId } = body // User to follow

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    // Can't follow yourself
    if (userId === session.user.id) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: session.user.id,
      following: userId
    })

    if (existingFollow) {
      return NextResponse.json({ error: "Already following this user" }, { status: 409 })
    }

    // Create follow relationship
    const follow = await Follow.create({
      follower: session.user.id,
      following: userId
    })

    // Update follower and following counts
    await Promise.all([
      User.findByIdAndUpdate(session.user.id, { $inc: { 'stats.followingCount': 1 } }),
      User.findByIdAndUpdate(userId, { $inc: { 'stats.followerCount': 1 } })
    ])

    Logger.i(LogTags.AUTH, `User ${session.user.id} followed user ${userId}`)
    return NextResponse.json({ message: "Successfully followed user", follow }, { status: 201 })
  } catch (error) {
    const categorizedError = categorizeError(error)
    Logger.e(LogTags.AUTH, 'Failed to follow user', { error: categorizedError })
    
    if (categorizedError instanceof DatabaseError) {
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 })
    }
    
    return NextResponse.json({ error: "Failed to follow user" }, { status: 500 })
  }
}

// DELETE /api/follows?userId=xxx - Unfollow a user
export async function DELETE(request: NextRequest) {
  Logger.d(LogTags.AUTH, 'Unfollow user request received');

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      Logger.w(LogTags.AUTH, 'Unfollow request failed: unauthorized');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    // Delete follow relationship
    const result = await Follow.findOneAndDelete({
      follower: session.user.id,
      following: userId
    })

    if (!result) {
      return NextResponse.json({ error: "Follow relationship not found" }, { status: 404 })
    }

    // Update follower and following counts
    await Promise.all([
      User.findByIdAndUpdate(session.user.id, { $inc: { 'stats.followingCount': -1 } }),
      User.findByIdAndUpdate(userId, { $inc: { 'stats.followerCount': -1 } })
    ])

    Logger.i(LogTags.AUTH, `User ${session.user.id} unfollowed user ${userId}`)
    return NextResponse.json({ message: "Successfully unfollowed user" })
  } catch (error) {
    const categorizedError = categorizeError(error)
    Logger.e(LogTags.AUTH, 'Failed to unfollow user', { error: categorizedError })
    
    if (categorizedError instanceof DatabaseError) {
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 })
    }
    
    return NextResponse.json({ error: "Failed to unfollow user" }, { status: 500 })
  }
}
