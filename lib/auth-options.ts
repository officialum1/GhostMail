import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "impersonation",
      name: "impersonation",
      credentials: {
        userId: { label: "User ID", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.userId) return null;
        
        // Verify admin token securely server-side
        const token = cookies().get('admin_token')?.value;
        if (!token) return null;
        
        try {
          const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'secret');
          await jwtVerify(token, secret);
        } catch {
          return null; // Invalid admin token
        }
        
        const user = await prisma.user.findUnique({
          where: { id: parseInt(credentials.userId) }
        });
        
        if (!user) return null;
        
        return {
          id: String(user.id),
          name: user.username,
          email: user.email,
        };
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const loginInput = credentials.email.toLowerCase()
        let user = await prisma.user.findUnique({
          where: { email: loginInput },
        })

        if (!user) {
          const username = loginInput.replace(/@.*/, '').toLowerCase()
          user = await prisma.user.findUnique({
            where: { username },
          })
        }

        if (!user) {
          await prisma.failedLoginAttempt.create({
            data: {
              email: loginInput,
            },
          })
          return null
        }
        if (user.isBanned) {
          throw new Error('Your account has been suspended')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          await prisma.failedLoginAttempt.create({
            data: {
              email: loginInput,
            },
          })
          return null
        }

        return {
          id: String(user.id),
          name: user.username,
          email: user.email,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.name ?? ""
        token.email = user.email ?? ""
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.username as string
        session.user.email = token.email as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
