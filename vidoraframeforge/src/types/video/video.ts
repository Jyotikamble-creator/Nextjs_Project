export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl?: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
    subscribers: number;
  };
  views: number;
  likes: number;
  uploadedAt: Date;
  tags?: string[];
  category?: string;
}

export interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  likes: number;
  postedAt: Date;
  replies?: Comment[];
}

export interface RelatedVideo {
  id: string;
  title: string;
  thumbnail: string;
  creator: string;
  views: number;
  uploadedAt: Date;
}