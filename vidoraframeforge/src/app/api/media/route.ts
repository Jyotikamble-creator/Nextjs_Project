import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"
import Video from "@/server/models/Video"
import Photo from "@/server/models/Photo"
import Journal from "@/server/models/Journal"
import { Logger, LogTags, categorizeError, DatabaseError } from "@/lib/logger"
import { 
  buildSearchQuery, 
  buildTagQuery, 
  buildUserQuery,
  buildDateRangeQuery,
  mergeQueries 
} from "@/server/utils/queryHelpers"
import { USER_POPULATE_OPTIONS } from "@/server/utils/apiHelpers"

interface MediaItem {
  _id: string
  type: 'photo' | 'video' | 'journal'
  title?: string
  content?: string
  description?: string
  url?: string
  videoUrl?: string
  thumbnailUrl?: string
  tags?: string[]
  createdAt: Date
  uploader?: any
  author?: any
}

export async function GET(request: NextRequest) {
  Logger.d(LogTags.AUTH, 'Unified media fetch request received');

  try {
    await connectToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connection established for media fetch');

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // photo, video, journal, or 'all'
    const search = searchParams.get("search")
    const tag = searchParams.get("tag")
    const userId = searchParams.get("userId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limit = parseInt(searchParams.get("limit") || "100")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    Logger.d(LogTags.AUTH, 'Query parameters', { type, hasSearch: !!search, tag, userId, limit });

    // Build common query filters
    const baseQuery: Record<string, unknown> = userId ? {} : { isPublic: true }
    const tagQuery = buildTagQuery(tag)
    const dateQuery = buildDateRangeQuery(startDate, endDate, "createdAt")
    
    let userQuery = {}
    if (userId) {
      try {
        userQuery = buildUserQuery(userId, "uploader")
      } catch (error) {
        Logger.w(LogTags.AUTH, 'Invalid userId format', { userId });
        return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
      }
    }

    const commonQuery = mergeQueries(baseQuery, tagQuery, dateQuery)
    const sort: any = sortOrder === "asc" ? { [sortBy]: 1 } : { [sortBy]: -1 }

    let allMedia: MediaItem[] = []

    // Fetch photos
    if (!type || type === 'all' || type === 'photo') {
      const photoQuery = mergeQueries(commonQuery, userId ? userQuery : {})
      if (search) {
        Object.assign(photoQuery, buildSearchQuery(search, ["title", "description"]))
      }

      const photos = await Photo.find(photoQuery)
        .populate("uploader", USER_POPULATE_OPTIONS)
        .sort(sort)
        .limit(limit)
        .lean()

      allMedia.push(...photos.map((photo: any) => ({
        ...photo,
        _id: photo._id.toString(),
        type: 'photo' as const,
        createdAt: photo.createdAt
      })))
    }

    // Fetch videos
    if (!type || type === 'all' || type === 'video') {
      const videoQuery = mergeQueries(commonQuery, userId ? userQuery : {})
      if (search) {
        Object.assign(videoQuery, buildSearchQuery(search, ["title", "description"]))
      }

      const videos = await Video.find(videoQuery)
        .populate("uploader", USER_POPULATE_OPTIONS)
        .sort(sort)
        .limit(limit)
        .lean()

      allMedia.push(...videos.map((video: any) => ({
        ...video,
        _id: video._id.toString(),
        type: 'video' as const,
        createdAt: video.createdAt
      })))
    }

    // Fetch journals
    if (!type || type === 'all' || type === 'journal') {
      // For journals, use 'author' field instead of 'uploader'
      const journalUserQuery = userId ? buildUserQuery(userId, "author") : {}
      const journalQuery = mergeQueries(commonQuery, journalUserQuery)
      if (search) {
        Object.assign(journalQuery, buildSearchQuery(search, ["title", "content"]))
      }

      const journals = await Journal.find(journalQuery)
        .populate("author", USER_POPULATE_OPTIONS)
        .sort(sort)
        .limit(limit)
        .lean()

      allMedia.push(...journals.map((journal: any) => ({
        ...journal,
        _id: journal._id.toString(),
        type: 'journal' as const,
        createdAt: journal.createdAt,
        uploader: journal.author // Normalize field name
      })))
    }

    // Sort all media by date
    allMedia.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB
    })

    // Apply limit to combined results
    if (allMedia.length > limit) {
      allMedia = allMedia.slice(0, limit)
    }

    Logger.i(LogTags.AUTH, `Media fetched successfully: ${allMedia.length} items returned`);
    
    return NextResponse.json({
      media: allMedia,
      total: allMedia.length,
      filters: { type, search, tag, startDate, endDate }
    })
  } catch (error) {
    const categorizedError = categorizeError(error);

    if (categorizedError instanceof DatabaseError) {
      Logger.e(LogTags.DB_ERROR, `Database error in media fetch: ${categorizedError.message}`);
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 });
    }

    Logger.e(LogTags.AUTH, `Unexpected error in media fetch: ${categorizedError.message}`, { error: categorizedError });
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 })
  }
}
