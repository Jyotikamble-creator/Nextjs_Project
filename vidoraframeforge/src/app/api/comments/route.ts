import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/server/db"
import Comment from "@/server/models/Comment"
import Video from "@/server/models/Video"
import Photo from "@/server/models/Photo"
import Journal from "@/server/models/Journal"
import { authOptions } from "@/server/auth-config/auth"
import { Logger, LogTags, categorizeError, ValidationError, DatabaseError } from "@/lib/logger"
import { sanitizeString } from "@/lib/validation"
import mongoose from "mongoose"

// GET /api/comments?contentType=video&contentId=xxx
export async function GET(request: NextRequest) {
  Logger.d(LogTags.AUTH, 'Comments fetch request received');

  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get("contentType")
    const contentId = searchParams.get("contentId")
    const limit = parseInt(searchParams.get("limit") || "50")

    if (!contentType || !contentId) {
      return NextResponse.json({ error: "Content type and ID are required" }, { status: 400 })
    }

    if (!["video", "photo", "journal"].includes(contentType)) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return NextResponse.json({ error: "Invalid content ID format" }, { status: 400 })
    }

    const comments = await Comment.find({ 
      contentType, 
      contentId,
      parentComment: { $exists: false } // Only root comments
    })
      .populate("author", "name email avatar")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    // Fetch replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate("author", "name email avatar")
          .sort({ createdAt: 1 })
          .lean()
        return { ...comment, replies }
      })
    )

    Logger.i(LogTags.AUTH, `Fetched ${comments.length} comments`)
    return NextResponse.json({ comments: commentsWithReplies, count: comments.length })
  } catch (error) {
    const categorizedError = categorizeError(error)
    Logger.e(LogTags.AUTH, 'Failed to fetch comments', { error: categorizedError })
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

// POST /api/comments - Create a comment
export async function POST(request: NextRequest) {
  Logger.d(LogTags.AUTH, 'Create comment request received');

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      Logger.w(LogTags.AUTH, 'Comment creation failed: unauthorized');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const body = await request.json()
    const { contentType, contentId, content, parentComment } = body

    // Validation
    if (!contentType || !contentId || !content) {
      return NextResponse.json({ error: "Content type, ID, and comment text are required" }, { status: 400 })
    }

    if (!["video", "photo", "journal"].includes(contentType)) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return NextResponse.json({ error: "Invalid content ID format" }, { status: 400 })
    }

    if (content.length > 500) {
      return NextResponse.json({ error: "Comment cannot exceed 500 characters" }, { status: 400 })
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

    // Create comment
    const comment = await Comment.create({
      author: session.user.id,
      contentType,
      contentId,
      content: sanitizeString(content),
      parentComment: parentComment || undefined
    })

    // Increment comment count on the content
    const Model = contentType === "video" ? Video : contentType === "photo" ? Photo : Journal
    await Model.findByIdAndUpdate(contentId, { $inc: { commentCount: 1 } })

    const populatedComment = await Comment.findById(comment._id)
      .populate("author", "name email avatar")
      .lean()

    Logger.i(LogTags.AUTH, `Comment created on ${contentType} ${contentId}`)
    return NextResponse.json({ comment: populatedComment }, { status: 201 })
  } catch (error) {
    const categorizedError = categorizeError(error)
    Logger.e(LogTags.AUTH, 'Failed to create comment', { error: categorizedError })
    
    if (categorizedError instanceof ValidationError) {
      return NextResponse.json({ error: categorizedError.message }, { status: 400 })
    }
    
    if (categorizedError instanceof DatabaseError) {
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 })
    }
    
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}

// PUT /api/comments?id=xxx - Update a comment
export async function PUT(request: NextRequest) {
  Logger.d(LogTags.AUTH, 'Update comment request received');

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get("id")
    const body = await request.json()
    const { content } = body

    if (!commentId || !content) {
      return NextResponse.json({ error: "Comment ID and content are required" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json({ error: "Invalid comment ID format" }, { status: 400 })
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Check ownership
    if (comment.author.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized to edit this comment" }, { status: 403 })
    }

    comment.content = sanitizeString(content)
    comment.isEdited = true
    await comment.save()

    const updatedComment = await Comment.findById(commentId)
      .populate("author", "name email avatar")
      .lean()

    Logger.i(LogTags.AUTH, `Comment ${commentId} updated`)
    return NextResponse.json({ comment: updatedComment })
  } catch (error) {
    const categorizedError = categorizeError(error)
    Logger.e(LogTags.AUTH, 'Failed to update comment', { error: categorizedError })
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 })
  }
}

// DELETE /api/comments?id=xxx
export async function DELETE(request: NextRequest) {
  Logger.d(LogTags.AUTH, 'Delete comment request received');

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get("id")

    if (!commentId) {
      return NextResponse.json({ error: "Comment ID is required" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json({ error: "Invalid comment ID format" }, { status: 400 })
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Check ownership
    if (comment.author.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized to delete this comment" }, { status: 403 })
    }

    // Delete comment and its replies
    await Comment.deleteMany({ $or: [{ _id: commentId }, { parentComment: commentId }] })

    // Decrement comment count
    const Model = comment.contentType === "video" ? Video : comment.contentType === "photo" ? Photo : Journal
    await Model.findByIdAndUpdate(comment.contentId, { $inc: { commentCount: -1 } })

    Logger.i(LogTags.AUTH, `Comment ${commentId} deleted`)
    return NextResponse.json({ message: "Comment deleted successfully" })
  } catch (error) {
    const categorizedError = categorizeError(error)
    Logger.e(LogTags.AUTH, 'Failed to delete comment', { error: categorizedError })
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}
