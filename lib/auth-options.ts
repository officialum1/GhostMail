import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { getJwtSecret } from "@/lib/jwtSecret"
import { checkRateLimit } from "@/lib/rateLimit"

/**
 * A real bcrypt hash of a value nobody can guess. Compared against when the
 * account doesn't exist so the unknown-user path costs the same as the
 * wrong-password path (mitigates username enumeration via response timing).
 */
const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEe.ImVpjJ7iVXTMlNjNRxLxJyGxT5xNQnO'

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

        const userId = Number.parseInt(credentials.userId, 10)
        if (!Number.isSafeInteger(userId) || userId <= 0) return null;

        // Verify admin token securely server-side
        const token = cookies().get('admin_token')?.value;
        if (!token) return null;

        let adminId: number | null = null
        try {
          const { payload } = await jwtVerify(token, getJwtSecret());
          const parsed = Number(payload.adminId)
          if (!Number.isFinite(parsed)) return null;
          adminId = parsed
        } catch {
          return null; // Invalid admin token
        }

        const user = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (!user) return null;

        // Impersonation is a high-privilege action: always leave a trail.
        try {
          await prisma.auditLog.create({
            data: {
              adminId,
              action: 'user_impersonate',
              target: user.username,
              details: `Admin impersonated user ${user.email}`,
            },
          })
        } catch (error) {
          console.error('Failed to audit impersonation:', error)
        }

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
        email: { label: "Email", type: "password" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        const ip =
          (req?.headers?.['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
          (req?.headers?.['x-real-ip'] as string | undefined) ||
          'unknown'

        const loginInput = credentials.email.toLowerCase().trim()

        // Throttle per-IP and per-account so credential stuffing can't run free.
        const ipLimit = checkRateLimit(`login:ip:${ip}`, 10, 15 * 60 * 1000)
        const accountLimit = checkRateLimit(`login:acct:${loginInput}`, 5, 15 * 60 * 1000)
        if (!ipLimit.allowed || !accountLimit.allowed) {
          throw new Error('Too many login attempts. Please try again later.')
        }

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
          // Spend comparable time on unknown accounts so response timing
          // doesn't reveal whether the username exists.
          await bcrypt.compare(credentials.password, DUMMY_HASH)
          await prisma.failedLoginAttempt.create({
            data: { email: loginInput, ip },
          })
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          await prisma.failedLoginAttempt.create({
            data: { email: loginInput, ip },
          })
          return null
        }

        // Only reveal the suspension after the password checks out, otherwise
        // this endpoint becomes a "does this account exist" oracle.
        if (user.isBanned) {
          throw new Error('Your account has been suspended')
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
        token.checkedAt = Date.now()
        return token
      }

      // Re-check ban status periodically. Without this, banning a user leaves
      // their existing JWT working until it expires.
      const checkedAt = Number(token.checkedAt ?? 0)
      if (token.id && Date.now() - checkedAt > 5 * 60 * 1000) {
        const current = await prisma.user.findUnique({
          where: { id: Number(token.id) },
          select: { isBanned: true },
        })
        if (!current || current.isBanned) {
          // Returning a token without an id makes the session callback bail out.
          return {}
        }
        token.checkedAt = Date.now()
      }

      return token
    },
    async session({ session, token }) {
      if (!token.id) {
        // Revoked or banned mid-session: hand back a session with no user so
        // downstream `session?.user?.id` guards reject the request.
        return { ...session, user: undefined } as typeof session
      }
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
    maxAge: 7 * 24 * 60 * 60, // 7 days instead of NextAuth's 30-day default
  },
  secret: process.env.NEXTAUTH_SECRET,
}
