import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"
import Journal from "@/server/models/Journal"
import Photo from "@/server/models/Photo"
import Video from "@/server/models/Video"
import User from "@/server/models/User"
import { Logger, LogTags, categorizeError, DatabaseError } from "@/lib/logger"
import { requireAuth } from "@/server/utils/apiHelpers"

interface MoodFrequency {
  mood: string
  count: number
}

interface MonthlyActivity {
  month: string
  photos: number
  videos: number
  journals: number
  total: number
}

interface InsightsData {
  currentMonth: {
    total: number
    photos: number
    videos: number
    journals: number
  }
  longestStreak: number
  currentStreak: number
  moodFrequency: MoodFrequency[]
  monthlyActivity: MonthlyActivity[]
  totalMemories: number
  favoriteTag?: string
  mostProductiveMonth?: string
  averagePostsPerMonth: number
}

export async function GET(request: NextRequest) {
  Logger.d(LogTags.AUTH, 'Memory insights request received')

  try {
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    await connectToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connection established for insights')

    const userId = authResult.userId

    // Get current month date range
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // Get last 12 months date range
    const startOfLast12Months = new Date(now.getFullYear(), now.getMonth() - 11, 1)

    // Current month activity
    const [currentMonthPhotos, currentMonthVideos, currentMonthJournals] = await Promise.all([
      Photo.countDocuments({
        uploader: userId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      }),
      Video.countDocuments({
        uploader: userId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      }),
      Journal.countDocuments({
        author: userId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      })
    ])

    const currentMonthTotal = currentMonthPhotos + currentMonthVideos + currentMonthJournals

    // Total memories
    const [totalPhotos, totalVideos, totalJournals] = await Promise.all([
      Photo.countDocuments({ uploader: userId }),
      Video.countDocuments({ uploader: userId }),
      Journal.countDocuments({ author: userId })
    ])

    const totalMemories = totalPhotos + totalVideos + totalJournals

    // Mood frequency from journals
    const moodAggregation = await Journal.aggregate([
      { 
        $match: { 
          author: userId, 
          mood: { $exists: true, $nin: [null, ""] }
        } 
      },
      { $group: { _id: "$mood", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])

    const moodFrequency: MoodFrequency[] = moodAggregation.map(m => ({
      mood: m._id,
      count: m.count
    }))

    // Calculate streaks
    const allActivity = await Promise.all([
      Photo.find({ uploader: userId }, { createdAt: 1 }).lean(),
      Video.find({ uploader: userId }, { createdAt: 1 }).lean(),
      Journal.find({ author: userId }, { createdAt: 1 }).lean()
    ])

    const allDates = [
      ...allActivity[0].map(a => new Date(a.createdAt)),
      ...allActivity[1].map(a => new Date(a.createdAt)),
      ...allActivity[2].map(a => new Date(a.createdAt))
    ]
      .map(d => d.toISOString().split('T')[0]) // Get date only
      .filter((date, index, self) => self.indexOf(date) === index) // Unique dates
      .sort()
      .reverse()

    // Calculate current streak
    let currentStreak = 0
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    if (allDates.includes(today) || allDates.includes(yesterday)) {
      let checkDate = allDates.includes(today) ? today : yesterday
      for (const date of allDates) {
        if (date === checkDate) {
          currentStreak++
          const dateObj = new Date(checkDate)
          dateObj.setDate(dateObj.getDate() - 1)
          checkDate = dateObj.toISOString().split('T')[0]
        } else if (date < checkDate) {
          break
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0
    let tempStreak = 1

    for (let i = 0; i < allDates.length - 1; i++) {
      const current = new Date(allDates[i])
      const next = new Date(allDates[i + 1])
      const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    // Monthly activity for last 12 months
    const monthlyActivity: MonthlyActivity[] = []
    
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      
      const [photos, videos, journals] = await Promise.all([
        Photo.countDocuments({
          uploader: userId,
          createdAt: { $gte: monthStart, $lte: monthEnd }
        }),
        Video.countDocuments({
          uploader: userId,
          createdAt: { $gte: monthStart, $lte: monthEnd }
        }),
        Journal.countDocuments({
          author: userId,
          createdAt: { $gte: monthStart, $lte: monthEnd }
        })
      ])

      monthlyActivity.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        photos,
        videos,
        journals,
        total: photos + videos + journals
      })
    }

    // Find most productive month
    const mostProductiveMonth = monthlyActivity.reduce((max, month) => 
      month.total > max.total ? month : max
    , monthlyActivity[0])

    // Average posts per month
    const averagePostsPerMonth = Math.round(
      monthlyActivity.reduce((sum, m) => sum + m.total, 0) / monthlyActivity.length
    )

    // Favorite tag across all content
    const [photoTags, videoTags, journalTags] = await Promise.all([
      Photo.aggregate([
        { $match: { uploader: userId, tags: { $exists: true, $ne: [] } } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]),
      Video.aggregate([
        { $match: { uploader: userId, tags: { $exists: true, $ne: [] } } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]),
      Journal.aggregate([
        { $match: { author: userId, tags: { $exists: true, $ne: [] } } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ])
    ])

    const allTags = [...photoTags, ...videoTags, ...journalTags]
    const favoriteTag = allTags.length > 0 
      ? allTags.reduce((max, tag) => tag.count > max.count ? tag : max).id 
      : undefined

    const insights: InsightsData = {
      currentMonth: {
        total: currentMonthTotal,
        photos: currentMonthPhotos,
        videos: currentMonthVideos,
        journals: currentMonthJournals
      },
      longestStreak,
      currentStreak,
      moodFrequency,
      monthlyActivity,
      totalMemories,
      favoriteTag,
      mostProductiveMonth: mostProductiveMonth?.month,
      averagePostsPerMonth
    }

    Logger.i(LogTags.AUTH, 'Memory insights generated successfully')
    
    return NextResponse.json(insights)
  } catch (error) {
    const categorizedError = categorizeError(error)

    if (categorizedError instanceof DatabaseError) {
      Logger.e(LogTags.DB_ERROR, `Database error in insights: ${categorizedError.message}`)
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 })
    }

    Logger.e(LogTags.AUTH, `Unexpected error in insights: ${categorizedError.message}`, { error: categorizedError })
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 })
  }
}
