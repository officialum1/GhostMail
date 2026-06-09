import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { prisma } from '@/lib/db'
import { getEmailDomain } from '@/lib/emailAddress'

async function verifyAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return false
  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'secret')
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

function groupByDate(
  items: Array<Record<string, Date | string>>,
  dateField: string,
  days: number,
  formatter?: (date: Date) => string
) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const groups: Record<string, number> = {}

  items.forEach((item) => {
    const value = item[dateField]
    const date = new Date(value)
    const key = date.toISOString().split('T')[0]
    groups[key] = (groups[key] || 0) + 1
  })

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (days - index - 1))
    const key = date.toISOString().split('T')[0]
    return {
      date: key,
      count: groups[key] || 0,
      label: formatter ? formatter(date) : key,
    }
  })
}

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requestedDays = Number(req.nextUrl.searchParams.get('days') || 30)
    const days = Number.isFinite(requestedDays) ? Math.min(90, Math.max(7, requestedDays)) : 30
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const rangeStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      todayUsers,
      weekUsers,
      totalEmails,
      todayEmails,
      weekEmails,
      bannedUsers,
      recentUsers,
      recentEmails,
      topUsers,
      userGrowthRaw,
      emailVolumeRaw,
      failedLogins24h,
      suspiciousUnresolved,
      highSeverityCount,
      suspicious,
      senderEmails,
      peakHourEmails,
      totalWebhookLogs,
      successfulWebhookLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.email.count({ where: { deletedAt: null } }),
      prisma.email.count({ where: { deletedAt: null, receivedAt: { gte: todayStart } } }),
      prisma.email.count({ where: { deletedAt: null, receivedAt: { gte: weekStart } } }),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { emails: true } } },
      }),
      prisma.email.findMany({
        take: 10,
        where: { deletedAt: null },
        orderBy: { receivedAt: 'desc' },
        include: { user: { select: { username: true } } },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { emails: { _count: 'desc' } },
        include: { _count: { select: { emails: true } } },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: rangeStart } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.email.findMany({
        where: { deletedAt: null, receivedAt: { gte: rangeStart } },
        select: { receivedAt: true },
        orderBy: { receivedAt: 'asc' },
      }),
      prisma.failedLoginAttempt.count({ where: { attemptedAt: { gte: last24Hours } } }),
      prisma.suspiciousActivity.count({ where: { resolved: false } }),
      prisma.suspiciousActivity.count({ where: { resolved: false, severity: 'high' } }),
      prisma.suspiciousActivity.findMany({
        where: { resolved: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.email.findMany({
        where: { deletedAt: null },
        select: { fromAddress: true },
        take: 10000,
      }),
      prisma.email.findMany({
        where: { deletedAt: null, receivedAt: { gte: weekStart } },
        select: { receivedAt: true },
      }),
      prisma.webhookLog.count(),
      prisma.webhookLog.count({ where: { status: 'success' } }),
    ])

    const domainCounts = new Map<string, number>()
    for (const entry of senderEmails) {
      const domain = getEmailDomain(entry.fromAddress) || 'unknown'
      domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1)
    }

    const peakHours = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }))
    for (const email of peakHourEmails) {
      const hour = new Date(email.receivedAt).getHours()
      peakHours[hour].count += 1
    }

    const topUsersWithCounts = topUsers.map((user) => ({
      ...user,
      count: user._count.emails,
    }))

    return NextResponse.json({
      users: {
        total: totalUsers,
        today: todayUsers,
        thisWeek: weekUsers,
        growth: groupByDate(userGrowthRaw as Array<Record<string, Date>>, 'createdAt', days, (date) =>
          date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        ),
      },
      emails: {
        total: totalEmails,
        today: todayEmails,
        thisWeek: weekEmails,
        volume: groupByDate(emailVolumeRaw as Array<Record<string, Date>>, 'receivedAt', days, (date) =>
          date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        ),
        peakHours,
        avgPerUser: totalUsers > 0 ? Number((totalEmails / totalUsers).toFixed(1)) : 0,
        avgPerDay: Number((totalEmails / days).toFixed(1)),
      },
      bannedUsers,
      recentUsers,
      recentEmails,
      topUsers: topUsersWithCounts,
      topSenders: [...domainCounts.entries()]
        .map(([domain, count]) => ({ domain, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      webhookStats: {
        total: totalWebhookLogs,
        success: successfulWebhookLogs,
        successRate: totalWebhookLogs > 0 ? Math.round((successfulWebhookLogs / totalWebhookLogs) * 100) : 0,
      },
      alerts: {
        failedLogins24h,
        suspiciousUnresolved,
        highSeverityCount,
        bannedUsers,
      },
      suspicious,
    })
  } catch (error) {
    console.error('Overview error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
