import { NextResponse } from 'next/server'
import { csvEscape } from '@/lib/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Was missing entirely: this endpoint dumped every user's email address to
    // anyone who requested it.
    const authError = await requireAdmin()
    if (authError) return authError

    const users = await db.user.findMany({
      select: { id: true, username: true, email: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })

    const headers = ['ID', 'Username', 'Email', 'Created At']
    const csvRows = users.map((user) =>
      [
        csvEscape(user.id),
        csvEscape(user.username),
        csvEscape(user.email),
        csvEscape(user.createdAt.toISOString()),
      ].join(',')
    )

    const csvContent = [headers.join(','), ...csvRows].join('\r\n')

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="ghostmail_users.csv"',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Failed to export settings data:', error)
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 })
  }
}
