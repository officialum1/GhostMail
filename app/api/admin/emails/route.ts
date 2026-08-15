import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100
/** The filter dropdown only needs a workable list, not every row in the table. */
const MAX_USER_OPTIONS = 500

function clampInt(raw: string | null, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(raw ?? '', 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, parsed))
}

/** Accepts a date only if it parses; a bad `dateFrom` would otherwise poison the query. */
function parseDate(raw: string | null, endOfDay = false) {
  if (!raw) return null
  const date = new Date(endOfDay ? `${raw}T23:59:59.999Z` : raw)
  return Number.isNaN(date.getTime()) ? null : date
}

export async function GET(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const search = (searchParams.get('search') || '').slice(0, 200)
    const page = clampInt(searchParams.get('page'), 1, 1, 100_000)
    const take = clampInt(searchParams.get('limit'), DEFAULT_LIMIT, 1, MAX_LIMIT)
    const skip = (page - 1) * take

    const rawUserId = Number.parseInt(searchParams.get('userId') || '', 10)
    const userId = Number.isSafeInteger(rawUserId) && rawUserId > 0 ? rawUserId : null

    const dateFrom = parseDate(searchParams.get('dateFrom'))
    const dateTo = parseDate(searchParams.get('dateTo'), true)

    const where = {
      ...(search
        ? {
            OR: [
              { subject: { contains: search, mode: 'insensitive' as const } },
              { fromAddress: { contains: search, mode: 'insensitive' as const } },
              { toAddress: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(userId === null ? {} : { userId }),
      ...(dateFrom || dateTo
        ? {
            receivedAt: {
              ...(dateFrom ? { gte: dateFrom } : {}),
              ...(dateTo ? { lte: dateTo } : {}),
            },
          }
        : {}),
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const [emails, total, totalEmails, emailsToday, emailsThisWeek, users] = await Promise.all([
      db.email.findMany({
        where,
        orderBy: { receivedAt: 'desc' },
        take,
        skip,
        select: {
          id: true,
          fromAddress: true,
          toAddress: true,
          subject: true,
          bodyText: true,
          bodyHtml: true,
          receivedAt: true,
          isRead: true,
          sent: true,
          user: { select: { username: true, email: true } },
        },
      }),
      db.email.count({ where }),
      db.email.count(),
      db.email.count({ where: { receivedAt: { gte: today } } }),
      db.email.count({ where: { receivedAt: { gte: weekAgo } } }),
      db.user.findMany({
        select: { id: true, username: true, email: true },
        orderBy: { username: 'asc' },
        take: MAX_USER_OPTIONS,
      }),
    ])

    return NextResponse.json({
      emails,
      total,
      page,
      limit: take,
      users,
      stats: {
        total: totalEmails,
        today: emailsToday,
        thisWeek: emailsThisWeek,
      },
    })
  } catch (error) {
    console.error('Failed to fetch admin emails:', error)
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 })
  }
}
