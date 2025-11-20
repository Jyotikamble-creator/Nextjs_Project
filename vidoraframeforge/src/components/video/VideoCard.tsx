"use client"

import Image from "next/image"
import Link from "next/link"
import { IVideo } from "@/models/Video"

interface VideoCardProps {
  video: IVideo
}

export default function VideoCard({ video }: VideoCardProps) {
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
          <p className="text-sm text-gray-500">By {video.uploader?.name || 'Unknown'}</p>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-400">0 views</p>
            <p className="text-sm text-gray-400">{video.createdAt ? new Date(video.createdAt).toLocaleDateString() : ''}</p>
          </div>
        </div>
      </Link>
    </div>
  )
}