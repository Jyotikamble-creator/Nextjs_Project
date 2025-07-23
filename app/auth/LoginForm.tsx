import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
// import authsService from '@/services/authsService';
import Router from 'next/router';


const [email, setEmail] = useState("");
const [password, setPassword] = useState("")
const [error, setError] = useState("");

export default function Loginform() {


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    }

    try {
    //    await authsService.login({ email, password }
    //     )
        // router.push("/dashboard")

    } catch (err: any) {
        setError(err.response?.data?.message || "login failed");

    }
    return (
        <form onSubmit={handleSubmit}>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mb-4 p-2 border rounded"
            />

            <input
                type="password"
                value={password}
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full mb-4 p-2 border rounded"
            />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Login
            </button>
        </form>

    )
}

