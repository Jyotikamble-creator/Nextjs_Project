import VideoCard from "@/components/video/VideoCard";

export default async function Home() {
  const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/videos`, {
    cache: 'no-store'
  });
  const videos = res.ok ? await res.json() : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {videos.map((video: any) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  );
}
