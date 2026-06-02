import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe/server'
import { fulfillCheckoutSession } from '@/lib/stripe/fulfill'

// Node runtime required for raw-body signature verification.
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!sig || !secret) {
    return new Response('Missing signature', { status: 400 })
  }

  const body = await req.text()
  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret)
  } catch (err) {
    console.error('[webhook] signature verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    try {
      await fulfillCheckoutSession(session.id)
    } catch (err) {
      // Don't 500 → Stripe won't retry-storm. fulfill is idempotent, and the
      // /checkout/success confirm path is the backup that also grants access.
      console.error('[webhook] fulfillment error:', err)
    }
  }

  return Response.json({ received: true })
}
