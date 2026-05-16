import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const { ids } = await req.json()
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'number')) {
      return NextResponse.json({ error: 'Invalid email ids' }, { status: 400 })
    }

    const result = await db.email.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ success: true, deleted: result.count })
  } catch (error) {
    console.error('Failed to bulk delete emails:', error)
    return NextResponse.json({ error: 'Failed to bulk delete emails' }, { status: 500 })
  }
}
