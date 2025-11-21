import Link from 'next/link';
import { Video, Upload, User } from 'lucide-react';

const navLinkClasses = "text-gray-300 hover:text-white transition-colors duration-200";

export default function Header() {
  const isLoggedIn = false;
  const logout = () => {};

  return (
    <header className="relative z-10 container mx-auto px-4 pt-6">
      <nav className="flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-4">
         <div>
          <image src="img/logo.png">
          </div>
          <h1 className="text-2xl font-bold text-white">VIDORAFRAMEFORGE</h1>
        </div>
        {/* Actions */}
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="w-10 h-10 bg-linear-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          ) : (
            <Link href="/register">
              <button className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">
                <Upload className="w-4 h-4 inline mr-2" />
                upload
              </button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}