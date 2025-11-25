"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { RegisterFormData, RegisterFormErrors } from "@/types/auth/auth"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { TermsCheckbox } from "./TermsCheckbox"
import { SocialAuthButtons } from "./SocialAuthButtons"

export default function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<RegisterFormData & { agreeToTerms: boolean }>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  })
  const [errors, setErrors] = useState<RegisterFormErrors & { agreeToTerms?: string }>({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleTermsChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, agreeToTerms: checked }))
    if (errors.agreeToTerms) {
      setErrors(prev => ({ ...prev, agreeToTerms: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: RegisterFormErrors & { agreeToTerms?: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/login?message=Registration successful")
      } else {
        setErrors({ general: data.message || "Registration failed" })
      }
    } catch (error) {
      setErrors({ general: "Network error. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <SocialAuthButtons
        onGoogleSignUp={() => {}}
        onFacebookSignUp={() => {}}
      />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[#0f1419] text-gray-400">OR</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {errors.general && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {errors.general}
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={(e) => handleChange(e)}
          error={errors.name}
          name="name"
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={(e) => handleChange(e)}
          error={errors.email}
          name="email"
        />

        <Input
          label="Password"
          type="password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={(e) => handleChange(e)}
          error={errors.password}
          helperText="Must be at least 6 characters"
          name="password"
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => handleChange(e)}
          error={errors.confirmPassword}
          name="confirmPassword"
        />

        <TermsCheckbox
          checked={formData.agreeToTerms}
          onChange={handleTermsChange}
          error={errors.agreeToTerms}
        />

        <Button type="submit" isLoading={loading} fullWidth>
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </div>
  )
}