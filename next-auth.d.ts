// this helps to catch all the authentications calling 
import NextAuth ,{DefaultSession, defaultSession} from "next-auth"

declare module "next-auth" {
  
  interface Session {
    user: {
      /** The user's postal address. */
      id: string
    }& DefaultSession["user"]
  }
}