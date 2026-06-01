import type { Json } from '@/types/database'
import { createClient } from '@/lib/supabase/server'

/** Lightweight first-party event tracker (writes analytics_events). */
export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return Response.json({ ok: false }, { status: 400 })
  }

  const supabase = createClient()
  await supabase.from('analytics_events').insert({
    event_type: String(body.event_type || 'event'),
    course_id: (body.course_id as string) ?? null,
    page_url: (body.page_url as string) ?? null,
    referrer: (body.referrer as string) ?? null,
    utm_source: (body.utm_source as string) ?? null,
    utm_medium: (body.utm_medium as string) ?? null,
    utm_campaign: (body.utm_campaign as string) ?? null,
    session_id: (body.session_id as string) ?? null,
    metadata: (body.metadata ?? {}) as Json,
  })
  return Response.json({ ok: true })
}
