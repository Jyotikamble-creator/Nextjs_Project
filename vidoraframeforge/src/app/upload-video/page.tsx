
"use client"

import { useAuth } from "@/context/AuthContext"
import FileUpload from "@/components/FileUpload"
import Loader from "@/ui/Loader"

export default function UploadPage() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <Loader fullscreen />

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-md w-full mx-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
            <p className="text-gray-400 mb-6">Please login to upload videos</p>
            <a
              href="/auth/login"
              className="inline-flex items-center px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login to Continue
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-linear-to-r from-purple-900/30 via-pink-900/30 to-purple-900/30 backdrop-blur-sm border-b border-white/10 mb-8">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 via-transparent to-pink-500/5"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl translate-y-1/2"></div>
          
          <div className="relative max-w-4xl mx-auto py-8 px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-purple-600/20 to-pink-600/20 rounded-2xl mb-4 backdrop-blur-sm border border-white/10 shadow-xl">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-linear-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
                Upload Video
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
                Share your stories with the world. Upload your videos and connect with your audience.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="max-w-4xl mx-auto">
          <FileUpload />
        </div>
      </div>
    </div>
  )
}