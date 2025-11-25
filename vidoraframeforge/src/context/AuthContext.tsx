"use client"

import { useSession, signOut } from "next-auth/react"
import { createContext, useContext, type ReactNode } from "react"

interface AuthContextType {
  user: any | null // NextAuth user type
  isLoggedIn: boolean
  isAuthenticated: boolean
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  isAuthenticated: false,
  logout: () => {},
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()

  const value = {
    user: session?.user,
    isLoggedIn: !!session,
    isAuthenticated: !!session,
    logout: () => signOut({ callbackUrl: "/auth/login" }),
    loading: status === "loading",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
