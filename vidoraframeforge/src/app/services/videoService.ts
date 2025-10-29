import axios from "axios";

export interface VideoPayload {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  controls?: boolean;
  transformation?: {
    width?: number;
    height?: number;
    quality?: number;
  };
}

export const uploadVideo = async (payload: VideoPayload) => {
  const res = await axios.post("/api/video", payload);
  return res.data;
};

export const getVideos = async () => {
  const res = await axios.get("/api/video");
  return res.data;
};
