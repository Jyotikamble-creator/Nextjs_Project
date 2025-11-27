import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectionToDatabase } from "@/server/db"
import Video from "@/server/models/Video"
import { authOptions } from "@/server/auth-config/auth"
import { Logger, LogTags, categorizeError, ValidationError, DatabaseError } from "@/lib/logger"
import { isValidVideoTitle, isValidVideoDescription, sanitizeString } from "@/lib/validation"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  Logger.d(LogTags.VIDEO_FETCH, 'Video fetch request received');

  try {
    await connectionToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connection established for video fetch');

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const userId = searchParams.get("userId")

    Logger.d(LogTags.VIDEO_FETCH, 'Query parameters parsed', { category, hasSearch: !!search, userId });

    const query: Record<string, unknown> = {}

    // Only filter by isPublic if not fetching user's own videos
    if (!userId) {
      query.isPublic = true
    }

    if (category && category !== "all") {
      query.category = sanitizeString(category)
    }

    if (search) {
      const sanitizedSearch = sanitizeString(search)
      query.$or = [
        { title: { $regex: sanitizedSearch, $options: "i" } },
        { description: { $regex: sanitizedSearch, $options: "i" } }
      ]
      Logger.d(LogTags.VIDEO_FETCH, 'Search query applied', { searchTerm: sanitizedSearch });
    }

    if (userId) {
      query.uploader = new mongoose.Types.ObjectId(userId)
      Logger.d(LogTags.VIDEO_FETCH, 'User-specific video fetch', { userId });
    }

    const videos = await Video.find(query).populate("uploader", "name avatar").sort({ createdAt: -1 }).limit(50)

    Logger.i(LogTags.VIDEO_FETCH, `Videos fetched successfully: ${videos.length} videos returned`);
    return NextResponse.json(videos)
  } catch (error) {
    const categorizedError = categorizeError(error);

    if (categorizedError instanceof DatabaseError) {
      Logger.e(LogTags.DB_ERROR, `Database error in video fetch: ${categorizedError.message}`);
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 });
    }

    Logger.e(LogTags.VIDEO_FETCH, `Unexpected error in video fetch: ${categorizedError.message}`, categorizedError);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  Logger.d(LogTags.VIDEO_UPLOAD, 'Video creation request received');

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      Logger.w(LogTags.VIDEO_UPLOAD, 'Video creation failed: unauthorized access attempt');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    Logger.d(LogTags.VIDEO_UPLOAD, 'User authenticated', { userId: session.user.id });

    await connectionToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connection established for video creation');

    const body = await request.json()
    const { title, description, videoUrl, thumbnailUrl, category, tags, isPublic, fileId, duration, size } = body

    Logger.d(LogTags.VIDEO_UPLOAD, 'Request body parsed', {
      hasTitle: !!title,
      hasVideoUrl: !!videoUrl,
      hasThumbnailUrl: !!thumbnailUrl,
      category,
      tagsCount: tags?.length || 0
    });

    // Validate required fields
    if (!title || !videoUrl || !thumbnailUrl) {
      Logger.w(LogTags.VIDEO_UPLOAD, 'Video creation failed: missing required fields', {
        hasTitle: !!title,
        hasVideoUrl: !!videoUrl,
        hasThumbnailUrl: !!thumbnailUrl
      });
      return NextResponse.json({ error: "Title, video URL, and thumbnail URL are required" }, { status: 400 })
    }

    // Validate title
    if (!isValidVideoTitle(title)) {
      Logger.w(LogTags.VIDEO_UPLOAD, 'Video creation failed: invalid title', { title });
      return NextResponse.json({ error: "Title must be between 1 and 100 characters" }, { status: 400 })
    }

    // Validate description if provided
    if (description && !isValidVideoDescription(description)) {
      Logger.w(LogTags.VIDEO_UPLOAD, 'Video creation failed: invalid description length');
      return NextResponse.json({ error: "Description must be less than 1000 characters" }, { status: 400 })
    }

    // Sanitize inputs
    const sanitizedTitle = sanitizeString(title);
    const sanitizedDescription = description ? sanitizeString(description) : '';
    const sanitizedCategory = category ? sanitizeString(category) : undefined;

    Logger.d(LogTags.VIDEO_UPLOAD, 'Input validation passed', { title: sanitizedTitle });

    const video = await Video.create({
      title: sanitizedTitle,
      description: sanitizedDescription,
      videoUrl,
      thumbnailUrl,
      uploader: session.user.id,
      category: sanitizedCategory,
      tags: tags || [],
      isPublic: isPublic !== false,
      fileId,
      duration: duration || 0,
      size: size || 0,
    })

    const populatedVideo = await Video.findById(video._id).populate("uploader", "name avatar")

    Logger.i(LogTags.VIDEO_UPLOAD, 'Video created successfully', {
      videoId: video._id.toString(),
      userId: session.user.id,
      title: sanitizedTitle
    });

    return NextResponse.json(populatedVideo, { status: 201 })
  } catch (error) {
    const categorizedError = categorizeError(error);

    if (categorizedError instanceof ValidationError) {
      Logger.e(LogTags.VIDEO_UPLOAD, `Validation error in video creation: ${categorizedError.message}`);
      return NextResponse.json({ error: categorizedError.message }, { status: 400 });
    }

    if (categorizedError instanceof DatabaseError) {
      Logger.e(LogTags.DB_ERROR, `Database error in video creation: ${categorizedError.message}`);
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 });
    }

    Logger.e(LogTags.VIDEO_UPLOAD, `Unexpected error in video creation: ${categorizedError.message}`, categorizedError);
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 })
  }
}
