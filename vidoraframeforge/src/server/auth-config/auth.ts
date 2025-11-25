import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectionToDatabase } from "@/server/db"
import User from "@/server/models/User"
import * as bcrypt from "bcryptjs"
import { Logger, logger, LogTags, categorizeError, DatabaseError, ValidationError } from "@/lib/logger"
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

        const normalizedEmail = credentials.email.toLowerCase().trim();
        logger.auth.loginAttempt(normalizedEmail);

        try {
          await connectionToDatabase()

          const user = await User.findOne({ email: normalizedEmail })
          if (!user) {
            Logger.w(LogTags.LOGIN, 'Login failed: user not found', { email: Logger.maskEmail(normalizedEmail) });
            return null
          }

          Logger.d(LogTags.LOGIN, 'User found, checking password', { userId: user._id.toString(), hasPassword: !!user.password });

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          Logger.d(LogTags.LOGIN, 'Password validation result', { isValid: isPasswordValid });

          if (!isPasswordValid) {
            Logger.w(LogTags.LOGIN, 'Login failed: invalid password', { email: Logger.maskEmail(normalizedEmail) });
            return null
          }

          logger.auth.loginSuccess(user._id.toString());

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          Logger.e(LogTags.LOGIN, 'Login error details', { error: error });
          const categorizedError = categorizeError(error);

          if (categorizedError instanceof DatabaseError) {
            Logger.e(LogTags.DB_ERROR, `Database error during login: ${categorizedError.message}`);
          } else if (categorizedError instanceof ValidationError) {
            Logger.e(LogTags.LOGIN, `Validation error during login: ${categorizedError.message}`);
          } else {
            Logger.e(LogTags.LOGIN, `Unexpected error during login: ${categorizedError.message}`, { error: categorizedError });
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
