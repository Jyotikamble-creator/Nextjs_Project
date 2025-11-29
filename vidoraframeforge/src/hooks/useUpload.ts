
"use client"

import { useState } from "react"
import axios from "axios"
import { Logger, LogTags, categorizeError } from "@/lib/logger"
import { uploadToImageKit } from "@/utils/imagekitUpload"

interface UploadMetadata {
  title: string
  description: string
}

export function useUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (file: File, metadata: UploadMetadata) => {
    setUploading(true)
    setError(null)
    setProgress(0)

    Logger.video.uploadStart('anonymous', file.name);

    try {
      // Upload to ImageKit
      Logger.d(LogTags.IMAGEKIT_UPLOAD, 'Starting ImageKit upload', { fileName: file.name, fileSize: file.size });

      const uploadResult = await uploadToImageKit(file);

      Logger.i(LogTags.IMAGEKIT_UPLOAD, 'ImageKit upload successful', {
        fileId: uploadResult.fileId,
        url: uploadResult.url
      });

      // Save video metadata to database
      Logger.d(LogTags.VIDEO_UPLOAD, 'Saving video metadata to database', { title: metadata.title });
      await axios.post("/api/auth/videos", {
        title: metadata.title,
        description: metadata.description,
        videoUrl: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl || uploadResult.url,
      })

      setProgress(100)
      Logger.video.uploadSuccess('anonymous', 'pending');
      return uploadResult.url
    } catch (err: unknown) {
      const categorizedError = categorizeError(err);
      Logger.e(LogTags.VIDEO_UPLOAD, `Upload failed: ${categorizedError.message}`, categorizedError);

      let errorMessage = "Upload failed"
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        errorMessage = err.response.data.error
      }
      setError(errorMessage)
      throw err
    } finally {
      setUploading(false)
    }
  }

  const uploadVideo = handleUpload

  return {
    handleUpload,
    uploadVideo,
    uploading,
    progress,
    error,
  }
}
