import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        lastActive: true,
        _count: { select: { emails: true } },
      },
      orderBy: { emails: { _count: 'desc' } },
      take: 20,
    })

    return NextResponse.json(
      users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        count: u._count.emails,
        createdAt: u.createdAt,
        lastActive: u.lastActive,
      }))
    )
  } catch (error) {
    console.error('Top users error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
