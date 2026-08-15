import { NextResponse } from 'next/server'
import { getAdminFromToken } from '@/lib/adminSession'
import { getClientIp } from '@/lib/clientIp'
import { logAudit } from '@/lib/audit'
import { db } from '@/lib/db'

/** Matches the page size of the admin email table; a larger batch is a mistake. */
const MAX_IDS = 200

export async function POST(req: Request) {
  try {
    const admin = await getAdminFromToken()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { ids } = await req.json()
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid email ids' }, { status: 400 })
    }

    if (ids.length > MAX_IDS) {
      return NextResponse.json({ error: `At most ${MAX_IDS} emails per request` }, { status: 400 })
    }

    // An empty `in: []` would be a no-op, but a non-integer entry makes Prisma
    // throw; reject the whole batch instead of partially applying it.
    if (!ids.every((id) => Number.isSafeInteger(id) && id > 0)) {
      return NextResponse.json({ error: 'Invalid email ids' }, { status: 400 })
    }

    const result = await db.email.updateMany({
      where: { id: { in: ids as number[] } },
      data: { deletedAt: new Date() },
    })

    await logAudit(
      admin.adminId,
      'email_bulk_delete',
      `${result.count} emails`,
      `Soft-deleted email ids: ${(ids as number[]).slice(0, 50).join(', ')}${ids.length > 50 ? ', …' : ''}`,
      getClientIp(req)
    )

    return NextResponse.json({ success: true, deleted: result.count })
  } catch (error) {
    console.error('Failed to bulk delete emails:', error)
    return NextResponse.json({ error: 'Failed to bulk delete emails' }, { status: 500 })
  }
}
