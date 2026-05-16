import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { NextResponse } from 'next/server'

export async function verifyAdminToken(): Promise<boolean> {
  const token = cookies().get('admin_token')?.value
  if (!token) return false

  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'secret')
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

export function unauthorizedAdminResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

/** Returns a 401 response if not admin, otherwise null. */
export async function requireAdmin(): Promise<NextResponse | null> {
  const isAdmin = await verifyAdminToken()
  if (!isAdmin) return unauthorizedAdminResponse()
  return null
}
