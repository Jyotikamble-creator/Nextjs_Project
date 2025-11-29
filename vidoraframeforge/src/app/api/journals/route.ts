import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectionToDatabase } from "@/server/db"
import Journal from "@/server/models/Journal"
import User from "@/server/models/User"
import { authOptions } from "@/server/auth-config/auth"
import { Logger, LogTags, categorizeError, ValidationError, DatabaseError } from "@/lib/logger"
import { isValidVideoTitle, sanitizeString } from "@/lib/validation"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  Logger.d(LogTags.JOURNAL_FETCH, 'Journal fetch request received');

  try {
    await connectionToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connection established for journal fetch');

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const tag = searchParams.get("tag")
    const userId = searchParams.get("userId")
    const limit = searchParams.get("limit")

    Logger.d(LogTags.JOURNAL_FETCH, 'Query parameters parsed', { hasSearch: !!search, tag, userId, limit });

    const query: Record<string, unknown> = {}

    // Only filter by isPublic if not fetching user's own journals
    if (!userId) {
      query.isPublic = true
    }

    if (tag) {
      query.tags = { $in: [sanitizeString(tag)] }
    }

    if (search) {
      const sanitizedSearch = sanitizeString(search)
      query.$or = [
        { title: { $regex: sanitizedSearch, $options: "i" } },
        { content: { $regex: sanitizedSearch, $options: "i" } },
        { tags: { $in: [new RegExp(sanitizedSearch, "i")] } }
      ]
      Logger.d(LogTags.JOURNAL_FETCH, 'Search query applied', { searchTerm: sanitizedSearch });
    }

    if (userId) {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        query.author = new mongoose.Types.ObjectId(userId)
        Logger.d(LogTags.JOURNAL_FETCH, 'User-specific journal fetch', { userId });
      } else {
        Logger.w(LogTags.JOURNAL_FETCH, 'Invalid userId format', { userId });
        return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
      }
    }

    const journals = await Journal.find(query)
      .populate("author", "name avatar")
      .sort({ createdAt: -1 })
      .limit(limit ? parseInt(limit) : 50)

    Logger.i(LogTags.JOURNAL_FETCH, `Journals fetched successfully: ${journals.length} journals returned`);
    return NextResponse.json(journals)
  } catch (error) {
    const categorizedError = categorizeError(error);

    if (categorizedError instanceof DatabaseError) {
      Logger.e(LogTags.DB_ERROR, `Database error in journal fetch: ${categorizedError.message}`);
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 });
    }

    Logger.e(LogTags.JOURNAL_FETCH, `Unexpected error in journal fetch: ${categorizedError.message}`, { error: categorizedError });
    return NextResponse.json({ error: "Failed to fetch journals" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  Logger.d(LogTags.JOURNAL_CREATE, 'Journal creation request received');

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      Logger.w(LogTags.JOURNAL_CREATE, 'Journal creation failed: unauthorized access attempt');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    Logger.d(LogTags.JOURNAL_CREATE, 'User authenticated', { userId: session.user.id });

    await connectionToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connection established for journal creation');

    const body = await request.json()
    const { title, content, tags, attachments, isPublic, mood, location } = body

    Logger.d(LogTags.JOURNAL_CREATE, 'Request body parsed', {
      hasTitle: !!title,
      hasContent: !!content,
      tagsCount: tags?.length || 0,
      attachmentsCount: attachments?.length || 0
    });

    // Validate required fields
    if (!title || !content) {
      Logger.w(LogTags.JOURNAL_CREATE, 'Journal creation failed: missing required fields', {
        hasTitle: !!title,
        hasContent: !!content
      });
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    // Validate title
    if (!isValidVideoTitle(title)) {
      Logger.w(LogTags.JOURNAL_CREATE, 'Journal creation failed: invalid title', { title });
      return NextResponse.json({ error: "Title must be between 1 and 100 characters" }, { status: 400 })
    }

    // Validate content length
    if (content.length > 10000) {
      Logger.w(LogTags.JOURNAL_CREATE, 'Journal creation failed: content too long');
      return NextResponse.json({ error: "Content must be less than 10,000 characters" }, { status: 400 })
    }

    // Sanitize inputs
    const sanitizedTitle = sanitizeString(title);
    const sanitizedContent = sanitizeString(content);
    const sanitizedMood = mood ? sanitizeString(mood) : undefined;
    const sanitizedLocation = location ? sanitizeString(location) : undefined;

    Logger.d(LogTags.JOURNAL_CREATE, 'Input validation passed', { title: sanitizedTitle });

    const journal = await Journal.create({
      title: sanitizedTitle,
      content: sanitizedContent,
      author: session.user.id,
      tags: tags || [],
      attachments: attachments || [],
      isPublic: isPublic !== false,
      mood: sanitizedMood,
      location: sanitizedLocation,
    })

    // Update user stats
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { 'stats.totalJournals': 1 },
      $set: { 'stats.lastActive': new Date() }
    });

    const populatedJournal = await Journal.findById(journal._id).populate("author", "name avatar")

    Logger.i(LogTags.JOURNAL_CREATE, 'Journal created successfully', {
      journalId: journal._id.toString(),
      userId: session.user.id,
      title: sanitizedTitle
    });

    return NextResponse.json(populatedJournal, { status: 201 })
  } catch (error) {
    const categorizedError = categorizeError(error);

    if (categorizedError instanceof ValidationError) {
      Logger.e(LogTags.JOURNAL_CREATE, `Validation error in journal creation: ${categorizedError.message}`, { error: categorizedError });
      return NextResponse.json({ error: categorizedError.message }, { status: 400 });
    }

    if (categorizedError instanceof DatabaseError) {
      Logger.e(LogTags.DB_ERROR, `Database error in journal creation: ${categorizedError.message}`, { error: categorizedError });
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 });
    }

    Logger.e(LogTags.JOURNAL_CREATE, `Unexpected error in journal creation: ${categorizedError.message}`, { error: categorizedError });
    return NextResponse.json({ error: "Failed to create journal" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  Logger.d(LogTags.JOURNAL_UPDATE, 'Journal update request received');

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      Logger.w(LogTags.JOURNAL_UPDATE, 'Journal update failed: unauthorized access attempt');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    Logger.d(LogTags.JOURNAL_UPDATE, 'User authenticated', { userId: session.user.id });

    await connectionToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connection established for journal update');

    const { searchParams } = new URL(request.url)
    const journalId = searchParams.get("id")

    if (!journalId) {
      Logger.w(LogTags.JOURNAL_UPDATE, 'Journal update failed: missing journal ID');
      return NextResponse.json({ error: "Journal ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const { title, content, tags, attachments, isPublic, mood, location } = body

    Logger.d(LogTags.JOURNAL_UPDATE, 'Update request body parsed', {
      journalId,
      hasTitle: !!title,
      hasContent: !!content,
      tagsCount: tags?.length || 0,
      attachmentsCount: attachments?.length || 0
    });

    // Find the journal and check ownership
    const existingJournal = await Journal.findById(journalId)
    if (!existingJournal) {
      Logger.w(LogTags.JOURNAL_UPDATE, 'Journal update failed: journal not found', { journalId });
      return NextResponse.json({ error: "Journal not found" }, { status: 404 })
    }

    if (existingJournal.author.toString() !== session.user.id) {
      Logger.w(LogTags.JOURNAL_UPDATE, 'Journal update failed: unauthorized access', {
        journalId,
        userId: session.user.id,
        authorId: existingJournal.author.toString()
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Validate title if provided
    if (title && !isValidVideoTitle(title)) {
      Logger.w(LogTags.JOURNAL_UPDATE, 'Journal update failed: invalid title', { title });
      return NextResponse.json({ error: "Title must be between 1 and 100 characters" }, { status: 400 })
    }

    // Validate content length if provided
    if (content && content.length > 10000) {
      Logger.w(LogTags.JOURNAL_UPDATE, 'Journal update failed: content too long');
      return NextResponse.json({ error: "Content must be less than 10,000 characters" }, { status: 400 })
    }

    // Sanitize inputs
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = sanitizeString(title);
    if (content !== undefined) updateData.content = sanitizeString(content);
    if (tags !== undefined) updateData.tags = tags;
    if (attachments !== undefined) updateData.attachments = attachments;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (mood !== undefined) updateData.mood = mood ? sanitizeString(mood) : undefined;
    if (location !== undefined) updateData.location = location ? sanitizeString(location) : undefined;

    updateData.updatedAt = new Date();

    Logger.d(LogTags.JOURNAL_UPDATE, 'Update data prepared', { journalId });

    const updatedJournal = await Journal.findByIdAndUpdate(
      journalId,
      updateData,
      { new: true }
    ).populate("author", "name avatar")

    Logger.i(LogTags.JOURNAL_UPDATE, 'Journal updated successfully', {
      journalId,
      userId: session.user.id,
      title: updatedJournal?.title
    });

    return NextResponse.json(updatedJournal)
  } catch (error) {
    const categorizedError = categorizeError(error);

    if (categorizedError instanceof ValidationError) {
      Logger.e(LogTags.JOURNAL_UPDATE, `Validation error in journal update: ${categorizedError.message}`, { error: categorizedError });
      return NextResponse.json({ error: categorizedError.message }, { status: 400 });
    }

    if (categorizedError instanceof DatabaseError) {
      Logger.e(LogTags.DB_ERROR, `Database error in journal update: ${categorizedError.message}`, { error: categorizedError });
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 });
    }

    Logger.e(LogTags.JOURNAL_UPDATE, `Unexpected error in journal update: ${categorizedError.message}`, { error: categorizedError });
    return NextResponse.json({ error: "Failed to update journal" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  Logger.d(LogTags.JOURNAL_DELETE, 'Journal deletion request received');

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      Logger.w(LogTags.JOURNAL_DELETE, 'Journal deletion failed: unauthorized access attempt');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    Logger.d(LogTags.JOURNAL_DELETE, 'User authenticated', { userId: session.user.id });

    await connectionToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connection established for journal deletion');

    const { searchParams } = new URL(request.url)
    const journalId = searchParams.get("id")

    if (!journalId) {
      Logger.w(LogTags.JOURNAL_DELETE, 'Journal deletion failed: missing journal ID');
      return NextResponse.json({ error: "Journal ID is required" }, { status: 400 })
    }

    Logger.d(LogTags.JOURNAL_DELETE, 'Deletion request parsed', { journalId });

    // Find the journal and check ownership
    const existingJournal = await Journal.findById(journalId)
    if (!existingJournal) {
      Logger.w(LogTags.JOURNAL_DELETE, 'Journal deletion failed: journal not found', { journalId });
      return NextResponse.json({ error: "Journal not found" }, { status: 404 })
    }

    if (existingJournal.author.toString() !== session.user.id) {
      Logger.w(LogTags.JOURNAL_DELETE, 'Journal deletion failed: unauthorized access', {
        journalId,
        userId: session.user.id,
        authorId: existingJournal.author.toString()
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await Journal.findByIdAndDelete(journalId)

    // Update user stats
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { 'stats.totalJournals': -1 },
      $set: { 'stats.lastActive': new Date() }
    });

    Logger.i(LogTags.JOURNAL_DELETE, 'Journal deleted successfully', {
      journalId,
      userId: session.user.id,
      title: existingJournal.title
    });

    return NextResponse.json({ message: "Journal deleted successfully" })
  } catch (error) {
    const categorizedError = categorizeError(error);

    if (categorizedError instanceof DatabaseError) {
      Logger.e(LogTags.DB_ERROR, `Database error in journal deletion: ${categorizedError.message}`, { error: categorizedError });
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 });
    }

    Logger.e(LogTags.JOURNAL_DELETE, `Unexpected error in journal deletion: ${categorizedError.message}`, { error: categorizedError });
    return NextResponse.json({ error: "Failed to delete journal" }, { status: 500 })
  }
}