import VideoCard from "@/components/video/VideoCard";
import { fetchAllVideos } from "@/services/videoService";

export default async function Home() {
  const videos = await fetchAllVideos();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {videos.map(video => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  );
}
