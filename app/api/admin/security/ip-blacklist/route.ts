import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { logAudit } from '@/lib/audit'
import { getAdminFromToken } from '@/lib/adminSession'
import { getClientIp } from '@/lib/clientIp'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const items = await db.ipBlacklist.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(items)
  } catch (error) {
    console.error('IP blacklist GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const { ip, reason } = await req.json()
    if (!ip) return NextResponse.json({ error: 'IP required' }, { status: 400 })

    const item = await db.ipBlacklist.upsert({
      where: { ip: String(ip).trim() },
      create: { ip: String(ip).trim(), reason: reason || null },
      update: { reason: reason || null },
    })

    const admin = await getAdminFromToken()
    if (admin) {
      await logAudit(admin.adminId, 'ip_blacklist_add', ip, reason, getClientIp(req))
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('IP blacklist POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const id = parseInt(searchParams.get('id') || '', 10)
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const item = await db.ipBlacklist.delete({ where: { id } })

    const admin = await getAdminFromToken()
    if (admin) {
      await logAudit(admin.adminId, 'ip_blacklist_remove', item.ip, undefined, getClientIp(req))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('IP blacklist DELETE error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
