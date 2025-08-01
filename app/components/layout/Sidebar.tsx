import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Sidebar() {
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        if (storedRole) {
            setRole(storedRole);
        }
    }, []);


    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    }

    return (
        <aside className={`bg-gray-800 text-white ${isOpen ? "w-64" : "w-16"} min-h-screen p-4 transition-all duration-300`}>

            <button onClick={toggleSidebar} className="mb-6 text-sm text-gray-300 hover:text-white">
                {isOpen ? "Collapse ◀" : "▶"}
            </button>

            <nav className="flex flex-col gap-3">

                <Link href="/dashboard" className="hover:bg-gray-700 px-3 py-2 rounded">Dashboard</Link>
                <Link href="/videos" className="hover:bg-gray-700 px-3 py-2 rounded">Videos</Link>
                <Link href="/upload" className="hover:bg-gray-700 px-3 py-2 rounded">Upload</Link>

                {role === "admin" && (
                    <>
                        <Link href="/admin/users" className="hover:bg-gray-700 px-3 py-2 rounded">Manage Users</Link>
                        <Link href="/admin/settings" className="hover:bg-gray-700 px-3 py-2 rounded">Settings</Link>
                    </>
                )}

                {role === "manager" && (
                    <Link href="/manager/reports" className="hover:bg-gray-700 px-3 py-2 rounded">Reports</Link>
                )}
            </nav>
        </aside>

    )

}