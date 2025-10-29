import React, { useState } from "react";
import { useRouter } from "next/router";
import authService from "@/services/authService";

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    try {
      await authService.register(formData);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleRegister} className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4 text-center">Register</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <input
        type="email"
        name="email"
        placeholder="Email"
        className="w-full mb-4 p-2 border rounded"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        className="w-full mb-4 p-2 border rounded"
        value={formData.password}
        onChange={handleChange}
        required
      />

      <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
        Register
      </button>

    </form>
  );
}
