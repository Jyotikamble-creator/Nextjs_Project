import { Play } from "lucide-react";
import Link from "next/link";

export const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
        <Play className="w-6 h-6 text-white fill-white" />
      </div>
      <span className="text-2xl font-bold text-white">Streamify</span>
    </Link>
  );
};


