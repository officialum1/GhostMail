import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
    } & DefaultSession["user"]
  }

  interface User {
    username?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
    email: string
  }
}
