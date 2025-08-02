/*************  ✨ Windsurf Command ⭐  *************/
/*******  f085ed1a-d5e6-4cd8-a89d-be75434ca403  *******/    /**

     * Toggle the sidebar open or closed

     */
"use client"

import Link from "next/link"
import { useState } from "react"
import { useSession } from "next-auth/react"

export default function Sidebar() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  if (!session) return null

  return (
    <aside
      className={`bg-gray-800 text-white ${isOpen ? "w-64" : "w-16"} min-h-screen p-4 transition-all duration-300`}
    >
      <button onClick={toggleSidebar} className="mb-6 text-sm text-gray-300 hover:text-white">
        {isOpen ? "Collapse ◀" : "▶"}
      </button>

      <nav className="flex flex-col gap-3">
        <Link href="/dashboard" className="hover:bg-gray-700 px-3 py-2 rounded flex items-center gap-2">
          <span>📊</span>
          {isOpen && "Dashboard"}
        </Link>
        <Link href="/videos" className="hover:bg-gray-700 px-3 py-2 rounded flex items-center gap-2">
          <span>🎥</span>
          {isOpen && "Videos"}
        </Link>
        <Link href="/upload" className="hover:bg-gray-700 px-3 py-2 rounded flex items-center gap-2">
          <span>⬆️</span>
          {isOpen && "Upload"}
        </Link>
      </nav>
    </aside>
  )
}
