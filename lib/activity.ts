import { db } from '@/lib/db'

export async function logActivity(data: {
  type: string
  message: string
  metadata?: string
  userId?: number
  ip?: string
}) {
  try {
    await db.activityLog.create({ data })
  } catch (error) {
    console.error('Failed to write activity log:', error)
  }
}
