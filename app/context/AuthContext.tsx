"use client";
import { useSession, signOut } from "next-auth/react";
import { createContext, useContext } from "react";

interface AuthContextType {
  user: any;
  isLoggedIn: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  logout: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  // session will be null if the user is not logged in
  const value = {
    user: session?.user,
    isLoggedIn: !!session,
    logout: () => signOut(),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
