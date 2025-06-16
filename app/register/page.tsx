'use client';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

function RegisterPage  ()  {
    // states
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const router = useRouter();

    // only used in typescript
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(email, password, confirmPassword)

        if (password !== confirmPassword) {
            alert("passwords do not match")
            return
        }

        try {
            const res = await fetch("/api/auth/register",
                {
                    // sending the data
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "registration failed")
            }

            console.log(data)
            router.push("/login")
        } catch (error) {
            console.log(error)
        }

    }



    return (
        <div>
            <h1>register</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <input type="password"
                    placeholder="confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button type="submit">register</button>
                <div>

                    <p>already have an account? <a href="/login">login</a></p>

                </div>


            </form>
        </div>
    )
}

export default RegisterPage;