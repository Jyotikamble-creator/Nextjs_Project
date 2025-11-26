import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectionToDatabase } from "@/server/db"
import Photo from "@/server/models/Photo"
import User from "@/server/models/User"
import { authOptions } from "@/server/auth-config/auth"
import { Logger, LogTags, categorizeError, ValidationError, DatabaseError } from "@/lib/logger"
import { isValidVideoTitle, isValidVideoDescription, sanitizeString } from "@/lib/validation"

export async function GET(request: NextRequest) {
  Logger.d(LogTags.VIDEO_FETCH, 'Photo fetch request received');

  try {
    await connectionToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connection established for photo fetch');

    const { searchParams } = new URL(request.url)
    const album = searchParams.get("album")
    const search = searchParams.get("search")
    const userId = searchParams.get("userId")

    Logger.d(LogTags.VIDEO_FETCH, 'Query parameters parsed', { album, hasSearch: !!search, userId });

    const query: Record<string, unknown> = {}

    // Only filter by isPublic if not fetching user's own photos
    if (!userId) {
      query.isPublic = true
    }

    if (album && album !== "all") {
      query.album = sanitizeString(album)
    }

    if (search) {
      const sanitizedSearch = sanitizeString(search)
      query.$or = [
        { title: { $regex: sanitizedSearch, $options: "i" } },
        { description: { $regex: sanitizedSearch, $options: "i" } },
        { tags: { $in: [new RegExp(sanitizedSearch, "i")] } }
      ]
      Logger.d(LogTags.VIDEO_FETCH, 'Search query applied', { searchTerm: sanitizedSearch });
    }

    if (userId) {
      query.uploader = userId
      Logger.d(LogTags.VIDEO_FETCH, 'User-specific photo fetch', { userId });
    }

    const photos = await Photo.find(query).populate("uploader", "name avatar").sort({ createdAt: -1 }).limit(50)

    Logger.i(LogTags.VIDEO_FETCH, `Photos fetched successfully: ${photos.length} photos returned`);
    return NextResponse.json(photos)
  } catch (error) {
    const categorizedError = categorizeError(error);

    if (categorizedError instanceof DatabaseError) {
      Logger.e(LogTags.DB_ERROR, `Database error in photo fetch: ${categorizedError.message}`);
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 });
    }

    Logger.e(LogTags.VIDEO_FETCH, `Unexpected error in photo fetch: ${categorizedError.message}`, categorizedError);
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  Logger.d(LogTags.VIDEO_UPLOAD, 'Photo creation request received');

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      Logger.w(LogTags.VIDEO_UPLOAD, 'Photo creation failed: unauthorized access attempt');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    Logger.d(LogTags.VIDEO_UPLOAD, 'User authenticated', { userId: session.user.id });

    await connectionToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connection established for photo creation');

    const body = await request.json()
    const { title, description, photoUrl, thumbnailUrl, album, tags, isPublic, fileId, fileName, size, width, height, location, takenAt } = body

    Logger.d(LogTags.VIDEO_UPLOAD, 'Request body parsed', {
      hasTitle: !!title,
      hasPhotoUrl: !!photoUrl,
      hasThumbnailUrl: !!thumbnailUrl,
      album,
      tagsCount: tags?.length || 0
    });

    // Validate required fields
    if (!photoUrl || !thumbnailUrl) {
      Logger.w(LogTags.VIDEO_UPLOAD, 'Photo creation failed: missing required fields', {
        hasPhotoUrl: !!photoUrl,
        hasThumbnailUrl: !!thumbnailUrl
      });
      return NextResponse.json({ error: "Photo URL and thumbnail URL are required" }, { status: 400 })
    }

    // Validate title if provided
    if (title && !isValidVideoTitle(title)) {
      Logger.w(LogTags.VIDEO_UPLOAD, 'Photo creation failed: invalid title', { title });
      return NextResponse.json({ error: "Title must be between 1 and 100 characters" }, { status: 400 })
    }

    // Validate description if provided
    if (description && !isValidVideoDescription(description)) {
      Logger.w(LogTags.VIDEO_UPLOAD, 'Photo creation failed: invalid description length');
      return NextResponse.json({ error: "Description must be less than 1000 characters" }, { status: 400 })
    }

    // Sanitize inputs
    const sanitizedTitle = title ? sanitizeString(title) : '';
    const sanitizedDescription = description ? sanitizeString(description) : '';
    const sanitizedAlbum = album ? sanitizeString(album) : undefined;
    const sanitizedLocation = location ? sanitizeString(location) : undefined;

    Logger.d(LogTags.VIDEO_UPLOAD, 'Input validation passed', { title: sanitizedTitle });

    const photo = await Photo.create({
      title: sanitizedTitle,
      description: sanitizedDescription,
      url: photoUrl,
      thumbnailUrl,
      uploader: session.user.id,
      album: sanitizedAlbum,
      tags: tags || [],
      location: sanitizedLocation,
      takenAt: takenAt ? new Date(takenAt) : undefined,
      isPublic: isPublic !== false,
      fileId,
      fileName,
      size,
      width,
      height,
    })

    // Update user stats
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { 'stats.totalPhotos': 1 },
      $set: { 'stats.lastActive': new Date() }
    });

    const populatedPhoto = await Photo.findById(photo._id).populate("uploader", "name avatar")

    Logger.i(LogTags.VIDEO_UPLOAD, 'Photo created successfully', {
      photoId: photo._id.toString(),
      userId: session.user.id,
      title: sanitizedTitle
    });

    return NextResponse.json(populatedPhoto, { status: 201 })
  } catch (error) {
    const categorizedError = categorizeError(error);

    if (categorizedError instanceof ValidationError) {
      Logger.e(LogTags.VIDEO_UPLOAD, `Validation error in photo creation: ${categorizedError.message}`);
      return NextResponse.json({ error: categorizedError.message }, { status: 400 });
    }

    if (categorizedError instanceof DatabaseError) {
      Logger.e(LogTags.DB_ERROR, `Database error in photo creation: ${categorizedError.message}`);
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 });
    }

    Logger.e(LogTags.VIDEO_UPLOAD, `Unexpected error in photo creation: ${categorizedError.message}`, categorizedError);
    return NextResponse.json({ error: "Failed to create photo" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  Logger.d(LogTags.VIDEO_UPLOAD, 'Photo update request received');

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      Logger.w(LogTags.VIDEO_UPLOAD, 'Photo update failed: unauthorized access attempt');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    Logger.d(LogTags.VIDEO_UPLOAD, 'User authenticated', { userId: session.user.id });

    await connectionToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connection established for photo update');

    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get("id")

    if (!photoId) {
      Logger.w(LogTags.VIDEO_UPLOAD, 'Photo update failed: missing photo ID');
      return NextResponse.json({ error: "Photo ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const { title, description, tags, album, location, isPublic } = body

    Logger.d(LogTags.VIDEO_UPLOAD, 'Update request body parsed', {
      photoId,
      hasTitle: !!title,
      hasDescription: !!description,
      tagsCount: tags?.length || 0
    });

    // Find the photo and check ownership
    const existingPhoto = await Photo.findById(photoId)
    if (!existingPhoto) {
      Logger.w(LogTags.VIDEO_UPLOAD, 'Photo update failed: photo not found', { photoId });
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    if (existingPhoto.uploader.toString() !== session.user.id) {
      Logger.w(LogTags.VIDEO_UPLOAD, 'Photo update failed: unauthorized access', {
        photoId,
        userId: session.user.id,
        uploaderId: existingPhoto.uploader.toString()
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Validate title if provided
    if (title && !isValidVideoTitle(title)) {
      Logger.w(LogTags.VIDEO_UPLOAD, 'Photo update failed: invalid title', { title });
      return NextResponse.json({ error: "Title must be between 1 and 100 characters" }, { status: 400 })
    }

    // Sanitize inputs
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = sanitizeString(title);
    if (description !== undefined) updateData.description = sanitizeString(description);
    if (tags !== undefined) updateData.tags = tags;
    if (album !== undefined) updateData.album = album ? sanitizeString(album) : undefined;
    if (location !== undefined) updateData.location = location ? sanitizeString(location) : undefined;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    updateData.updatedAt = new Date();

    Logger.d(LogTags.VIDEO_UPLOAD, 'Update data prepared', { photoId });

    const updatedPhoto = await Photo.findByIdAndUpdate(
      photoId,
      updateData,
      { new: true }
    ).populate("uploader", "name avatar")

    Logger.i(LogTags.VIDEO_UPLOAD, 'Photo updated successfully', {
      photoId,
      userId: session.user.id,
      title: updatedPhoto?.title
    });

    return NextResponse.json(updatedPhoto)
  } catch (error) {
    const categorizedError = categorizeError(error);

    if (categorizedError instanceof ValidationError) {
      Logger.e(LogTags.VIDEO_UPLOAD, `Validation error in photo update: ${categorizedError.message}`);
      return NextResponse.json({ error: categorizedError.message }, { status: 400 });
    }

    if (categorizedError instanceof DatabaseError) {
      Logger.e(LogTags.DB_ERROR, `Database error in photo update: ${categorizedError.message}`);
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 });
    }

    Logger.e(LogTags.VIDEO_UPLOAD, `Unexpected error in photo update: ${categorizedError.message}`, categorizedError);
    return NextResponse.json({ error: "Failed to update photo" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  Logger.d(LogTags.VIDEO_UPLOAD, 'Photo deletion request received');

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      Logger.w(LogTags.VIDEO_UPLOAD, 'Photo deletion failed: unauthorized access attempt');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    Logger.d(LogTags.VIDEO_UPLOAD, 'User authenticated', { userId: session.user.id });

    await connectionToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connection established for photo deletion');

    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get("id")

    if (!photoId) {
      Logger.w(LogTags.VIDEO_UPLOAD, 'Photo deletion failed: missing photo ID');
      return NextResponse.json({ error: "Photo ID is required" }, { status: 400 })
    }

    Logger.d(LogTags.VIDEO_UPLOAD, 'Deletion request parsed', { photoId });

    // Find the photo and check ownership
    const existingPhoto = await Photo.findById(photoId)
    if (!existingPhoto) {
      Logger.w(LogTags.VIDEO_UPLOAD, 'Photo deletion failed: photo not found', { photoId });
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    if (existingPhoto.uploader.toString() !== session.user.id) {
      Logger.w(LogTags.VIDEO_UPLOAD, 'Photo deletion failed: unauthorized access', {
        photoId,
        userId: session.user.id,
        uploaderId: existingPhoto.uploader.toString()
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await Photo.findByIdAndDelete(photoId)

    // Update user stats
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { 'stats.totalPhotos': -1 },
      $set: { 'stats.lastActive': new Date() }
    });

    Logger.i(LogTags.VIDEO_UPLOAD, 'Photo deleted successfully', {
      photoId,
      userId: session.user.id,
      title: existingPhoto.title
    });

    return NextResponse.json({ message: "Photo deleted successfully" })
  } catch (error) {
    const categorizedError = categorizeError(error);

    if (categorizedError instanceof DatabaseError) {
      Logger.e(LogTags.DB_ERROR, `Database error in photo deletion: ${categorizedError.message}`);
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 });
    }

    Logger.e(LogTags.VIDEO_UPLOAD, `Unexpected error in photo deletion: ${categorizedError.message}`, categorizedError);
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 })
  }
}