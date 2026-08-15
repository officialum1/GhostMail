import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { csvEscape } from '@/lib/admin'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const rawPage = Number.parseInt(searchParams.get('page') || '', 10)
    const rawLimit = Number.parseInt(searchParams.get('limit') || '', 10)
    // `|| 1` already caught NaN, but not a negative page: that produced a
    // negative `skip`, which Prisma rejects at runtime.
    const page = Number.isFinite(rawPage) ? Math.min(100_000, Math.max(1, rawPage)) : 1
    const limit = Number.isFinite(rawLimit) ? Math.min(100, Math.max(1, rawLimit)) : 50
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
      const header = 'id,admin_email,action,target,details,ip,created_at'
      const rows = logs.map(
        (l) =>
          `${l.id},${csvEscape(l.admin.email)},${csvEscape(l.action)},${csvEscape(l.target)},${csvEscape(l.details)},${csvEscape(l.ip)},${l.createdAt.toISOString()}`
      )

      return new NextResponse([header, ...rows].join('\r\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="audit-log.csv"',
          'Cache-Control': 'no-store',
        },
      })
    }

    return NextResponse.json({ logs, total, page, limit })
  } catch (error) {
    console.error('Audit log error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
