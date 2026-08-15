import { NextResponse } from 'next/server'
import { getClientIp } from '@/lib/clientIp'
import { registerUser } from '@/lib/registerUser'

/** Kept as an alias of /api/auth/register so both paths enforce identical rules. */
export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    return await registerUser({ username, password, ip: getClientIp(req) })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
