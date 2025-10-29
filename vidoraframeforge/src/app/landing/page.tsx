import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { VideoGrid } from "@/components/video/VideoGrid";
import { Video } from "@/types/video";

// Sample video data
const sampleVideos: Video[] = [
  {
    id: "1",
    title: "Epic Mountain Biking Adventure",
    thumbnail: "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&h=450&fit=crop",
    creator: "Adrenaline Junkies",
    views: "1.2M",
    uploadedAt: "2 weeks ago",
  },
  {
    id: "2",
    title: "How to Cook the Perfect Pasta",
    thumbnail: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=450&fit=crop",
    creator: "Chef Isabella",
    views: "500K",
    uploadedAt: "1 month ago",
  },
  {
    id: "3",
    title: "Exploring the Ruins of Ancient Rome",
    thumbnail: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=450&fit=crop",
    creator: "History Traveller",
    views: "800K",
    uploadedAt: "3 days ago",
  },
  {
    id: "4",
    title: "DIY Home Office Makeover",
    thumbnail: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=450&fit=crop",
    creator: "Creative Homes",
    views: "250K",
    uploadedAt: "1 week ago",
  },
  {
    id: "5",
    title: "Acoustic Cover of a Pop Hit",
    thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=450&fit=crop",
    creator: "Music Corner",
    views: "1.5M",
    uploadedAt: "5 days ago",
  },
  {
    id: "6",
    title: "10 Minute Morning Yoga Flow",
    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=450&fit=crop",
    creator: "Yoga with Adriene",
    views: "3M",
    uploadedAt: "2 months ago",
  },
  {
    id: "7",
    title: "Unboxing the Latest Tech Gadget",
    thumbnail: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=450&fit=crop",
    creator: "TechReview",
    views: "950K",
    uploadedAt: "1 day ago",
  },
  {
    id: "8",
    title: "Coding a Website from Scratch",
    thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=450&fit=crop",
    creator: "CodeWizard",
    views: "400K",
    uploadedAt: "6 days ago",
  },
  {
    id: "9",
    title: "Animated Short Film: The Lost Star",
    thumbnail: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=450&fit=crop",
    creator: "Pixel Studios",
    views: "2.1M",
    uploadedAt: "1 month ago",
  },
  {
    id: "10",
    title: "Wildlife Documentary: The Arctic Fox",
    thumbnail: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800&h=450&fit=crop",
    creator: "Nature Explorer",
    views: "780K",
    uploadedAt: "4 weeks ago",
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
