import { createServiceClient } from '@/lib/supabase/service'
import { getStripe } from './server'
import { formatPrice, siteUrl } from '@/lib/utils'
import {
  sendPurchaseConfirmationEmail,
  sendAdminNewSaleEmail,
} from '@/lib/resend/send'

/**
 * Idempotent fulfillment of a paid checkout session. Safe to call from BOTH
 * the webhook and the /checkout/success confirm endpoint — the existing-order
 * check + enrollment upsert guarantee no duplicates.
 */
export async function fulfillCheckoutSession(sessionId: string) {
  const supabase = createServiceClient()

  // 1. Idempotency: already fulfilled?
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_session_id', sessionId)
    .maybeSingle()
  if (existingOrder) return

  // 2. Re-fetch the session from Stripe and verify payment.
  const session = await getStripe().checkout.sessions.retrieve(sessionId)
  if (session.payment_status !== 'paid') return

  const userId = session.metadata?.user_id
  const courseId = session.metadata?.course_id
  if (!userId || !courseId) return

  const { data: course } = await supabase
    .from('courses')
    .select('title')
    .eq('id', courseId)
    .single()

  // 3. Create the order.
  const { data: order } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      course_id: courseId,
      stripe_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : null,
      amount_cents: session.amount_total ?? 0,
      currency: session.currency ?? 'usd',
      status: 'completed',
      customer_email:
        session.customer_details?.email ?? session.customer_email ?? '',
      customer_name: session.customer_details?.name ?? null,
      promo_code: session.metadata?.promo_code ?? null,
    })
    .select()
    .single()
  if (!order) return

  // 4. Create the enrollment (idempotent — unique(user_id, course_id)).
  await supabase.from('course_enrollments').upsert(
    {
      user_id: userId,
      course_id: courseId,
      source: 'purchase',
      order_id: order.id,
    },
    { onConflict: 'user_id,course_id', ignoreDuplicates: true },
  )

  // 5. Emails + analytics (never block fulfillment on email failure).
  const dashboardUrl = `${siteUrl()}/dashboard`
  try {
    await sendPurchaseConfirmationEmail({
      to: order.customer_email,
      name: order.customer_name || 'друг',
      courseTitle: course?.title ?? 'курс',
      dashboardUrl,
    })
    await sendAdminNewSaleEmail({
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      courseTitle: course?.title ?? 'курс',
      amount: formatPrice(order.amount_cents, order.currency),
    })
  } catch (err) {
    console.error('[fulfill] email send failed:', err)
  }

  await supabase.from('analytics_events').insert({
    event_type: 'purchase',
    user_id: userId,
    course_id: courseId,
    metadata: { amount_cents: session.amount_total },
  })
}
