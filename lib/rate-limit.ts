/**
 * In-memory rate limiter for single-instance / dev. For production multi-instance
 * deployments, wire Upstash Redis via env (UPSTASH_REDIS_REST_URL/TOKEN) — see
 * STAGE 14. Reserved for our own API routes; client-side Supabase auth calls
 * rely on Supabase's built-in limits.
 */
type Result = { ok: boolean; remaining: number; retryAfterMs?: number }

const buckets = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): Result {
  const now = Date.now()
  const b = buckets.get(key)
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1 }
  }
  if (b.count >= limit) {
    return { ok: false, remaining: 0, retryAfterMs: b.resetAt - now }
  }
  b.count += 1
  return { ok: true, remaining: limit - b.count }
}
