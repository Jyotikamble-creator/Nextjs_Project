import VideoUploadForm from "@/components/video/VideoUploadForm";
import { useAuth } from "@/hooks/useAuth";

export default function UploadPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <p>Please login to upload videos.</p>;

  return (
    <div className="p-4">
      <VideoUploadForm />
    </div>
  );
}
