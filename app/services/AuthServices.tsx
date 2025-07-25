import axios from "axios";
import { signIn, signOut } from "next-auth/react";

export const login = async (email: string, password: string) => {
  const res = await signIn("credentials", {
    redirect: false,
    email,
    password,
  });

  if (!res?.ok) {
    throw new Error(res?.error || "Login failed");
  }
};

export const register = async (email: string, password: string) => {
  const res = await axios.post("/api/register", { email, password });
  return res.data;
};

export const logout = async () => {
  await signOut({ redirect: false });
};
