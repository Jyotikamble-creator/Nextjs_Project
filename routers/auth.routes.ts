
import axios from "axios"
import { signIn, signOut } from "next-auth/react"

export const authService = {
  async login(email: string, password: string) {
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    if (result?.error) {
      throw new Error(result.error)
    }

    return result
  },

  async register(email: string, password: string) {
    const response = await axios.post("/api/register", { email, password })
    return response.data
  },

  async logout() {
    await signOut({ redirect: false })
  },
}

export default authService
