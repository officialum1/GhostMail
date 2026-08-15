/**
 * Extracts the caller's IP address.
 *
 * `x-forwarded-for` is client-controlled unless a trusted proxy overwrites it.
 * Set `TRUSTED_PROXY_HEADER=false` when the app is exposed directly, so a
 * caller can't defeat IP rate limits or the IP blacklist by spoofing a header.
 */
export function getClientIp(req: Request) {
  const trustProxy = process.env.TRUSTED_PROXY_HEADER !== 'false'

  if (trustProxy) {
    // Left-most entry is the original client as appended by the first proxy.
    const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    if (forwarded && isPlausibleIp(forwarded)) return forwarded

    const realIp = req.headers.get('x-real-ip')?.trim()
    if (realIp && isPlausibleIp(realIp)) return realIp
  }

  // Cloudflare sets this and it cannot be overridden by the client.
  const cfIp = req.headers.get('cf-connecting-ip')?.trim()
  if (cfIp && isPlausibleIp(cfIp)) return cfIp

  return 'unknown'
}

/** Cheap shape check so junk header values don't become blacklist/rate-limit keys. */
function isPlausibleIp(value: string) {
  if (value.length > 45) return false
  return /^[0-9a-f.:]+$/i.test(value)
}
