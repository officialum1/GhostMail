import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { getEmailDomain } from '@/lib/emailAddress'

function createSeries(days: number) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (days - index - 1))
    return { date: date.toISOString().slice(0, 10), count: 0 }
  })
}

function mapDates(items: Date[], days: number) {
  const series = createSeries(days)
  const counts = new Map<string, number>()
  for (const item of items) {
    const key = new Date(item).toISOString().slice(0, 10)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return series.map((entry) => ({ ...entry, count: counts.get(entry.date) ?? 0 }))
}

export async function GET(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const days = Math.min(90, parseInt(searchParams.get('days') || '30', 10) || 30)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today)
    monthAgo.setDate(monthAgo.getDate() - 29)
    const rangeStart = new Date(today)
    rangeStart.setDate(rangeStart.getDate() - (days - 1))

    const [
      totalUsers,
      usersToday,
      usersThisWeek,
      usersThisMonth,
      growthUsers,
      totalEmails,
      emailsToday,
      emailsThisWeek,
      emailsThisMonth,
      volumeEmails,
      webhookTotal,
      webhookSuccess,
      topUsersRaw,
      recentFromAddresses,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { createdAt: { gte: today } } }),
      db.user.count({ where: { createdAt: { gte: weekAgo } } }),
      db.user.count({ where: { createdAt: { gte: monthAgo } } }),
      db.user.findMany({ where: { createdAt: { gte: rangeStart } }, select: { createdAt: true } }),
      db.email.count({ where: { deletedAt: null } }),
      db.email.count({ where: { deletedAt: null, receivedAt: { gte: today } } }),
      db.email.count({ where: { deletedAt: null, receivedAt: { gte: weekAgo } } }),
      db.email.count({ where: { deletedAt: null, receivedAt: { gte: monthAgo } } }),
      db.email.findMany({
        where: { deletedAt: null, receivedAt: { gte: rangeStart } },
        select: { receivedAt: true },
      }),
      db.webhookLog.count(),
      db.webhookLog.count({ where: { status: 'success' } }),
      db.user.findMany({
        select: { username: true, email: true, _count: { select: { emails: true } } },
        orderBy: { emails: { _count: 'desc' } },
        take: 10,
      }),
      db.email.findMany({
        where: { deletedAt: null },
        select: { fromAddress: true },
        take: 20000,
      }),
    ])

    const domainCounts = new Map<string, number>()
    for (const e of recentFromAddresses) {
      const domain = getEmailDomain(e.fromAddress) || 'unknown'
      domainCounts.set(domain, (domainCounts.get(domain) ?? 0) + 1)
    }

    const peakWeekAgo = new Date()
    peakWeekAgo.setDate(peakWeekAgo.getDate() - 7)
    const weekEmails = await db.email.findMany({
      where: { deletedAt: null, receivedAt: { gte: peakWeekAgo } },
      select: { receivedAt: true },
    })
    const peakHours = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }))
    for (const e of weekEmails) {
      peakHours[new Date(e.receivedAt).getHours()].count += 1
    }

    return NextResponse.json({
      users: {
        total: totalUsers,
        today: usersToday,
        thisWeek: usersThisWeek,
        thisMonth: usersThisMonth,
        growth: mapDates(growthUsers.map((u) => u.createdAt), days),
      },
      emails: {
        total: totalEmails,
        today: emailsToday,
        thisWeek: emailsThisWeek,
        thisMonth: emailsThisMonth,
        volume: mapDates(volumeEmails.map((e) => e.receivedAt), days),
        peakHours,
        avgPerUser: totalUsers > 0 ? Math.round(totalEmails / totalUsers) : 0,
        avgPerDay: days > 0 ? Math.round(volumeEmails.length / days) : 0,
      },
      topSenders: [...domainCounts.entries()]
        .map(([domain, count]) => ({ domain, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topUsers: topUsersRaw.map((u) => ({
        username: u.username,
        email: u.email,
        count: u._count.emails,
      })),
      webhookStats: {
        total: webhookTotal,
        success: webhookSuccess,
        error: webhookTotal - webhookSuccess,
        successRate: webhookTotal > 0 ? Math.round((webhookSuccess / webhookTotal) * 1000) / 10 : 100,
      },
    })
  } catch (error) {
    console.error('Analytics overview error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
