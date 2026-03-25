import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { Logger, LogTags, categorizeError, DatabaseError } from "@/lib/logger"

interface MediaItem {
  id: string
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

    // Build common filters
    const dateFilter = startDate || endDate ? {
      createdAt: {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {})
      }
    } : {}

    const searchFilter = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    } : {}

    const tagFilter = tag ? { tags: { hasSome: [tag] } } : {}
    const userFilter = userId ? { uploaderId: userId } : { isPublic: true }

    let allMedia: MediaItem[] = []

    // Fetch photos
    if (!type || type === 'all' || type === 'photo') {
      const photos = await prisma.photo.findMany({
        where: {
          ...userFilter,
          ...dateFilter,
          ...tagFilter,
          ...searchFilter
        },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              avatar: true,
              email: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
        take: limit
      })

      allMedia.push(...photos.map((photo: any) => ({
        ...photo,
        type: 'photo' as const
      })))
    }

    // Fetch videos (note: videos use uploaderId field)
    if (!type || type === 'all' || type === 'video') {
      const videos = await prisma.video.findMany({
        where: {
          ...userFilter,
          ...dateFilter,
          ...tagFilter,
          ...searchFilter
        },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              avatar: true,
              email: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
        take: limit
      })

      allMedia.push(...videos.map((video: any) => ({
        ...video,
        type: 'video' as const
      })))
    }

    // Fetch journals (note: journals use authorId field)
    if (!type || type === 'all' || type === 'journal') {
      const journalUserFilter = userId ? { authorId: userId } : { isPublic: true }
      const journals = await prisma.journal.findMany({
        where: {
          ...journalUserFilter,
          ...dateFilter,
          ...tagFilter,
          ...searchFilter
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
              email: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
        take: limit
      })

      allMedia.push(...journals.map((journal: any) => ({
        ...journal,
        type: 'journal' as const,
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
