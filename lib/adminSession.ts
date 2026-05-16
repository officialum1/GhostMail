import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export async function getAdminFromToken() {
  const token = cookies().get('admin_token')?.value
  if (!token) return null

  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'secret')
    const { payload } = await jwtVerify(token, secret)
    const adminId = Number(payload.adminId)
    const email = String(payload.email || '')
    if (!Number.isFinite(adminId)) return null
    return { adminId, email }
  } catch {
    return null
  }
}
