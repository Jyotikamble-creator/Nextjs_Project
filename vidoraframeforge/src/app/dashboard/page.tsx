"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import VideoCard from "@/components/video/VideoCard"
import { fetchUserVideos } from "@/server/services/videoService"
import Loader from "@/components/common/Loader"
import { IVideo } from "@/server/models/Video"

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth()
  const [videos, setVideos] = useState<IVideo[]>([])
  const [videosLoading, setVideosLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchUserVideos(user.id)
        .then(setVideos)
        .catch(console.error)
        .finally(() => setVideosLoading(false))
    }
  }, [isAuthenticated, user])

  if (loading) return <Loader fullscreen message="Loading dashboard..." />

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please login to access dashboard</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Videos</h1>
        <p className="text-gray-600">{videos.length} videos</p>
      </div>

      {videosLoading ? (
        <Loader message="Loading your videos..." />
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard
              key={video._id?.toString() || Math.random().toString()}
              video={video}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No videos uploaded yet</p>
          <a href="/upload" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Upload Your First Video
          </a>
        </div>
      )}
    </div>
  )
}