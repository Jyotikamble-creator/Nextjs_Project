import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/server/db"
import Like from "@/server/models/Like"
import Video from "@/server/models/Video"
import Photo from "@/server/models/Photo"
import Journal from "@/server/models/Journal"
import { authOptions } from "@/server/auth-config/auth"
import { Logger, LogTags, categorizeError, DatabaseError } from "@/lib/logger"
import mongoose from "mongoose"

// GET /api/likes?contentType=video&contentId=xxx - Check if user liked and get like count
export async function GET(request: NextRequest) {
  Logger.d(LogTags.AUTH, 'Like status fetch request received');

  try {
    const session = await getServerSession(authOptions)
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get("contentType")
    const contentId = searchParams.get("contentId")

    if (!contentType || !contentId) {
      return NextResponse.json({ error: "Content type and ID are required" }, { status: 400 })
    }

    if (!["video", "photo", "journal"].includes(contentType)) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return NextResponse.json({ error: "Invalid content ID format" }, { status: 400 })
    }

    // Get total like count
    const likeCount = await Like.countDocuments({ contentType, contentId })

    // Check if current user liked (if authenticated)
    let isLiked = false
    if (session?.user) {
      const userLike = await Like.findOne({
        user: session.user.id,
        contentType,
        contentId
      })
      isLiked = !!userLike
    }

    return NextResponse.json({ likeCount, isLiked })
  } catch (error) {
    const categorizedError = categorizeError(error)
    Logger.e(LogTags.AUTH, 'Failed to fetch like status', { error: categorizedError })
    return NextResponse.json({ error: "Failed to fetch like status" }, { status: 500 })
  }
}

// POST /api/likes - Like content
export async function POST(request: NextRequest) {
  Logger.d(LogTags.AUTH, 'Like content request received');

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      Logger.w(LogTags.AUTH, 'Like request failed: unauthorized');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const body = await request.json()
    const { contentType, contentId } = body

    if (!contentType || !contentId) {
      return NextResponse.json({ error: "Content type and ID are required" }, { status: 400 })
    }

    if (!["video", "photo", "journal"].includes(contentType)) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return NextResponse.json({ error: "Invalid content ID format" }, { status: 400 })
    }

    // Verify content exists
    let contentExists = false
    switch (contentType) {
      case "video":
        contentExists = !!(await Video.findById(contentId))
        break
      case "photo":
        contentExists = !!(await Photo.findById(contentId))
        break
      case "journal":
        contentExists = !!(await Journal.findById(contentId))
        break
    }

    if (!contentExists) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    // Check if already liked
    const existingLike = await Like.findOne({
      user: session.user.id,
      contentType,
      contentId
    })

    if (existingLike) {
      return NextResponse.json({ error: "Already liked this content" }, { status: 409 })
    }

    // Create like
    const like = await Like.create({
      user: session.user.id,
      contentType,
      contentId
    })

    // Increment like count on the content
    const Model = contentType === "video" ? Video : contentType === "photo" ? Photo : Journal
    await Model.findByIdAndUpdate(contentId, { $inc: { likes: 1 } })

    Logger.i(LogTags.AUTH, `User ${session.user.id} liked ${contentType} ${contentId}`)
    return NextResponse.json({ message: "Successfully liked content", like }, { status: 201 })
  } catch (error) {
    const categorizedError = categorizeError(error)
    Logger.e(LogTags.AUTH, 'Failed to like content', { error: categorizedError })
    
    if (categorizedError instanceof DatabaseError) {
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 })
    }
    
    return NextResponse.json({ error: "Failed to like content" }, { status: 500 })
  }
}

// DELETE /api/likes?contentType=video&contentId=xxx - Unlike content
export async function DELETE(request: NextRequest) {
  Logger.d(LogTags.AUTH, 'Unlike content request received');

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      Logger.w(LogTags.AUTH, 'Unlike request failed: unauthorized');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get("contentType")
    const contentId = searchParams.get("contentId")

    if (!contentType || !contentId) {
      return NextResponse.json({ error: "Content type and ID are required" }, { status: 400 })
    }

    if (!["video", "photo", "journal"].includes(contentType)) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return NextResponse.json({ error: "Invalid content ID format" }, { status: 400 })
    }

    // Delete like
    const result = await Like.findOneAndDelete({
      user: session.user.id,
      contentType,
      contentId
    })

    if (!result) {
      return NextResponse.json({ error: "Like not found" }, { status: 404 })
    }

    // Decrement like count on the content
    const Model = contentType === "video" ? Video : contentType === "photo" ? Photo : Journal
    await Model.findByIdAndUpdate(contentId, { $inc: { likes: -1 } })

    Logger.i(LogTags.AUTH, `User ${session.user.id} unliked ${contentType} ${contentId}`)
    return NextResponse.json({ message: "Successfully unliked content" })
  } catch (error) {
    const categorizedError = categorizeError(error)
    Logger.e(LogTags.AUTH, 'Failed to unlike content', { error: categorizedError })
    
    if (categorizedError instanceof DatabaseError) {
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 })
    }
    
    return NextResponse.json({ error: "Failed to unlike content" }, { status: 500 })
  }
}
