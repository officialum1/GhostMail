import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { csvEscape } from '@/lib/admin'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10) || 1
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50', 10) || 50)
    const format = searchParams.get('format')
    const skip = (page - 1) * limit

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { admin: { select: { email: true } } },
      }),
      db.auditLog.count(),
    ])

    if (format === 'csv') {
      const header = 'id,admin_email,action,target,details,ip,created_at\n'
      const rows = logs
        .map(
          (l) =>
            `${l.id},${csvEscape(l.admin.email)},${csvEscape(l.action)},${csvEscape(l.target)},${csvEscape(l.details)},${csvEscape(l.ip)},${l.createdAt.toISOString()}`
        )
        .join('\n')

      return new NextResponse(header + rows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="audit-log.csv"',
        },
      })
    }

    return NextResponse.json({ logs, total, page, limit })
  } catch (error) {
    console.error('Audit log error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
