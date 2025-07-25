import { useSession, signIn, signOut } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated";

  return {
    session,
    user: session?.user,
    isAuthenticated,
    loading: status === "loading",
    login: () => signIn(),
    logout: () => signOut(),
  };
}
