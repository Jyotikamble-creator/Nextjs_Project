import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700 text-center py-4 mt-auto border-t">
      <div className="text-sm">
        <p>© {new Date().getFullYear()} MyApp. All rights reserved.</p>
        <div className="mt-2">
          <a href="/privacy" className="hover:underline mx-2">Privacy</a>
          <a href="/terms" className="hover:underline mx-2">Terms</a>
          <a href="/contact" className="hover:underline mx-2">Contact</a>
        </div>
      </div>
    </footer>
  );
}
