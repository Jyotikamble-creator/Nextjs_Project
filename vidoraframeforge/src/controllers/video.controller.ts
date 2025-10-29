import type { Request, Response } from "express"
import imagekit from "../config/imagekit"
import Video from "../models/Video"
import { videoUploadSchema } from "../utils/validator"
import { logError, logInfo } from "../utils/logger"

export const uploadVideo = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = videoUploadSchema.parse(req.body)
    const { title, description, file, fileName } = validatedData
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" })
    }

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file, // base64 or buffer
      fileName,
      folder: "/videos",
      tags: ["video", `user_${userId}`],
    })

    // Create video record
    const newVideo = new Video({
      title,
      description,
      videoUrl: uploadResponse.url,
      thumbnailUrl: uploadResponse.thumbnailUrl || uploadResponse.url,
      uploader: userId,
      fileId: uploadResponse.fileId,
    })

    await newVideo.save()
    logInfo(`Video uploaded by user ${userId}: ${fileName}`)

    res.status(201).json({
      message: "Video uploaded successfully",
      video: newVideo,
    })
  } catch (error: any) {
    logError("Video upload error:", error)

    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      })
    }

    res.status(500).json({ message: "Error uploading video" })
  }
}

export const getVideos = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId
    const { all } = req.query

    let videos
    if (all === "true") {
      // Get all videos for public viewing
      videos = await Video.find({}).populate("uploader", "name email").sort({ createdAt: -1 })
    } else {
      // Get user's videos only
      videos = await Video.find({ uploader: userId }).sort({ createdAt: -1 })
    }

    res.status(200).json(videos)
  } catch (error) {
    logError("Error fetching videos:", error)
    res.status(500).json({ message: "Error fetching videos" })
  }
}

export const getVideoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const video = await Video.findById(id).populate("uploader", "name email")

    if (!video) {
      return res.status(404).json({ message: "Video not found" })
    }

    // Increment view count
    video.views = (video.views || 0) + 1
    await video.save()

    res.status(200).json(video)
  } catch (error) {
    logError("Error fetching video:", error)
    res.status(500).json({ message: "Error fetching video" })
  }
}

export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.userId

    const video = await Video.findById(id)
    if (!video) {
      return res.status(404).json({ message: "Video not found" })
    }

    // Check if user owns the video
    if (video.uploader.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this video" })
    }

    // Delete from ImageKit
    if (video.fileId) {
      await imagekit.deleteFile(video.fileId)
    }

    // Delete from database
    await Video.findByIdAndDelete(id)
    logInfo(`Video deleted by user ${userId}: ${id}`)

    res.status(200).json({ message: "Video deleted successfully" })
  } catch (error) {
    logError("Error deleting video:", error)
    res.status(500).json({ message: "Error deleting video" })
  }
}
