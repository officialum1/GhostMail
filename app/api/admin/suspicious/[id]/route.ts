import { NextResponse } from 'next/server'
import { logAudit } from '@/lib/audit'
import { getAdminFromToken } from '@/lib/adminSession'
import { getClientIp } from '@/lib/clientIp'
import { db } from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdminFromToken()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = Number.parseInt(params.id, 10)
    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const item = await db.suspiciousActivity
      .update({ where: { id }, data: { resolved: true } })
      .catch(() => null)

    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await logAudit(admin.adminId, 'resolve_suspicious', String(id), item.description, getClientIp(req))

    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error('Resolve suspicious error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
