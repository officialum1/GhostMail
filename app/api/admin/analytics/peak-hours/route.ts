import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const emails = await db.email.findMany({
      where: { deletedAt: null, receivedAt: { gte: weekAgo } },
      select: { receivedAt: true },
    })

    const hours = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }))
    for (const email of emails) {
      const hour = new Date(email.receivedAt).getHours()
      hours[hour].count += 1
    }

    const peak = hours.reduce((max, h) => (h.count > max.count ? h : max), hours[0])

    return NextResponse.json({ hours, peakHour: peak.hour, peakCount: peak.count })
  } catch (error) {
    console.error('Peak hours error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
