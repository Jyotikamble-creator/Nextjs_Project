"use client"

import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/context/UseTheme"
import { PWAInstaller } from "./PWAInstaller"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // TODO: Auth providers temporarily disabled for development
  // Uncomment SessionProvider and AuthProvider to re-enable authentication
  return (
    /* <SessionProvider> */
      /* <AuthProvider> */
        <ThemeProvider>
          <PWAInstaller />
          {children}
        </ThemeProvider>
      {/* </AuthProvider> */}
    {/* </SessionProvider> */}
  )
}