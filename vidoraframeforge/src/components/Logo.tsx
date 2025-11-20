"use client"

import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">V</span>
      </div>
      <span className="text-white font-bold text-xl">VidoraFrame</span>
    </Link>
  )
}