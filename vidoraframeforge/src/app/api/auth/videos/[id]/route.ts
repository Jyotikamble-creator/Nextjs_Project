import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectionToDatabase } from "@/server/db"
import Video from "@/server/models/Video"
import { authOptions } from "@/server/auth-config/auth"
import { Logger, LogTags, categorizeError, DatabaseError, ValidationError } from "@/lib/logger"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  Logger.d(LogTags.VIDEO_DELETE, 'Video deletion request received', { videoId: params.id });

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      Logger.w(LogTags.VIDEO_DELETE, 'Video deletion failed: unauthorized access attempt');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    Logger.d(LogTags.VIDEO_DELETE, 'User authenticated', { userId: session.user.id });

    await connectionToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connection established for video deletion');

    // Find the video first to check ownership
    const video = await Video.findById(params.id)

    if (!video) {
      Logger.w(LogTags.VIDEO_DELETE, 'Video deletion failed: video not found', { videoId: params.id });
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Check if the user owns the video
    if (video.uploader.toString() !== session.user.id) {
      Logger.w(LogTags.VIDEO_DELETE, 'Video deletion failed: unauthorized - user does not own video', {
        videoId: params.id,
        videoOwner: video.uploader.toString(),
        requestingUser: session.user.id
      });
      return NextResponse.json({ error: "You can only delete your own videos" }, { status: 403 })
    }

    // Delete the video
    await Video.findByIdAndDelete(params.id)

    Logger.i(LogTags.VIDEO_DELETE, 'Video deleted successfully', {
      videoId: params.id,
      userId: session.user.id,
      title: video.title
    });

    return NextResponse.json({ message: "Video deleted successfully" })
  } catch (error) {
    const categorizedError = categorizeError(error);

    if (categorizedError instanceof DatabaseError) {
      Logger.e(LogTags.DB_ERROR, `Database error in video deletion: ${categorizedError.message}`);
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 });
    }

    Logger.e(LogTags.VIDEO_DELETE, `Unexpected error in video deletion: ${categorizedError.message}`, categorizedError);
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 })
  }
}