import { connectionToDatabase } from "@/lib/db"
import User from "@/models/User"
import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    await connectionToDatabase()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already registered" }, { status: 201 })
    }
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 12)

    const newUser = await User.create({
      email,
      password: hashedPassword, // Use hashed password
    })

    // Return a success response with the user ID and email
    return NextResponse.json(
      {
        message: "User successfully registered",
        user: { id: newUser._id, email: newUser.email },
      },
      { status: 201 }, 
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
