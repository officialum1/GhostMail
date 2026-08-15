import { NextResponse } from 'next/server'
import { getAdminFromToken } from '@/lib/adminSession'
import { getClientIp } from '@/lib/clientIp'
import { logAudit } from '@/lib/audit'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const admin = await getAdminFromToken()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const attempts = await db.failedLoginAttempt.findMany({
      orderBy: { attemptedAt: 'desc' },
      take: 20,
    })

    return NextResponse.json(attempts)
  } catch (error) {
    console.error('Failed to fetch failed logins:', error)
    return NextResponse.json({ error: 'Failed to fetch failed logins' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await getAdminFromToken()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Wiping the attempt log destroys brute-force evidence, so record who did it.
    const result = await db.failedLoginAttempt.deleteMany()
    await logAudit(
      admin.adminId,
      'failed_logins_clear',
      undefined,
      `Cleared ${result.count} failed login attempt record(s)`,
      getClientIp(req)
    )

    return NextResponse.json({ success: true, deleted: result.count })
  } catch (error) {
    console.error('Failed to clear failed logins:', error)
    return NextResponse.json({ error: 'Failed to clear failed logins' }, { status: 500 })
  }
}
