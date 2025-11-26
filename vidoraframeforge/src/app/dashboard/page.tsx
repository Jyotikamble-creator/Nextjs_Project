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
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Videos</h1>
              <p className="text-gray-300">Manage and track your video content</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{videos.length}</p>
              <p className="text-gray-400 text-sm">Total Videos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {videosLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader message="Loading your videos..." />
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard
                key={video._id?.toString() || Math.random().toString()}
                video={video}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/10 max-w-md">
              <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No videos yet</h3>
              <p className="text-gray-400 mb-8">Start sharing your stories with the world. Upload your first video to get started.</p>
              <a
                href="/upload"
                className="inline-flex items-center px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Upload Your First Video
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}