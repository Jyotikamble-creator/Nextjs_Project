"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { VideoGrid } from "@/components/dashboard/VideoGrid";
import { User, UserVideo } from "@/types/dashboard";

// Sample user data
const currentUser: User = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
};

// Sample videos data
const sampleVideos: UserVideo[] = [
  {
    id: "1",
    title: "My First Vlog",
    thumbnail: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=450&fit=crop",
    views: 1200000,
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    visibility: "Public",
    duration: "10:23",
  },
  {
    id: "2",
    title: "How to Bake a Cake",
    thumbnail: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=450&fit=crop",
    views: 56000,
    uploadedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    visibility: "Public",
    duration: "15:45",
  },
  {
    id: "3",
    title: "Exploring the Mountains",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop",
    views: 200000,
    uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
    visibility: "Public",
    duration: "8:12",
  },
  {
    id: "4",
    title: "A Day in the City",
    thumbnail: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=450&fit=crop",
    views: 2500000,
    uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
    visibility: "Public",
    duration: "12:34",
  },
  {
    id: "5",
    title: "Gaming Highlights Reel",
    thumbnail: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=450&fit=crop",
    views: 10000,
    uploadedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
    visibility: "Unlisted",
    duration: "7:45",
  },
  {
    id: "6",
    title: "Product Unboxing",
    thumbnail: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=800&h=450&fit=crop",
    views: 4100000,
    uploadedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
    visibility: "Public",
    duration: "18:20",
  },
];

export default function DashboardPage() {
  const [videos, setVideos] = useState<UserVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading videos
    const timer = setTimeout(() => {
      setVideos(sampleVideos);
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleUploadClick = () => {
    console.log("Upload video clicked");
    // Implement upload modal or navigation
  };

  const handleVideoMenuClick = (videoId: string) => {
    console.log("Menu clicked for video:", videoId);
    // Implement menu actions (edit, delete, etc.)
  };

  return (
    <div className="min-h-screen bg-[#0f1419]">
      <DashboardHeader user={currentUser} onUploadClick={handleUploadClick} />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Channel Content</h1>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : videos.length === 0 ? (
          <EmptyState onUploadClick={handleUploadClick} />
        ) : (
          <VideoGrid videos={videos} onVideoMenuClick={handleVideoMenuClick} />
        )}
      </main>
    </div>
  );
}