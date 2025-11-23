"use client"

import Image from "next/image"
import Link from "next/link"
import { Video } from "@/types/video/video"
import { IVideo } from "@/server/models/Video"

interface VideoCardProps {
  video: Video | IVideo
}

export default function VideoCard({ video }: VideoCardProps) {
  // Helper function to get uploader name from different possible structures
  const getUploaderName = () => {
    if ('uploader' in video && video.uploader) {
      if (typeof video.uploader === 'object' && 'name' in video.uploader) {
        return video.uploader.name
      }
      if (typeof video.uploader === 'string') {
        return 'Unknown'
      }
    }
    return 'Unknown'
  }

  const getViews = () => {
    if ('views' in video && typeof video.views === 'number') {
      return video.views.toLocaleString()
    }
    return '0'
  }

  const getCreatedAt = () => {
    if ('createdAt' in video && video.createdAt) {
      return new Date(video.createdAt).toLocaleDateString()
    }
    return ''
  }

  return (
    <div className="w-full max-w-sm cursor-pointer border rounded-lg shadow hover:shadow-lg transition">
      <Link href={`/video/${video._id}`}>
        <div className="relative w-full h-48">
          <Image
            src={video.thumbnailUrl || "/placeholder.svg"}
            alt={video.title}
            fill
            className="object-cover rounded-t-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2">{video.title}</h3>
          <p className="text-sm text-gray-500">By {getUploaderName()}</p>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-400">{getViews()} views</p>
            <p className="text-sm text-gray-400">{getCreatedAt()}</p>
          </div>
        </div>
      </Link>
    </div>
  )
}