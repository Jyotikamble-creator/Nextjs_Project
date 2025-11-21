"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { LoginFormData, LoginFormErrors } from "@/types/auth/auth";
import {
  validateEmailOrUsername,
  validateLoginPassword,
} from "@/lib/validations";

export const LoginForm = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    emailOrUsername: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {
      emailOrUsername: validateEmailOrUsername(formData.emailOrUsername),
      password: validateLoginPassword(formData.password),
    };

    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, v]) => v !== undefined)
    ) as LoginFormErrors;

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Login data:", formData);
      // Add your API call here
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   body: JSON.stringify(formData)
      // });
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        general: "Invalid credentials. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof LoginFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // Implement social auth logic
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {errors.general}
        </div>
      )}

      <Input
        label="Email or Username"
        type="text"
        placeholder="Enter your email or username"
        value={formData.emailOrUsername}
        onChange={(e) => handleChange("emailOrUsername", e.target.value)}
        error={errors.emailOrUsername}
        autoComplete="username"
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-300">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Forgot Password?
          </Link>
        </div>
        <Input
          label=""
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
          autoComplete="current-password"
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          }
        />
      </div>

      <Button type="submit" isLoading={isLoading} variant="primary">
        Log In
      </Button>

      <SocialLoginButtons
        onGoogleLogin={() => handleSocialLogin("Google")}
        onAppleLogin={() => handleSocialLogin("Apple")}
      />
    </form>
  );
};
