// services/authService.ts
import axios from "@/utils/axios";

const login = async (data: { email: string; password: string }) => {
  const response = await axios.post("/auth/login", data);
  localStorage.setItem("token", response.data.token);
  return response.data;
};

const register = async (data: { name: string; email: string; password: string }) => {
  const response = await axios.post("/auth/register", data);
  return response.data;
};

export default {
  login,
  register
};
