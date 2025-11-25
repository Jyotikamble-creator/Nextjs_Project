import Header from "@/components/home/Header";
import VideoPlayer from "@/components/video/VideoPlayer";
import { VideoInfo } from "@/components/video/VideoInfo";
import { VideoDescription } from "@/components/video/VideoDescription";
import { CommentSection } from "@/components/video/CommentSection";
import { UpNextSidebar } from "@/components/video/UpNextSidebar";
import { Video, Comment, RelatedVideo } from "@/types/video/video";

export const dynamic = 'force-dynamic';

// Sample data
const video: Video = {
  _id: "1",
  title: "Exploring the Alps: A Cinematic Journey",
  description: "Join us on an epic journey through the breathtaking landscapes of the Swiss Alps. From serene lakes to majestic peaks, this cinematic short film captures the raw beauty of nature.\n\nFilmed with the latest 8K drone technology. #Alps #Travel #Cinematic",
  thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=675&fit=crop",
  videoUrl: "https://example.com/video.mp4",
  uploader: {
    _id: "1",
    name: "Adventure Vistas",
    email: "adventure@example.com",
  },
  views: 1200000,
  likes: 150000,
  createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
  updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  tags: ["Alps", "Travel", "Cinematic"],
  category: "Travel",
};

const comments: Comment[] = [
  {
    _id: "1",
    author: {
      name: "Alex Morgan",
      avatar: "",
    },
    content: "Absolutely stunning cinematography! Makes me want to book a flight right now. Well done!",
    likes: 1200,
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "2",
    author: {
      name: "Casey Lee",
      avatar: "",
    },
    content: "What drone did you use for these shots? The quality is insane.",
    likes: 312,
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
];

const relatedVideos: RelatedVideo[] = [
  {
    _id: "2",
    title: "Whispers of the Redwood Forest",
    thumbnailUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=225&fit=crop",
    creator: "Nature Escapes",
    views: 820000,
    uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "3",
    title: "Sahara Dreams: A Desert Time-lapse",
    thumbnailUrl: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&h=225&fit=crop",
    creator: "Wanderlust Films",
    views: 350000,
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "4",
    title: "Chasing the Northern Lights in Norway",
    thumbnailUrl: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=400&h=225&fit=crop",
    creator: "Auroral Wonders",
    views: 1500000,
    uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "5",
    title: "Life Under the Waves: Coral Reefs",
    thumbnailUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=225&fit=crop",
    creator: "Ocean Explorers",
    views: 670000,
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

export default function VideoDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-[#0f1419]">
      <Header />

      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            <VideoPlayer poster={video.thumbnailUrl} title={video.title} />
            <VideoInfo video={video} />
            <VideoDescription video={video} />
            <CommentSection comments={comments} commentCount={2458} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <UpNextSidebar videos={relatedVideos} />
          </div>
        </div>
      </main>
    </div>
  );
}
