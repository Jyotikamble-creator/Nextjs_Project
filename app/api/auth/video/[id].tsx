import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { fetchVideoById } from "@/services/videoService";
import VideoPlayer from "@/components/video/VideoPlayer";

export default function VideoDetailPage() {
  const { query } = useRouter();
  const [video, setVideo] = useState(null);

  useEffect(() => {
    if (query.id) {
      fetchVideoById(query.id as string).then(setVideo);
    }
  }, [query.id]);

  if (!video) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <VideoPlayer src={video.videoUrl} />
      <h2 className="text-xl mt-4">{video.title}</h2>
      <p>{video.description}</p>
    </div>
  );
}
