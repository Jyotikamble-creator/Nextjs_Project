"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import Loader from "@/components/common/Loader"
import VideoCard from "@/components/video/VideoCard"
import { Video } from "@/types/video/video"

export default function VideosPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [videosLoading, setVideosLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    if (isAuthenticated) {
      fetchVideos()
    }
  }, [isAuthenticated, searchTerm, selectedCategory])

  const fetchVideos = async () => {
    try {
      setVideosLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (selectedCategory !== "all") params.append("category", selectedCategory)
      if (user?.id) params.append("userId", user.id)

      const response = await fetch(`/api/auth/videos?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setVideos(data)
      } else {
        console.error("Failed to fetch videos")
        setVideos([])
      }
    } catch (error) {
      console.error("Error fetching videos:", error)
      setVideos([])
    } finally {
      setVideosLoading(false)
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return

    try {
      const response = await fetch(`/api/auth/videos/${videoId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setVideos(videos.filter(video => video._id !== videoId))
      } else {
        console.error("Failed to delete video")
      }
    } catch (error) {
      console.error("Error deleting video:", error)
    }
  }

  if (loading) return <Loader fullscreen />

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">Please login to view your videos</p>
          <a href="/auth/login" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 mb-8">
          <div className="max-w-4xl mx-auto py-8">
            <div className="flex items-center mb-6">
              <svg className="w-8 h-8 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h1 className="text-3xl font-bold text-white">My Videos</h1>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all" className="bg-slate-800">All Categories</option>
                <option value="Travel" className="bg-slate-800">Travel</option>
                <option value="Nature" className="bg-slate-800">Nature</option>
                <option value="Lifestyle" className="bg-slate-800">Lifestyle</option>
                <option value="Technology" className="bg-slate-800">Technology</option>
                <option value="Education" className="bg-slate-800">Education</option>
                <option value="Entertainment" className="bg-slate-800">Entertainment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <div className="space-y-8">
          {videosLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader message="Loading your videos..." />
            </div>
          ) : videos.length > 0 ? (
            <>
              <div className="text-center">
                <p className="text-gray-400">
                  {videos.length} video{videos.length !== 1 ? 's' : ''} found
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <VideoCard
                    key={video._id}
                    video={video}
                    onDelete={handleDeleteVideo}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/10 max-w-md">
                <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">No videos found</h3>
                <p className="text-gray-400 mb-8">
                  {searchTerm || selectedCategory !== "all"
                    ? "Try adjusting your search or filters."
                    : "Start creating memories by uploading your first video."
                  }
                </p>
                {!searchTerm && selectedCategory === "all" && (
                  <a
                    href="/upload"
                    className="inline-flex items-center px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Upload Video
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
