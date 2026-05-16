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

    const announcement = await db.announcementBanner.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(announcement)
  } catch (error) {
    console.error('Announcement GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const { message, color, isActive } = await req.json()

    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    if (isActive) {
      await db.announcementBanner.updateMany({ data: { isActive: false } })
    }

    const announcement = await db.announcementBanner.create({
      data: {
        message: String(message),
        color: color || 'blue',
        isActive: Boolean(isActive),
      },
    })

    const admin = await getAdminFromToken()
    if (admin) {
      await logAudit(admin.adminId, 'announcement_update', undefined, message, getClientIp(req))
    }

    return NextResponse.json(announcement)
  } catch (error) {
    console.error('Announcement POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    await db.announcementBanner.updateMany({ data: { isActive: false } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Announcement DELETE error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
