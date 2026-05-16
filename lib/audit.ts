import { db } from '@/lib/db'

export async function logAudit(
  adminId: number,
  action: string,
  target?: string,
  details?: string,
  ip?: string
) {
  try {
    await db.auditLog.create({
      data: { adminId, action, target, details, ip },
    })
  } catch (error) {
    console.error('Failed to write audit log:', error)
  }
}
