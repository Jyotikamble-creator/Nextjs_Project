"use client"

import { useSession, signOut } from "next-auth/react"
import { createContext, useContext, type ReactNode } from "react"
import { IUser } from "@/models/User"

interface AuthContextType {
  user: IUser | null
  isLoggedIn: boolean
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  logout: () => {},
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()

  const value = {
    user: session?.user,
    isLoggedIn: !!session,
    logout: () => signOut({ callbackUrl: "/login" }),
    loading: status === "loading",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
