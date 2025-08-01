"use client";
import React from "react";

interface VideoCardProps {
  id: string;
  title: string;
  thumbnailUrl: string;
  uploader: string;
  views: number;
  onClick?: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ title, thumbnailUrl, uploader, views, onClick }) => {
  return (

    <div
      className="w-full max-w-sm cursor-pointer border rounded-lg shadow hover:shadow-lg transition"
      onClick={onClick}
    >

      <img
        src={thumbnailUrl}
        alt={title}
        className="w-full h-48 object-cover rounded-t-lg"
      />

      <div className="p-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-gray-500">By {uploader}</p>
        <p className="text-sm text-gray-400">{views} views</p>
      </div>

    </div>

  );
};

export default VideoCard;
