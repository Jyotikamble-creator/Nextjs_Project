use client";

import { useState } from "react";
import { UploadHeader } from "@/components/upload/UploadHeader";
import { FileUploadZone } from "@/components/upload/FileUploadZone";
import { UploadProgress } from "@/components/upload/UploadProgress";
import { VideoDetailsForm } from "@/components/upload/VideoDetailsForm";
import { ThumbnailSelector } from "@/components/upload/ThumbnailSelector";
import { Button } from "@/components/ui/Button";
import { VideoUpload, ThumbnailOption } from "@/types/upload";

// Sample thumbnail options
const sampleThumbnails: ThumbnailOption[] = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop",
    selected: false,
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=225&fit=crop",
    selected: false,
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=225&fit=crop",
    selected: false,
  },
];

export default function UploadPage() {
  const [videoData, setVideoData] = useState<VideoUpload>({
    file: null,
    title: "",
    description: "",
    category: "gaming",
    tags: [],
    thumbnail: null,
    progress: 0,
    isUploading: false,
  });

  const [thumbnails, setThumbnails] = useState<ThumbnailOption[]>(sampleThumbnails);

  const handleFileSelect = (file: File) => {
    setVideoData((prev) => ({ ...prev, file, isUploading: true }));
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setVideoData((prev) => ({ ...prev, progress }));
      if (progress >= 100) {
        clearInterval(interval);
        setVideoData((prev) => ({ ...prev, isUploading: false }));
      }
    }, 500);
  };

  const handleThumbnailSelect = (id: string) => {
    setVideoData((prev) => ({ ...prev, thumbnail: id }));
  };

  const handleCustomThumbnailUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newThumbnail: ThumbnailOption = {
        id: `custom-${Date.now()}`,
        url: e.target?.result as string,
        selected: true,
      };
      setThumbnails([...thumbnails, newThumbnail]);
      setVideoData((prev) => ({ ...prev, thumbnail: newThumbnail.id }));
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = () => {
    console.log("Publishing video:", videoData);
    // Implement publish logic
    alert("Video published successfully!");
  };

  const canPublish = videoData.file && videoData.title.trim() && videoData.thumbnail;

  return (
    <div className="min-h-screen bg-[#0f1419]">
      <UploadHeader />

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Upload Your Video</h1>
            <p className="text-gray-400">
              Share your creation with the world. Start by selecting a video file from
              your device.
            </p>
          </div>

          {/* File Upload Zone */}
          {!videoData.file && <FileUploadZone onFileSelect={handleFileSelect} />}

          {/* Upload Progress */}
          {videoData.file && videoData.isUploading && (
            <UploadProgress
              fileName={videoData.file.name}
              progress={videoData.progress}
            />
          )}

          {/* Video Details Form */}
          {videoData.file && !videoData.isUploading && (
            <>
              <VideoDetailsForm
                title={videoData.title}
                description={videoData.description}
                category={videoData.category}
                tags={videoData.tags}
                onTitleChange={(title) =>
                  setVideoData((prev) => ({ ...prev, title }))
                }
                onDescriptionChange={(description) =>
                  setVideoData((prev) => ({ ...prev, description }))
                }
                onCategoryChange={(category) =>
                  setVideoData((prev) => ({ ...prev, category }))
                }
                onTagsChange={(tags) => setVideoData((prev) => ({ ...prev, tags }))}
              />

              <ThumbnailSelector
                thumbnails={thumbnails}
                selectedThumbnail={videoData.thumbnail}
                onThumbnailSelect={handleThumbnailSelect}
                onCustomUpload={handleCustomThumbnailUpload}
              />

              {/* Publish Button */}
              <div className="flex justify-end pt-6">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handlePublish}
                  disabled={!canPublish}
                  className="min-w-[200px]"
                >
                  Publish Video
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
