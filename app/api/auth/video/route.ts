import { authOptions } from "@/lib/auth"
import { connectionToDatabase } from "@/lib/db"
import Video, { type IVideo } from "@/models/Video"
import { getServerSession } from "next-auth"
import { type NextRequest, NextResponse } from "next/server"

// GET all videos
export async function GET() {
  try {
    await connectionToDatabase()
    const videos = await Video.find({}).sort({ createdAt: -1 }).lean()

    return NextResponse.json(videos, { status: 200 })
  } catch (error) {
    console.error("Failed to fetch videos:", error)
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
  }
}

// POST new video
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectionToDatabase()

    const body: IVideo = await request.json()

    if (!body.title || !body.description || !body.videoUrl || !body.thumbnailUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const videoData = {
      ...body,
      uploader: session.user?.email,
      controls: body?.controls ?? true,
      transformation: {
        height: body.transformation?.height ?? 1080,
        width: body.transformation?.width ?? 1920,
        quality: body.transformation?.quality ?? 100, // Fixed typo
      },
    }

    const newVideo = await Video.create(videoData)

    return NextResponse.json(newVideo, { status: 201 })
  } catch (error) {
    console.error("Video upload error:", error)
    return NextResponse.json({ error: "Failed to upload video" }, { status: 500 })
  }
}

