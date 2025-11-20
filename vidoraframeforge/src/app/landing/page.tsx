import Header from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { VideoGrid } from "@/components/video/VideoGrid";
import { Video } from "@/types/video/video";

// Sample video data
const sampleVideos: Video[] = [
  {
    _id: "1",
    title: "Epic Mountain Biking Adventure",
    description: "An exciting mountain biking adventure through challenging trails",
    thumbnailUrl: "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&h=450&fit=crop",
    videoUrl: "https://example.com/video1.mp4",
    uploader: {
      _id: "1",
      name: "Adrenaline Junkies",
      email: "adrenaline@example.com",
    },
    views: 1200000,
    likes: 15000,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    tags: ["Adventure", "Sports"],
    category: "Sports",
  },
  {
    _id: "2",
    title: "How to Cook the Perfect Pasta",
    description: "Learn the secrets of making authentic Italian pasta from scratch",
    thumbnailUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=450&fit=crop",
    videoUrl: "https://example.com/video2.mp4",
    uploader: {
      _id: "2",
      name: "Chef Isabella",
      email: "chef@example.com",
    },
    views: 500000,
    likes: 8000,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    tags: ["Cooking", "Italian"],
    category: "Cooking",
  },
  {
    _id: "3",
    title: "Exploring the Ruins of Ancient Rome",
    description: "A historical journey through the ancient ruins of Rome",
    thumbnailUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=450&fit=crop",
    videoUrl: "https://example.com/video3.mp4",
    uploader: {
      _id: "3",
      name: "History Traveller",
      email: "history@example.com",
    },
    views: 800000,
    likes: 12000,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    tags: ["History", "Travel"],
    category: "History",
  },
  {
    _id: "4",
    title: "DIY Home Office Makeover",
    description: "Transform your workspace with this easy DIY home office makeover",
    thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=450&fit=crop",
    videoUrl: "https://example.com/video4.mp4",
    uploader: {
      _id: "4",
      name: "Creative Homes",
      email: "creative@example.com",
    },
    views: 250000,
    likes: 5000,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    tags: ["DIY", "Home"],
    category: "DIY",
  },
  {
    _id: "5",
    title: "Acoustic Cover of a Pop Hit",
    description: "Beautiful acoustic cover of a popular pop song",
    thumbnailUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=450&fit=crop",
    videoUrl: "https://example.com/video5.mp4",
    uploader: {
      _id: "5",
      name: "Music Corner",
      email: "music@example.com",
    },
    views: 1500000,
    likes: 25000,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    tags: ["Music", "Cover"],
    category: "Music",
  },
  {
    _id: "6",
    title: "10 Minute Morning Yoga Flow",
    description: "Start your day with this energizing 10-minute yoga flow",
    thumbnailUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=450&fit=crop",
    videoUrl: "https://example.com/video6.mp4",
    uploader: {
      _id: "6",
      name: "Yoga with Adriene",
      email: "yoga@example.com",
    },
    views: 3000000,
    likes: 45000,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
    updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    tags: ["Yoga", "Fitness"],
    category: "Fitness",
  },
  {
    _id: "7",
    title: "Unboxing the Latest Tech Gadget",
    description: "First look at the newest tech gadget on the market",
    thumbnailUrl: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=450&fit=crop",
    videoUrl: "https://example.com/video7.mp4",
    uploader: {
      _id: "7",
      name: "TechReview",
      email: "tech@example.com",
    },
    views: 950000,
    likes: 18000,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    tags: ["Tech", "Review"],
    category: "Technology",
  },
  {
    _id: "8",
    title: "Coding a Website from Scratch",
    description: "Learn how to build a modern website from the ground up",
    thumbnailUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=450&fit=crop",
    videoUrl: "https://example.com/video8.mp4",
    uploader: {
      _id: "8",
      name: "CodeWizard",
      email: "code@example.com",
    },
    views: 400000,
    likes: 7000,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    tags: ["Coding", "Tutorial"],
    category: "Education",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <VideoGrid videos={sampleVideos} />
      </main>

      <Footer />
    </div>
  );
}
