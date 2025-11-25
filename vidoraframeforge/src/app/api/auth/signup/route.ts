import { connectionToDatabase } from "@/server/db"
import User from "@/server/models/User"
import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { Logger, LogTags, categorizeError, ValidationError, DatabaseError } from "@/lib/logger"
import { isValidEmail, isValidPassword, sanitizeString } from "@/lib/validation"

export async function POST(request: NextRequest) {
  Logger.d(LogTags.REGISTER, 'Registration request received');

  try {
    // Parse request body and extract credentials
    const body = await request.json()
    const { email, password, name } = body

    Logger.d(LogTags.REGISTER, 'Request body parsed', { hasEmail: !!email, hasPassword: !!password, hasName: !!name });

    // Validate required credentials
    if (!email || !password) {
      Logger.w(LogTags.REGISTER, 'Registration failed: missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!isValidEmail(email)) {
      Logger.w(LogTags.REGISTER, 'Registration failed: invalid email format', { email: Logger.maskEmail(email) });
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      Logger.w(LogTags.REGISTER, 'Registration failed: password too weak');
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedName = name ? sanitizeString(name) : sanitizedEmail.split('@')[0];

    Logger.d(LogTags.REGISTER, 'Input validation passed', { email: Logger.maskEmail(sanitizedEmail) });

    await connectionToDatabase()
    Logger.d(LogTags.DB_CONNECT, 'Database connection established for registration');

    const existingUser = await User.findOne({ email: sanitizedEmail })
    if (existingUser) {
      Logger.w(LogTags.REGISTER, 'Registration failed: user already exists', { email: Logger.maskEmail(sanitizedEmail) });
      return NextResponse.json({ error: "User already registered" }, { status: 409 })
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 12)
    Logger.d(LogTags.REGISTER, 'Password hashed successfully');

    const newUser = await User.create({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
    })

    Logger.i(LogTags.REGISTER, 'User registered successfully', { userId: newUser._id.toString(), email: Logger.maskEmail(sanitizedEmail) });

    // Return a success response with the user ID and email
    return NextResponse.json(
      {
        message: "User successfully registered",
        user: { id: newUser._id, email: newUser.email },
      },
      { status: 201 },
    )
  } catch (error) {
    const categorizedError = categorizeError(error);

    if (categorizedError instanceof ValidationError) {
      Logger.e(LogTags.REGISTER, `Validation error in registration: ${categorizedError.message}`);
      return NextResponse.json({ error: categorizedError.message }, { status: 400 });
    }

    if (categorizedError instanceof DatabaseError) {
      Logger.e(LogTags.DB_ERROR, `Database error in registration: ${categorizedError.message}`);
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 });
    }

    Logger.e(LogTags.REGISTER, `Unexpected error in registration: ${categorizedError.message}`, categorizedError);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
