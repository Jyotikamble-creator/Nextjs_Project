"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useUpload } from "@/hooks/useUpload"

export default function FileUpload() {
  const { isAuthenticated } = useAuth()
  const { uploadVideo, uploading, progress } = useUpload()
  const [file, setFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    isPublic: true
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !metadata.title) return

    try {
      await uploadVideo(file, {
        ...metadata,
        tags: metadata.tags.split(",").map(tag => tag.trim())
      })
      // Reset form
      setFile(null)
      setMetadata({
        title: "",
        description: "",
        category: "",
        tags: "",
        isPublic: true
      })
    } catch (error) {
      console.error("Upload failed:", error)
    }
  }

  if (!isAuthenticated) {
    return <div>Please login to upload videos</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Video File</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={metadata.title}
            onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={metadata.description}
            onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <input
            type="text"
            value={metadata.category}
            onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
          <input
            type="text"
            value={metadata.tags}
            onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="gaming, tutorial, music"
          />
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={metadata.isPublic}
              onChange={(e) => setMetadata(prev => ({ ...prev, isPublic: e.target.checked }))}
              className="mr-2"
            />
            Make video public
          </label>
        </div>

        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={!file || !metadata.title || uploading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {uploading ? "Uploading..." : "Upload Video"}
        </button>
      </form>
    </div>
  )
}