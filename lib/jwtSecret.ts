/**
 * Single source of truth for the JWT signing secret.
 *
 * Previously several call sites did `process.env.NEXTAUTH_SECRET || 'secret'`.
 * That fallback meant a missing env var silently downgraded admin auth to a
 * publicly-known key, letting anyone forge an `admin_token`. Fail closed instead.
 *
 * Edge-runtime safe: only `process.env` and `TextEncoder`.
 */

let cached: Uint8Array | null = null

export function getJwtSecret(): Uint8Array {
  if (cached) return cached

  const secret = process.env.NEXTAUTH_SECRET
  if (!secret || secret.length < 16) {
    throw new Error(
      'NEXTAUTH_SECRET is missing or too short (min 16 chars). Refusing to sign or verify tokens.'
    )
  }

  cached = new TextEncoder().encode(secret)
  return cached
}
