import { useAuth } from "@/hooks/useAuth";
import VideoCard from "@/components/video/VideoCard";
import { fetchUserVideos } from "@/services/videoService";

export default async function Dashboard() {
  const { user } = useAuth();

  const videos = await fetchUserVideos(user?.email);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">My Videos</h1>
      <div className="grid grid-cols-2 gap-4">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
}
