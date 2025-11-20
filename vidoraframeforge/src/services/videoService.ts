import axios from "axios"

export interface VideoPayload {
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string
  controls?: boolean
  transformation?: {
    width?: number
    height?: number
    quality?: number
  }
}

export const videoService = {
  async uploadVideo(payload: VideoPayload) {
    const response = await axios.post("/api/auth/videos", payload)
    return response.data
  },

  async getVideos() {
    const response = await axios.get("/api/auth/videos")
    return response.data
  },

  async getVideoById(id: string) {
    const response = await axios.get(`/api/auth/video?id=${id}`)
    return response.data
  },

  async getUserVideos(email: string) {
    const response = await axios.get(`/api/video?uploader=${email}`)
    return response.data
  },
}

export const { uploadVideo, getVideos, getVideoById, getUserVideos } = videoService
export const fetchAllVideos = getVideos
export const fetchVideoById = getVideoById
export const fetchUserVideos = getUserVideos