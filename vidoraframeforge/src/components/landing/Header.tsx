import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  // For now, we'll assume user is not logged in on landing page
  const isLoggedIn = false;
  const logout = () => {};

  return (
    <header className="container mx-auto px-4 pt-6">
      <nav className="flex justify-around items-center">

        <div className="flex items-center">
          <Image src="/images/logo.png" alt="GameHub Logo" width={64} height={64} className="w-16 h-16 rounded-full" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-light-text">VIDORAFRAMEFORGE</h1>
        </div>
        <nav className="flex items-center space-x-6">
          <Link href="/" className="text-gray-700 hover:text-blue-600">
            Home
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/upload" className="text-gray-700 hover:text-blue-600">
                Upload
              </Link>
              <button
                onClick={logout}
                className="text-gray-700 hover:text-blue-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-700 hover:text-blue-600">
                Login
              </Link>
              <Link href="/register" className="text-gray-700 hover:text-blue-600">
                Register
              </Link>
            </>
          )}
        </nav>
        <Link href="/register">
          <button className="bg-primary-blue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300">
            Get Started
          </button>
        </Link>

      </nav>
    </header>
  );
}