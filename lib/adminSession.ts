import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { getJwtSecret } from '@/lib/jwtSecret'

export async function getAdminFromToken() {
  const token = cookies().get('admin_token')?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    if (payload.scope !== 'admin') return null
    const adminId = Number(payload.adminId)
    const email = String(payload.email || '')
    if (!Number.isFinite(adminId)) return null
    return { adminId, email }
  } catch {
    return null
  }
}
