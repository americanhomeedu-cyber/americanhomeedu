import { z } from 'zod'
import { fulfillCheckoutSession } from '@/lib/stripe/fulfill'
import { getStripe } from '@/lib/stripe/server'

const Schema = z.object({ sessionId: z.string().min(1) })

/**
 * Backup fulfillment path, called from /checkout/success in case the webhook
 * is delayed. Idempotent — shares fulfillCheckoutSession with the webhook.
 */
export async function POST(req: Request) {
  let sessionId: string
  try {
    sessionId = Schema.parse(await req.json()).sessionId
  } catch {
    return Response.json({ error: 'Некорректный запрос' }, { status: 400 })
  }

  let courseId: string | null = null
  try {
    await fulfillCheckoutSession(sessionId)
    const session = await getStripe().checkout.sessions.retrieve(sessionId)
    courseId = (session.metadata?.course_id as string | undefined) ?? null
  } catch (err) {
    console.error('[confirm] fulfillment failed:', err)
    return Response.json({ error: 'Не удалось подтвердить оплату' }, { status: 500 })
  }

  return Response.json({ ok: true, courseId })
}
