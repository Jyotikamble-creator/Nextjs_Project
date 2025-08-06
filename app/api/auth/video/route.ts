"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import VideoPlayer from "@/components/video/videoplayer"
import { fetchVideoById } from "@/services/videoservices"
import Loader from "@/common/loader" // Assuming this component exists

export default function VideoDetailPage() {
  const { id } = useParams()
  const [video, setVideo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchVideoById(id as string)
        .then((data) => {
          setVideo(data)
        })
        .catch((err) => {
          console.error("Failed to fetch video:", err)
          setError("Failed to load video. Please try again later.")
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [id])

  if (loading) {
    return <Loader fullscreen message="Loading video..." />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Video not found.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <VideoPlayer src={video.videoUrl} title={video.title} poster={video.thumbnailUrl} />
      <div className="mt-8 p-4 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-2">{video.title}</h2>
        <p className="text-gray-600 mb-4">Uploader: {video.uploader?.name || "Unknown"}</p>
        <p className="text-gray-700">{video.description}</p>
        {/* Add more video details like views, likes, etc. */}
      </div>
    </div>
  )
}
