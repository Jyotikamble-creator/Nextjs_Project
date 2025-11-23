"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TermsCheckbox } from "./TermsCheckbox";
import { SocialAuthButtons } from "./SocialAuthButtons";
import { SignUpFormData, FormErrors } from "@/types/auth";
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateTerms,
} from "@/server/validations";

export const SignUpForm = () => {
  const [formData, setFormData] = useState<SignUpFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      username: validateUsername(formData.username),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(
        formData.password,
        formData.confirmPassword
      ),
      agreeToTerms: validateTerms(formData.agreeToTerms),
    };

    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, v]) => v !== undefined)
    ) as FormErrors;

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Sign up data:", formData);
      // Add your API call here
      // const response = await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   body: JSON.stringify(formData)
      // });
    } catch (error) {
      console.error("Sign up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof SignUpFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSocialSignUp = (provider: string) => {
    console.log(`Sign up with ${provider}`);
    // Implement social auth logic
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Username"
        type="text"
        placeholder="Enter your desired username"
        value={formData.username}
        onChange={(e) => handleChange("username", e.target.value)}
        error={errors.username}
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={formData.email}
        onChange={(e) => handleChange("email", e.target.value)}
        error={errors.email}
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Create a strong password"
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
          helperText="Must be at least 8 characters."
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-300"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <div className="relative">
        <Input
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          error={errors.confirmPassword}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-300"
        >
          {showConfirmPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      <TermsCheckbox
        checked={formData.agreeToTerms}
        onChange={(checked) => handleChange("agreeToTerms", checked)}
        error={errors.agreeToTerms}
      />

      <Button type="submit" isLoading={isLoading}>
        Create Account
      </Button>

      <SocialAuthButtons
        onGoogleSignUp={() => handleSocialSignUp("Google")}
        onFacebookSignUp={() => handleSocialSignUp("Facebook")}
      />
    </form>
  );
};