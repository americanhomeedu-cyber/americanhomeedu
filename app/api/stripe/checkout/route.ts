import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getStripe } from '@/lib/stripe/server'
import { siteUrl } from '@/lib/utils'

const Schema = z.object({ courseId: z.string().uuid() })

export async function POST(req: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  let courseId: string
  try {
    courseId = Schema.parse(await req.json()).courseId
  } catch {
    return Response.json({ error: 'Некорректный запрос' }, { status: 400 })
  }

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .eq('is_published', true)
    .single()
  if (!course) return Response.json({ error: 'Курс не найден' }, { status: 404 })

  // Already has active (non-revoked, non-expired) access?
  const { data: existing } = await supabase
    .from('course_enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .is('revoked_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .maybeSingle()
  if (existing) {
    return Response.json(
      { error: 'У вас уже есть доступ к этому курсу' },
      { status: 400 },
    )
  }

  const stripe = getStripe()
  const service = createServiceClient()

  // Reuse or create the Stripe customer.
  const { data: profile } = await service
    .from('profiles')
    .select('stripe_customer_id, email, full_name')
    .eq('id', user.id)
    .single()
  let customerId = profile?.stripe_customer_id ?? undefined
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email ?? undefined,
      name: profile?.full_name ?? undefined,
      metadata: { user_id: user.id },
    })
    customerId = customer.id
    await service
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: course.currency,
          product_data: {
            name: course.title,
            description: course.subtitle || undefined,
          },
          unit_amount: course.price_cents,
        },
        quantity: 1,
      },
    ],
    success_url: `${siteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/checkout/cancel`,
    allow_promotion_codes: true,
    payment_method_types: ['card'],
    metadata: { user_id: user.id, course_id: course.id },
  })

  return Response.json({ url: session.url })
}
