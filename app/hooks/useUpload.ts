
"use client"

import { useState } from "react"
import axios from "axios"

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

    try {
      // Get ImageKit auth parameters
      const { data: authData } = await axios.get("/api/imagekit-auth")

      // Upload to ImageKit
      const formData = new FormData()
      formData.append("file", file)
      formData.append("fileName", file.name)
      formData.append("publicKey", authData.publicKey)
      formData.append("signature", authData.authenticationParameters.signature)
      formData.append("expire", authData.authenticationParameters.expire)
      formData.append("token", authData.authenticationParameters.token)

      const uploadResponse = await axios.post("https://upload.imagekit.io/api/v1/files/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
          setProgress(percent)
        },
      })

      // Save video metadata to database
      await axios.post("/api/video", {
        title: metadata.title,
        description: metadata.description,
        videoUrl: uploadResponse.data.url,
        thumbnailUrl: uploadResponse.data.thumbnailUrl || uploadResponse.data.url,
      })

      setProgress(100)
      return uploadResponse.data.url
    } catch (err: any) {
      console.error("Upload failed:", err)
      setError(err.response?.data?.error || "Upload failed")
      throw err
    } finally {
      setUploading(false)
    }
  }

  return {
    handleUpload,
    uploading,
    progress,
    error,
  }
}
