import Link from "next/link";
import { Play } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#1a1f3a] to-[#0f1419] flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo />
          
          <div className="space-y-8">
            {/* Large Play Icon */}
            <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
              <Play className="w-16 h-16 text-gray-900 fill-gray-900 ml-2" />
            </div>
            
            <div>
              <h1 className="text-5xl font-bold text-white mb-4">
                Join a universe of creators.
              </h1>
              <p className="text-xl text-gray-300">
                Upload, share, and discover content that moves you.
              </p>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Logo />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Create Your Account
            </h2>
            <p className="text-gray-400">
              Start sharing and discovering amazing videos today.
            </p>
          </div>

          <SignUpForm />

          <p className="text-center text-gray-400 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}