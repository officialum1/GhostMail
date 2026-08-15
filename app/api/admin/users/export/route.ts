import { NextResponse } from 'next/server'
import { csvEscape } from '@/lib/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const users = await db.user.findMany({
      // Explicit select: `include` alone also loads every bcrypt hash.
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        isBanned: true,
        _count: { select: { emails: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const header = ['id', 'username', 'email', 'joined', 'email_count', 'status']
    const rows = users.map((user) =>
      [
        csvEscape(user.id),
        csvEscape(user.username),
        csvEscape(user.email),
        csvEscape(user.createdAt.toISOString()),
        csvEscape(user._count.emails),
        csvEscape(user.isBanned ? 'Banned' : 'Active'),
      ].join(',')
    )

    return new NextResponse([header.join(','), ...rows].join('\r\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="ghostmail-users-${new Date().toISOString().slice(0, 10)}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Failed to export users:', error)
    return NextResponse.json({ error: 'Failed to export users' }, { status: 500 })
  }
}
