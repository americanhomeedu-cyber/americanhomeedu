import { requireAdmin } from '@/lib/auth/require-admin'
import { createServiceClient } from '@/lib/supabase/service'
import { getStripe } from '@/lib/stripe/server'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })

  let reason = ''
  try {
    const b = await req.json()
    if (b && typeof b.reason === 'string') reason = b.reason.trim()
  } catch {
    /* no body — fine */
  }

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

  const { error: upErr } = await service
    .from('orders')
    .update({
      status: 'refunded',
      refunded_at: new Date().toISOString(),
      refund_reason: reason || null,
    })
    .eq('id', params.id)
  if (upErr) {
    // Stripe already refunded — surface so it isn't blindly retried into a 2nd refund.
    return Response.json(
      { error: 'Возврат в Stripe выполнен, но статус заказа не обновился: ' + upErr.message },
      { status: 500 },
    )
  }

  // Revoke the course access.
  await service
    .from('course_enrollments')
    .update({ revoked_at: new Date().toISOString(), revoke_reason: reason || 'refund' })
    .eq('user_id', order.user_id)
    .eq('course_id', order.course_id)

  return Response.json({ ok: true })
}
