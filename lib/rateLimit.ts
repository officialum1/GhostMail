/**
 * In-memory fixed-window rate limiter.
 *
 * Caveat: state is per-process. Behind multiple instances or serverless
 * workers each process keeps its own counters, so effective limits are
 * `limit x instances`. Move to Redis/Postgres if you scale horizontally.
 */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

/** Bound the map so a flood of unique keys (one per spoofed IP) can't exhaust memory. */
const MAX_BUCKETS = 20_000
let lastSweep = 0

function sweep(now: number) {
  // Amortised cleanup: at most once every 60s, and always when oversized.
  if (now - lastSweep < 60_000 && buckets.size < MAX_BUCKETS) return
  lastSweep = now

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }

  // Still oversized after dropping expired entries: evict oldest-inserted keys.
  if (buckets.size >= MAX_BUCKETS) {
    const excess = buckets.size - Math.floor(MAX_BUCKETS * 0.8)
    let removed = 0
    for (const key of buckets.keys()) {
      buckets.delete(key)
      if (++removed >= excess) break
    }
  }
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  sweep(now)

  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: bucket.resetAt - now }
  }

  bucket.count += 1
  return { allowed: true, remaining: limit - bucket.count }
}
