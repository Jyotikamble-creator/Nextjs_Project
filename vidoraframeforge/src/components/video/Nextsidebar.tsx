import Image from "next/image";
import Link from "next/link";
import { RelatedVideo } from "@/types/video/video";
import { formatViews, formatTimeAgo } from "@/lib/utils";

interface UpNextSidebarProps {
  videos: RelatedVideo[];
}

export const UpNextSidebar = ({ videos }: UpNextSidebarProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Up Next</h2>

      <div className="space-y-3">
        {videos.map((video) => (
          <Link
            key={video.id}
            href={`/watch/${video.id}`}
            className="flex gap-3 group hover:bg-white/5 rounded-lg p-2 transition-colors"
          >
            <div className="relative w-40 aspect-video rounded-lg overflow-hidden shrink-0 bg-gray-800">
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </div>

            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-purple-400 transition-colors">
                {video.title}
              </h3>
              <p className="text-xs text-gray-400">{video.creator}</p>
              <p className="text-xs text-gray-500">
                {formatViews(video.views)} views • {formatTimeAgo(video.uploadedAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};