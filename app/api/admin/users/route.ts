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
    const limit = parseInt(searchParams.get('limit') || '20')
    const sort = searchParams.get('sort') || 'newest'
    const take = Number.isNaN(limit) ? 20 : limit
    const skip = (page - 1) * take
    const orderBy =
      sort === 'oldest'
        ? { createdAt: 'asc' as const }
        : sort === 'username'
          ? { username: 'asc' as const }
          : sort === 'mostEmails'
            ? { emails: { _count: 'desc' as const } }
            : { createdAt: 'desc' as const }
    const where = search
      ? {
          OR: [
            { username: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : undefined

    const [users, total, banned] = await Promise.all([
      db.user.findMany({
        where,
        orderBy,
        take,
        skip,
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
          isBanned: true,
          lastActive: true,
          _count: { select: { emails: true } },
          bannedUser: { select: { reason: true } },
        },
      }),
      db.user.count({ where }),
      db.user.count({ where: { ...where, isBanned: true } }),
    ])

    return NextResponse.json({
      users,
      total,
      page,
      limit: take,
      stats: {
        total,
        banned,
        active: total - banned,
      },
    })
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
