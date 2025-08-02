"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Heart, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface VideoCardProps {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  videoUrl: string
  uploader: {
    name: string
    avatar?: string
  }
  views: number
  likes: number
  duration?: number
  category: string
  createdAt: string
}

export default function VideoCard({
  id,
  title,
  description,
  thumbnailUrl,
  uploader,
  views,
  likes,
  duration,
  category,
  createdAt,
}: VideoCardProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/video/${id}`}>
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={thumbnailUrl || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(duration)}
            </div>
          )}
          <Badge className="absolute top-2 left-2" variant="secondary">
            {category}
          </Badge>
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={uploader.avatar || "/placeholder.svg"} alt={uploader.name} />
            <AvatarFallback>{uploader.name[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <Link href={`/video/${id}`}>
              <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">{title}</h3>
            </Link>

            <p className="text-xs text-muted-foreground mt-1">{uploader.name}</p>

            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{views.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>{likes.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
