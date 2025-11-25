
"use client"

import { useState } from "react"
import axios from "axios"
import { Logger, LogTags, categorizeError } from "@/lib/logger"

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
      // Get ImageKit auth parameters
      Logger.d(LogTags.IMAGEKIT_AUTH, 'Requesting ImageKit auth parameters');
      const { data: authData } = await axios.get("/api/auth/imagekit-auth")

      // Upload to ImageKit
      const formData = new FormData()
      formData.append("file", file)
      formData.append("fileName", file.name)
      formData.append("publicKey", authData.publicKey)
      formData.append("signature", authData.authenticationParameters.signature)
      formData.append("expire", authData.authenticationParameters.expire)
      formData.append("token", authData.authenticationParameters.token)

      Logger.d(LogTags.IMAGEKIT_UPLOAD, 'Starting ImageKit upload', { fileName: file.name, fileSize: file.size });

      const uploadResponse = await axios.post("https://upload.imagekit.io/api/v1/files/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
          setProgress(percent)
          Logger.d(LogTags.IMAGEKIT_UPLOAD, `Upload progress: ${percent}%`);
        },
      })

      Logger.i(LogTags.IMAGEKIT_UPLOAD, 'ImageKit upload successful', {
        fileId: uploadResponse.data.fileId,
        url: uploadResponse.data.url
      });

      // Save video metadata to database
      Logger.d(LogTags.VIDEO_UPLOAD, 'Saving video metadata to database', { title: metadata.title });
      await axios.post("/api/auth/videos", {
        title: metadata.title,
        description: metadata.description,
        videoUrl: uploadResponse.data.url,
        thumbnailUrl: uploadResponse.data.thumbnailUrl || uploadResponse.data.url,
      })

      setProgress(100)
      Logger.video.uploadSuccess('anonymous', 'pending');
      return uploadResponse.data.url
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
