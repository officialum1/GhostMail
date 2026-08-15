import { NextResponse } from 'next/server'
import { logAudit } from '@/lib/audit'
import { getAdminFromToken } from '@/lib/adminSession'
import { getClientIp } from '@/lib/clientIp'
import { db } from '@/lib/db'

const MAX_MESSAGE_LENGTH = 500
/** Mirrors the keys of `colorClasses` in components/AnnouncementBanner.tsx. */
const ALLOWED_COLORS = ['blue', 'green', 'yellow', 'red'] as const

export async function GET() {
  try {
    const admin = await getAdminFromToken()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
    const admin = await getAdminFromToken()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    const isActive = Boolean(body?.isActive)

    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 })
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: 'Message is too long' }, { status: 400 })
    }

    // Allow-list the colour: it is interpolated into a Tailwind class name.
    const color = ALLOWED_COLORS.includes(body?.color) ? body.color : 'blue'

    const announcement = await db.$transaction(async (tx) => {
      if (isActive) {
        await tx.announcementBanner.updateMany({ data: { isActive: false } })
      }
      return tx.announcementBanner.create({ data: { message, color, isActive } })
    })

    await logAudit(admin.adminId, 'announcement_update', undefined, message, getClientIp(req))

    return NextResponse.json(announcement)
  } catch (error) {
    console.error('Announcement POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await getAdminFromToken()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await db.announcementBanner.updateMany({ data: { isActive: false } })
    await logAudit(admin.adminId, 'announcement_clear', undefined, 'Deactivated all banners', getClientIp(req))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Announcement DELETE error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
