import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '50', 10) || 50)

    const activities = await db.activityLog.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    const userIds = [...new Set(activities.map((a) => a.userId).filter(Boolean))] as number[]
    const users =
      userIds.length > 0
        ? await db.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, username: true, email: true },
          })
        : []
    const userMap = new Map(users.map((u) => [u.id, u]))

    return NextResponse.json(
      activities.map((a) => ({
        ...a,
        user: a.userId ? userMap.get(a.userId) || null : null,
      }))
    )
  } catch (error) {
    console.error('Activity feed error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
