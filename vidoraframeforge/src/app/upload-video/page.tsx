
"use client"

import { useAuth } from "@/context/AuthContext"
import FileUpload from "@/components/FileUpload"
import Loader from "@/ui/Loader"

export default function UploadPage() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <Loader fullscreen />

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">Please login to upload videos</p>
          <a href="/auth/login" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <FileUpload />
      </div>
    </div>
  )
}