import { NextResponse } from 'next/server'
import { getAdminFromToken } from '@/lib/adminSession'

export const dynamic = 'force-dynamic'

export async function GET() {
  // getAdminFromToken enforces the `admin` scope, so a 2FA-pending token
  // cannot read the admin identity.
  const admin = await getAdminFromToken()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ email: admin.email })
}
