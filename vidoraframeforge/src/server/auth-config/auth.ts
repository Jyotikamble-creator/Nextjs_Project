import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectionToDatabase } from "@/server/db"
import User from "@/server/models/User"
import bcrypt from "bcryptjs"
import { Logger, LogTags, categorizeError, DatabaseError, ValidationError } from "@/lib/logger"
import { isValidEmail } from "@/lib/validation"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          Logger.w(LogTags.LOGIN, 'Login failed: missing email or password');
          throw new Error("Missing credentials")
        }

        Logger.auth.loginAttempt(credentials.email);

        try {
          await connectionToDatabase()

          const user = await User.findOne({ email: credentials.email })
          if (!user) {
            Logger.w(LogTags.LOGIN, 'Login failed: user not found', { email: Logger.maskEmail(credentials.email) });
            throw new Error("User not found")
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          if (!isPasswordValid) {
            Logger.w(LogTags.LOGIN, 'Login failed: invalid password', { email: Logger.maskEmail(credentials.email) });
            throw new Error("Invalid password")
          }

          Logger.auth.loginSuccess(user._id.toString());

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          const categorizedError = categorizeError(error);

          if (categorizedError instanceof DatabaseError) {
            Logger.e(LogTags.DB_ERROR, `Database error during login: ${categorizedError.message}`);
          } else if (categorizedError instanceof ValidationError) {
            Logger.e(LogTags.LOGIN, `Validation error during login: ${categorizedError.message}`);
          } else {
            Logger.e(LogTags.LOGIN, `Unexpected error during login: ${categorizedError.message}`, categorizedError);
          }

          throw error
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || 'user'
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
