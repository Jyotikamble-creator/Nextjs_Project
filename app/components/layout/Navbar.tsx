import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const router = useRouter();
    const [isAuthentication, setIsAuthentication] = useState(false);

    // verification token for authentication
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthentication(true);
        }
    }, []);

    // successfully logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthentication(false);
        router.push('/login');
    }

    return (

        // navbar
        <nav className="w-full bg-blue-600 text-white px-4 py-3 shadow-md flex items-center justify-between">
            {/* Logo and title */}
            <Link href="/" className="text-lg font-semibold">
                🎥 MyApp
            </Link>

            <div className="flex items-center gap-4">
                <button
                    className="text-sm border border-white px-2 py-1 rounded hover:bg-white hover:text-blue-600 transition"
                    onClick={() => alert("Toggle theme (dark/light)")}
                >
                    Toggle Theme
                </button>

                {isAuthentication ? (
                    <button onClick={handleLogout} className="text-sm hover:underline">
                        Logout
                    </button>
                ) : (
                    <Link href="/login" className="text-sm hover:underline">
                        Login
                    </Link>
                )}
            </div>
        </nav>
    )
}