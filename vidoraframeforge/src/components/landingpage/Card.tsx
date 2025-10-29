import Image from "next/image";
import Link from "next/link";
import { Video } from "@/types/video";

interface VideoCardProps {
  video: Video;
}

export const VideoCard = ({ video }: VideoCardProps) => {
  return (
    <Link
      href={`/watch/${video.id}`}
      className="group cursor-pointer space-y-3"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-800">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      </div>

      {/* Video Info */}
      <div className="space-y-1">
        <h3 className="font-semibold text-white line-clamp-2 group-hover:text-purple-400 transition-colors">
          {video.title}
        </h3>
        <p className="text-sm text-gray-400">{video.creator}</p>
        <p className="text-sm text-gray-500">
          {video.views} views • {video.uploadedAt}
        </p>
      </div>
    </Link>
  );
};