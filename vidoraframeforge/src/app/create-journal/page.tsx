"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import Loader from "@/ui/Loader"
import { useRouter } from "next/navigation"

export default function CreateJournalPage() {
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()
  const [attachments, setAttachments] = useState<File[]>([])
  const [uploadingAttachments, setUploadingAttachments] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    mood: "",
    location: "",
    isPublic: true
  })

  if (loading) return <Loader fullscreen />

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">Please login to create journals</p>
          <a href="/auth/login" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Login
          </a>
        </div>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/')
      const isValidSize = file.size <= 50 * 1024 * 1024 // 50MB limit
      return isValidType && isValidSize
    })

    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Only images and videos under 50MB are allowed.')
    }

    setAttachments(prev => [...prev, ...validFiles].slice(0, 5)) // Max 5 attachments
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) return

    setSaving(true)
    setUploadingAttachments(true)

    try {
      // Upload attachments to ImageKit
      const uploadedAttachments = []
      for (const file of attachments) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)
        formDataUpload.append('fileName', file.name)
        formDataUpload.append('folder', `/users/${user?.id}/journals`)

        const uploadResponse = await fetch('/api/imagekit-auth', {
          method: 'POST',
          body: formDataUpload
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          uploadedAttachments.push({
            type: file.type.startsWith('image/') ? 'photo' : 'video',
            url: uploadData.url,
            thumbnailUrl: uploadData.thumbnail || uploadData.url,
            fileId: uploadData.fileId,
            fileName: file.name,
            size: file.size
          })
        }
      }

      setUploadingAttachments(false)

      // Create journal with attachments
      const journalData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        mood: formData.mood || undefined,
        location: formData.location || undefined,
        isPublic: formData.isPublic,
        attachments: uploadedAttachments
      }

      const response = await fetch('/api/journals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(journalData)
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        throw new Error('Failed to save journal')
      }
    } catch (error) {
      console.error('Save failed:', error)
      alert('Save failed. Please try again.')
    } finally {
      setSaving(false)
      setUploadingAttachments(false)
    }
  }

  const moodOptions = [
    { value: "", label: "Select mood (optional)" },
    { value: "happy", label: "😊 Happy" },
    { value: "excited", label: "🤩 Excited" },
    { value: "grateful", label: "🙏 Grateful" },
    { value: "peaceful", label: "😌 Peaceful" },
    { value: "thoughtful", label: "🤔 Thoughtful" },
    { value: "sad", label: "😢 Sad" },
    { value: "anxious", label: "😰 Anxious" },
    { value: "angry", label: "😠 Angry" },
    { value: "tired", label: "😴 Tired" },
    { value: "inspired", label: "✨ Inspired" }
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <div className="flex items-center mb-8">
            <svg className="w-8 h-8 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h1 className="text-3xl font-bold text-white">Write Journal Entry</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="What's on your mind today?"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                Journal Entry *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={12}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                placeholder="Write your thoughts, memories, or reflections here..."
                required
              />
            </div>

            {/* Mood */}
            <div>
              <label htmlFor="mood" className="block text-sm font-medium text-gray-300 mb-2">
                How are you feeling?
              </label>
              <select
                id="mood"
                name="mood"
                value={formData.mood}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {moodOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-slate-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Where are you writing from? (optional)"
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="reflection, gratitude, travel, family (comma separated)"
              />
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Attachments (optional)
              </label>
              <div className="space-y-4">
                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    multiple
                    className="hidden"
                    id="attachments-upload"
                  />
                  <label htmlFor="attachments-upload" className="cursor-pointer">
                    <div className="space-y-4">
                      <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <div>
                        <p className="text-lg text-white">Add photos or videos</p>
                        <p className="text-gray-400">Click to browse or drag and drop</p>
                        <p className="text-sm text-gray-500 mt-1">Max 5 files, 50MB each</p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Attachment Previews */}
                {attachments.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {attachments.map((file, index) => (
                      <div key={index} className="relative group">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-24 bg-gray-700 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <p className="text-xs text-gray-400 mt-1 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                )}

                {uploadingAttachments && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center text-green-400">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading attachments...
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Public/Private */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="isPublic" className="ml-2 text-sm font-medium text-gray-300">
                Make this journal entry public
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.title.trim() || !formData.content.trim() || saving || uploadingAttachments}
                className="px-6 py-3 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/25"
              >
                {uploadingAttachments ? 'Uploading...' : saving ? 'Saving...' : 'Save Journal Entry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}