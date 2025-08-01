import React from "react";

interface VideoPlayerProps {
  src: string;
  title: string;
  captions?: string; // VTT or subtitle file URL
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title, captions }) => {
  return (

    <div className="w-full max-w-4xl mx-auto p-4">

      <h2 className="text-xl font-bold mb-2">{title}</h2>

      <video
        src={src}
        controls
        className="w-full rounded-lg shadow"
        poster=""
      >

        {captions && (
          <track
            label="English"
            kind="subtitles"
            srcLang="en"
            src={captions}
            default
          />
        )}
        <p>Your browser does not support the video tag.</p>
      </video>
    </div>
  );
};

export default VideoPlayer;
