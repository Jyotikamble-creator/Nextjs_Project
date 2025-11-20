export interface Video {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  uploader: {
    _id: string;
    name: string;
    email: string;
  };
  views?: number;
  likes?: number;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  category?: string;
  comments?: Comment[];
}

export interface Comment {
  _id: string;
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
  _id: string;
  title: string;
  thumbnailUrl: string;
  creator: string;
  views: number;
  uploadedAt: Date;
}