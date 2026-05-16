import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { logAudit } from '@/lib/audit'
import { getAdminFromToken } from '@/lib/adminSession'
import { getClientIp } from '@/lib/clientIp'
import { db } from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const id = parseInt(params.id, 10)
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const item = await db.suspiciousActivity.update({
      where: { id },
      data: { resolved: true },
    })

    const admin = await getAdminFromToken()
    if (admin) {
      await logAudit(admin.adminId, 'resolve_suspicious', String(id), item.description, getClientIp(req))
    }

    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error('Resolve suspicious error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
