import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

/** Keeps `take`/`skip` inside sane bounds: a negative skip makes Prisma throw. */
function clampInt(raw: string | null, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(raw ?? '', 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, parsed))
}

export async function GET(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const search = (searchParams.get('search') || '').slice(0, 200)
    const page = clampInt(searchParams.get('page'), 1, 1, 100_000)
    const take = clampInt(searchParams.get('limit'), DEFAULT_LIMIT, 1, MAX_LIMIT)
    const sort = searchParams.get('sort') || 'newest'
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
            { username: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
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
