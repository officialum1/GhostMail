import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const userId = parseInt(searchParams.get('userId') || '')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const take = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * take
    const where = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { subject: { contains: search } },
              { fromAddress: { contains: search } },
              { toAddress: { contains: search } },
            ],
          }
        : {}),
      ...(Number.isNaN(userId) ? {} : { userId }),
      ...(dateFrom || dateTo
        ? {
            receivedAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59.999Z`) } : {}),
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
        include: {
          user: { select: { username: true, email: true } },
        },
      }),
      db.email.count({ where }),
      db.email.count({ where: { deletedAt: null } }),
      db.email.count({ where: { deletedAt: null, receivedAt: { gte: today } } }),
      db.email.count({ where: { deletedAt: null, receivedAt: { gte: weekAgo } } }),
      db.user.findMany({
        select: { id: true, username: true, email: true },
        orderBy: { username: 'asc' },
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
