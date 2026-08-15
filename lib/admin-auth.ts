import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { NextResponse } from 'next/server'
import { getJwtSecret } from '@/lib/jwtSecret'

export async function verifyAdminToken(): Promise<boolean> {
  const token = cookies().get('admin_token')?.value
  if (!token) return false

  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    // The 2FA-pending token is signed with the same key but must not grant access.
    return payload.scope === 'admin'
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
