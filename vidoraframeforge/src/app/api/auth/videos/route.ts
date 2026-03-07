import { type NextRequest, NextResponse } from "next/server"
import { VideoController } from "@/server/controllers/video.controller"

/**
 * Video API Routes
 * Thin route handlers that delegate to VideoController
 */

const videoController = new VideoController()

// GET /api/auth/videos?category=gaming&search=tutorial&userId=123&limit=10
export async function GET(request: NextRequest) {
  return videoController.getVideos(request)
}

// POST /api/auth/videos
export async function POST(request: NextRequest) {
  return videoController.createVideo(request)
}

// Keep old implementation commented for reference
/*
export async function GET_OLD(request: NextRequest) {
  Logger.d(LogTags.VIDEO_FETCH, 'Video fetch request received');

  try {
    await connectToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connection established for video fetch');

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const userId = searchParams.get("userId")
    const limit = parseInt(searchParams.get("limit") || "50")

    Logger.d(LogTags.VIDEO_FETCH, 'Query parameters parsed', { category, hasSearch: !!search, userId, limit });

    // Build query using helpers
    const baseQuery: Record<string, unknown> = userId ? {} : { isPublic: true }
    const categoryQuery = buildCategoryQuery(category)
    const searchQuery = search ? buildSearchQuery(search, ["title", "description"]) : {}
    
    let userQuery = {}
    if (userId) {
      try {
        userQuery = buildUserQuery(userId, "uploader")
      } catch (error) {
        Logger.w(LogTags.VIDEO_FETCH, 'Invalid userId format', { userId });
        return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
      }
    }

    const query = mergeQueries(baseQuery, categoryQuery, searchQuery, userQuery)
    Logger.d(LogTags.VIDEO_FETCH, 'Final query:', query);

    // Optimized query with lean and limited fields
    const videos = await Video.find(query)
      .populate("uploader", USER_POPULATE_OPTIONS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    Logger.i(LogTags.VIDEO_FETCH, `Videos fetched successfully: ${videos.length} videos returned`);
    return NextResponse.json(videos)
  } catch (error) {
    const categorizedError = categorizeError(error);

    if (categorizedError instanceof DatabaseError) {
      Logger.e(LogTags.DB_ERROR, `Database error in video fetch: ${categorizedError.message}`);
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 });
    }

    Logger.e(LogTags.VIDEO_FETCH, `Unexpected error in video fetch: ${categorizedError.message}`, { error: categorizedError });
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

    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
      Logger.w(LogTags.VIDEO_UPLOAD, 'Video creation failed: invalid user ID format', { userId: session.user.id });
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    await connectToDatabase()
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

    try {
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
      Logger.d(LogTags.VIDEO_UPLOAD, 'Video created in database', { videoId: video._id.toString() });
      console.log('Video created:', { id: video._id, title: video.title, uploader: video.uploader });

      const populatedVideo = await Video.findById(video._id)
        .populate("uploader", USER_POPULATE_OPTIONS)
        .lean()
      Logger.d(LogTags.VIDEO_UPLOAD, 'Video populated with uploader data', { videoId: video._id.toString() });

      // Update user stats using helper
      await updateUserStats(session.user.id, { totalVideos: 1 });

      Logger.i(LogTags.VIDEO_UPLOAD, 'Video created successfully', {
        videoId: video._id.toString(),
        userId: session.user.id,
        title: sanitizedTitle
      });

      return NextResponse.json(populatedVideo, { status: 201 })
    } catch (dbError) {
      Logger.e(LogTags.DB_ERROR, 'Database operation failed', { error: dbError });
      console.error('Video creation error:', dbError);
      throw dbError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    // Log the raw error for debugging
    Logger.e(LogTags.VIDEO_UPLOAD, 'Raw error in video creation', { error });

    const categorizedError = categorizeError(error);

    if (categorizedError instanceof ValidationError) {
      Logger.e(LogTags.VIDEO_UPLOAD, `Validation error in video creation: ${categorizedError.message}`, { error: categorizedError });
      return NextResponse.json({ error: categorizedError.message }, { status: 400 });
    }

    if (categorizedError instanceof DatabaseError) {
      Logger.e(LogTags.DB_ERROR, `Database error in video creation: ${categorizedError.message}`, { error: categorizedError });
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 });
    }

    Logger.e(LogTags.VIDEO_UPLOAD, `Unexpected error in video creation: ${categorizedError.message}`, { error: categorizedError });
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 })
  }
}
*/
