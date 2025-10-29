import React from "react";

interface LoaderProps {
  message?: string;
  fullscreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ message = "Loading...", fullscreen = false }) => {
  const loader = (

    <div className="flex flex-col items-center justify-center gap-2">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm text-gray-600">{message}</p>
    </div>

  );

  if (fullscreen) {
    // Fullscreen loader
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        {loader}
      </div>

    );
  }
  return loader;
};

export default Loader;
