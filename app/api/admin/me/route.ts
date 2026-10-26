import { NextResponse } from 'next/server'
import { getAdminFromToken } from '@/lib/adminSession'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  // getAdminFromToken enforces the `admin` scope, so a 2FA-pending token
  // cannot read the admin identity.
  const admin = await getAdminFromToken()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const record = await db.admin.findUnique({
    where: { id: admin.adminId },
    select: { twoFactorEnabled: true },
  })

  return NextResponse.json({
    email: admin.email,
    twoFactorEnabled: record?.twoFactorEnabled ?? false,
  })
}
