import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const token = cookies().get('admin_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
    const { payload } = await jwtVerify(token, secret)

    return NextResponse.json({ email: payload.email ?? '' })
  } catch (error) {
    console.error('Failed to fetch admin identity:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
