import { useState } from "react";
import { uploadVideo } from "@/services/videoService";
import { getUploadAuthParams } from "@/services/imagekitService";

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (
    file: File,
    metadata: { title: string; description: string }
  ) => {
    setUploading(true);
    setError(null);

    try {
      const authParams = await getUploadAuthParams();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("publicKey", authParams.publicKey);
      formData.append("signature", authParams.authenticationParameters.signature);
      formData.append("expire", authParams.authenticationParameters.expire);
      formData.append("token", authParams.authenticationParameters.token);

      const imageKitUploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setProgress(percent);
        },
      });

      const resData = await imageKitUploadRes.json();

      // Save video metadata to your DB
      await uploadVideo({
        ...metadata,
        videoUrl: resData.url,
        thumbnailUrl: resData.thumbnailUrl || resData.url,
      });

    } catch (err: any) {
      console.error("Upload failed", err);
      setError("Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return {
    handleUpload,
    uploading,
    progress,
    error,
  };
}
