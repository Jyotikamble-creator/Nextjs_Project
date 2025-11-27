import { NextResponse } from "next/server"
import { connectionToDatabase } from "@/server/db"
import Video from "@/server/models/Video"
import { Logger, LogTags, categorizeError, DatabaseError } from "@/lib/logger"

// Server-side GET handler to return a video by id: /api/auth/video?id=...
export async function GET(req: Request) {
  Logger.d(LogTags.VIDEO_FETCH, 'Video retrieval request received');

  try {
    await connectionToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connection established for video retrieval');

    const url = new URL(req.url)
    const id = url.searchParams.get("id")

    if (!id) {
      Logger.w(LogTags.VIDEO_FETCH, 'Video retrieval failed: missing id parameter');
      return NextResponse.json({ error: "Missing id query parameter" }, { status: 400 })
    }

    Logger.d(LogTags.VIDEO_FETCH, 'Fetching video by ID', { videoId: id });

    const video = await Video.findById(id).populate("uploader", "name email")

    if (!video) {
      Logger.w(LogTags.VIDEO_FETCH, 'Video retrieval failed: video not found', { videoId: id });
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // increment views and return updated video
    const updatedVideo = await Video.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("uploader", "name email")

    Logger.i(LogTags.VIDEO_FETCH, 'Video retrieved and views incremented successfully', {
      videoId: id,
      title: updatedVideo.title,
      newViews: updatedVideo.views
    });

    return NextResponse.json(updatedVideo)
  } catch (error) {
    const categorizedError = categorizeError(error);

    if (categorizedError instanceof DatabaseError) {
      Logger.e(LogTags.DB_ERROR, `Database error in video retrieval: ${categorizedError.message}`);
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 });
    }

    Logger.e(LogTags.VIDEO_FETCH, `Unexpected error in video retrieval: ${categorizedError.message}`, { error: categorizedError });
    return NextResponse.json({ error: "Failed to retrieve video" }, { status: 500 })
  }
}
