import { type NextRequest, NextResponse } from "next/server"
import { connectionToDatabase } from "@/server/db"
import User from "@/server/models/User"
import { Logger, LogTags, categorizeError, DatabaseError } from "@/lib/logger"

export async function GET(request: NextRequest) {
  Logger.d(LogTags.AUTH, 'User stats request received');

  try {
    await connectionToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connection established for user stats');

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      Logger.w(LogTags.AUTH, 'User stats request failed: missing user ID');
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    Logger.d(LogTags.AUTH, 'Fetching stats for user', { userId });

    const user = await User.findById(userId).select('stats')

    if (!user) {
      Logger.w(LogTags.AUTH, 'User stats request failed: user not found', { userId });
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    Logger.i(LogTags.AUTH, 'User stats fetched successfully', {
      userId,
      stats: user.stats
    });

    return NextResponse.json({ stats: user.stats })
  } catch (error) {
    const categorizedError = categorizeError(error);

    if (categorizedError instanceof DatabaseError) {
      Logger.e(LogTags.DB_ERROR, `Database error in user stats fetch: ${categorizedError.message}`);
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 });
    }

    Logger.e(LogTags.AUTH, `Unexpected error in user stats fetch: ${categorizedError.message}`, categorizedError);
    return NextResponse.json({ error: "Failed to fetch user stats" }, { status: 500 })
  }
}