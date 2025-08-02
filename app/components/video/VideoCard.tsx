"use client"

import Image from "next/image"
import Link from "next/link"
import { formatDate } from "@/utils/formatdate"

interface VideoCardProps {
  id: string
  title: string
  thumbnailUrl: string
  uploader: string
  views: number
  createdAt: string
  onClick?: () => void
}

export default function VideoCard({ id, title, thumbnailUrl, uploader, views, createdAt, onClick }: VideoCardProps) {
  return (
    <div className="w-full max-w-sm cursor-pointer border rounded-lg shadow hover:shadow-lg transition">
      <Link href={`/video/${id}`}>
        <div className="relative w-full h-48">
          <Image
            src={thumbnailUrl || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover rounded-t-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
          <p className="text-sm text-gray-500">By {uploader}</p>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-400">{views} views</p>
            <p className="text-sm text-gray-400">{formatDate(createdAt)}</p>
          </div>
        </div>
      </Link>
    </div>
  )
}
