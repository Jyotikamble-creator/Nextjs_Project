import { NextResponse } from "next/server"
import { connectionToDatabase } from "@/server/db"
import Video from "@/server/models/Video"

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

    // increment views and return updated video
    const updatedVideo = await Video.findByIdAndUpdate(
      id, 
      { $inc: { views: 1 } }, 
      { new: true }
    ).populate("uploader", "name email")

    return NextResponse.json(updatedVideo)
  } catch (err: unknown) {
    console.error("API GET /api/auth/video error:", err)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
