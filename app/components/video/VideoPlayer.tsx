"use client"

import { useRef, useEffect } from "react"

interface VideoPlayerProps {
  src: string
  title: string
  captions?: string
  poster?: string
}

export default function VideoPlayer({ src, title, captions, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.load()
    }
  }, [src])

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <video ref={videoRef} src={src} controls className="w-full h-full" poster={poster} preload="metadata">
          {captions && <track label="English" kind="subtitles" srcLang="en" src={captions} default />}
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  )
}
