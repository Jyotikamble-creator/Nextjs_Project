import { NextResponse } from "next/server"
import { connectionToDatabase } from "@/lib/db"
import Video from "@/models/Video"

// Server-side GET handler to return a video by id: /api/auth/video?id=...
export async function GET(req: Request) {
  try {
  await connectionToDatabase()

    const url = new URL(req.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ message: "Missing id query parameter" }, { status: 400 })
    }

    const video = await Video.findById(id).populate("uploader", "name email")

    if (!video) return NextResponse.json({ message: "Video not found" }, { status: 404 })

    // increment views
    video.views = (video.views || 0) + 1
    await video.save()

    return NextResponse.json(video)
  } catch (err: any) {
    console.error("API GET /api/auth/video error:", err)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
