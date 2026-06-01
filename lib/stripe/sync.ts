import { createServiceClient } from '@/lib/supabase/service'
import { getStripe } from './server'

/**
 * Sync a course into Stripe as a Product + Price. Stripe Prices are immutable,
 * so a new Price is created each call and stored on the course. Used by the
 * admin "Sync with Stripe" action (STAGE 8). Checkout itself uses inline
 * price_data so the live DB price is always authoritative.
 */
export async function syncCourseToStripe(courseId: string) {
  const supabase = createServiceClient()
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()
  if (!course) throw new Error('Course not found')

  const stripe = getStripe()

  let productId = course.stripe_product_id
  if (productId) {
    await stripe.products.update(productId, {
      name: course.title,
      description: course.subtitle || undefined,
    })
  } else {
    const product = await stripe.products.create({
      name: course.title,
      description: course.subtitle || undefined,
    })
    productId = product.id
  }

  const price = await stripe.prices.create({
    product: productId,
    unit_amount: course.price_cents,
    currency: course.currency,
  })

  await supabase
    .from('courses')
    .update({ stripe_product_id: productId, stripe_price_id: price.id })
    .eq('id', courseId)

  return { productId, priceId: price.id }
}
