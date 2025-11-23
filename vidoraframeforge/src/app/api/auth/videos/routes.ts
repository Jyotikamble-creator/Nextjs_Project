import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectionToDatabase } from "@/server/db"
import Video from "@/server/models/Video"
import { authOptions } from "@/server/auth-config/auth"

export async function GET(request: NextRequest) {
  try {
    await connectionToDatabase()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const userId = searchParams.get("userId")

    const query: Record<string, unknown> = {}

    // Only filter by isPublic if not fetching user's own videos
    if (!userId) {
      query.isPublic = true
    }

    if (category && category !== "all") {
      query.category = category
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ]
    }

    if (userId) {
      query.uploader = userId
    }

    const videos = await Video.find(query).populate("uploader", "name avatar").sort({ createdAt: -1 }).limit(50)

    return NextResponse.json(videos)
  } catch (error) {
    console.error("Error fetching videos:", error)
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectionToDatabase()

    const body = await request.json()
    const { title, description, videoUrl, thumbnailUrl, category, tags, isPublic, fileId, duration, size } = body

    const video = await Video.create({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      uploader: session.user.id,
      category,
      tags: tags || [],
      isPublic: isPublic !== false,
      fileId,
      duration: duration || 0,
      size: size || 0,
    })

    const populatedVideo = await Video.findById(video._id).populate("uploader", "name avatar")

    return NextResponse.json(populatedVideo, { status: 201 })
  } catch (error) {
    console.error("Error creating video:", error)
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 })
  }
}
