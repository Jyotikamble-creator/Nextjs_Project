import { useState } from "react";
import axios from "axios";
import ImageKit from "imagekit-javascript";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL!,
});

export const useUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  const uploadVideo = async (
    file: File,
    title: string,
    description: string,
    thumbnailUrl: string
  ) => {
    try {
      setUploading(true);
      setProgress(0);

      // Get auth params
      const { data } = await axios.get("/api/imagekit-auth");
      const authParams = data.authenticationParameters;

      // Upload to ImageKit
      const res = await imagekit.upload({
        file,
        fileName: file.name,
        ...authParams,
        tags: ["video"],
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
      });

      // Save video metadata to backend
      await axios.post("/api/video", {
        title,
        description,
        videoUrl: res.url,
        thumbnailUrl,
      });

      return res.url;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return { uploadVideo, uploading, progress };
};
