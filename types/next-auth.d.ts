import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user?: {
      id: string
      name: string
      email: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    username?: string
    email?: string
    /** Epoch ms of the last ban-status re-check. */
    checkedAt?: number
  }
}
