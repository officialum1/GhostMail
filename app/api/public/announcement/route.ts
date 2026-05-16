import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const announcement = await db.announcementBanner.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, message: true, color: true },
    })
    return NextResponse.json(announcement)
  } catch {
    return NextResponse.json(null)
  }
}
