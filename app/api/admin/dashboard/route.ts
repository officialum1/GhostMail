import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'

type ChartPoint = {
  date: string
  count: number
  label: string
}

function createSeries(days: number, formatter: (date: Date) => string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (days - index - 1))
    return {
      date: date.toISOString().slice(0, 10),
      count: 0,
      label: formatter(date),
    }
  })
}

function mapSeries(items: Date[], days: number, formatter: (date: Date) => string): ChartPoint[] {
  const series = createSeries(days, formatter)
  const counts = new Map<string, number>()

  for (const item of items) {
    const key = new Date(item).toISOString().slice(0, 10)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return series.map((entry) => ({
    ...entry,
    count: counts.get(entry.date) ?? 0,
  }))
}

export async function GET() {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    weekAgo.setHours(0, 0, 0, 0)

    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 29)
    monthAgo.setHours(0, 0, 0, 0)

    const [
      totalUsers,
      totalEmails,
      emailsToday,
      emailsThisWeek,
      bannedUsers,
      recentUsers,
      recentEmails,
      growthUsers,
      weeklyEmails,
    ] = await Promise.all([
      db.user.count(),
      db.email.count({ where: { deletedAt: null } }),
      db.email.count({ where: { deletedAt: null, receivedAt: { gte: today } } }),
      db.email.count({ where: { deletedAt: null, receivedAt: { gte: weekAgo } } }),
      db.user.count({ where: { isBanned: true } }),
      db.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { emails: true } } },
      }),
      db.email.findMany({
        take: 10,
        where: { deletedAt: null },
        orderBy: { receivedAt: 'desc' },
        include: { user: { select: { username: true, email: true } } },
      }),
      db.user.findMany({
        where: { createdAt: { gte: monthAgo } },
        select: { createdAt: true },
      }),
      db.email.findMany({
        where: { deletedAt: null, receivedAt: { gte: weekAgo } },
        select: { receivedAt: true },
      }),
    ])

    const userGrowth = mapSeries(
      growthUsers.map((item) => item.createdAt),
      30,
      (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    )

    const emailVolume = mapSeries(
      weeklyEmails.map((item) => item.receivedAt),
      7,
      (date) => date.toLocaleDateString('en-US', { weekday: 'short' })
    )

    return NextResponse.json({
      stats: {
        totalUsers,
        totalEmails,
        emailsToday,
        emailsThisWeek,
        bannedUsers,
        systemStatus: 'Online',
      },
      userGrowth,
      emailVolume,
      recentUsers,
      recentEmails,
    })
  } catch (error) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
