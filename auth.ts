import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await db.user.findUnique({
          where: { email: (credentials.email as string).toLowerCase() }
        })

        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password as string, user.password)
        if (!isValid) return null

        return { 
          id: user.id.toString(), 
          email: user.email, 
          name: user.username 
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.name || ''
        token.email = user.email || ''
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.username as string
        session.user.email = token.email as string
      }
      return session
    }
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
})
