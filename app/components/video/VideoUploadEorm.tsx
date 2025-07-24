

import React, { useState } from "react";
import axios from "axios";

const VideoUploadForm = () => {
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!video || !thumbnail || !title) {
      setMessage("Please fill all required fields.");
      return;
    }

    try {
      setMessage("Uploading...");
      const formData = new FormData();
      formData.append("video", video);
      formData.append("thumbnail", thumbnail);
      formData.append("title", title);
      formData.append("description", description);

      const res = await axios.post("/api/upload", formData, {
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / (e.total || 1));
          setProgress(percent);
        },
      });

      setMessage("Upload successful!");
      setProgress(0);
      setVideo(null);
      setThumbnail(null);
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error(err);
      setMessage("Upload failed.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white shadow-md rounded">
      <h2 className="text-xl font-bold mb-4">Upload Video</h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-3 border rounded px-3 py-2"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full mb-3 border rounded px-3 py-2"
      />

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Video File</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideo(e.target.files?.[0] || null)}
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Thumbnail Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
        />
      </div>

      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <button
        onClick={handleUpload}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Upload
      </button>

      {message && <p className="mt-2 text-sm text-center">{message}</p>}
    </div>
  );
};

export default VideoUploadForm;
