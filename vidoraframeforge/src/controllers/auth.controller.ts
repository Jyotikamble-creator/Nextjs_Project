import type { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User"
import { registerSchema, loginSchema } from "../utils/validator"
import { logError, logInfo } from "../utils/logger"
import dotenv from "dotenv"

dotenv.config()

export const register = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = registerSchema.parse(req.body)
    const { name, email, password } = validatedData

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    })

    await newUser.save()
    logInfo(`New user registered: ${email}`)

    res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    })
  } catch (error: any) {
    logError("Registration error:", error)

    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      })
    }

    res.status(500).json({ message: "Server error during registration" })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = loginSchema.parse(req.body)
    const { email, password } = validatedData

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: "7d" })

    logInfo(`User logged in: ${email}`)

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error: any) {
    logError("Login error:", error)

    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      })
    }

    res.status(500).json({ message: "Server error during login" })
  }
}
