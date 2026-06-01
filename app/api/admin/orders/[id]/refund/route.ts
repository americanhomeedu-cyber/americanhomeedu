import { requireAdmin } from '@/lib/auth/require-admin'
import { createServiceClient } from '@/lib/supabase/service'
import { getStripe } from '@/lib/stripe/server'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })

  const service = createServiceClient()
  const { data: order } = await service
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .single()
  if (!order) return Response.json({ error: 'Заказ не найден' }, { status: 404 })
  if (order.status === 'refunded')
    return Response.json({ error: 'Уже возвращён' }, { status: 400 })

  if (order.stripe_payment_intent_id) {
    try {
      await getStripe().refunds.create({
        payment_intent: order.stripe_payment_intent_id,
      })
    } catch (e) {
      return Response.json(
        { error: 'Stripe: ' + (e instanceof Error ? e.message : 'refund failed') },
        { status: 500 },
      )
    }
  }

  await service
    .from('orders')
    .update({ status: 'refunded', refunded_at: new Date().toISOString() })
    .eq('id', params.id)

  // Revoke the course access.
  await service
    .from('course_enrollments')
    .update({ revoked_at: new Date().toISOString(), revoke_reason: 'refund' })
    .eq('user_id', order.user_id)
    .eq('course_id', order.course_id)

  return Response.json({ ok: true })
}
