import { Video } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
        <Video className="w-4 h-4 text-white" />
      </div>
      <h3 className="text-xl font-bold text-white">VidoraFrameForge</h3>
    </div>
  );
}