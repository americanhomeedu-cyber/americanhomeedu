import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/public'
import { getSiteSettings } from '@/lib/settings'
import { formatPrice, siteUrl } from '@/lib/utils'
import { Hero } from '@/components/marketing/hero'
import { Trust } from '@/components/marketing/trust'
import { PainPoints } from '@/components/marketing/pain-points'
import { Transformation } from '@/components/marketing/transformation'
import { Program } from '@/components/marketing/program'
import { About } from '@/components/marketing/about'
import { Stats } from '@/components/marketing/stats'
import { Testimonials } from '@/components/marketing/testimonials'
import { Comparison } from '@/components/marketing/comparison'
import { Calculator } from '@/components/marketing/calculator'
import { Pricing } from '@/components/marketing/pricing'
import { Faq } from '@/components/marketing/faq'
import { FinalCta } from '@/components/marketing/final-cta'
import { BuyBar } from '@/components/marketing/buy-bar'
import { JsonLd } from '@/components/marketing/json-ld'
import { RevealObserver } from '@/components/marketing/reveal-observer'

export const revalidate = 60

async function getFeaturedCourse() {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('courses')
    .select('*')
    .eq('is_featured', true)
    .eq('is_published', true)
    .single()
  return data
}

export async function generateMetadata(): Promise<Metadata> {
  const [course, settings] = await Promise.all([getFeaturedCourse(), getSiteSettings()])
  if (!course) return {}
  const title = settings.seo_title_template.includes('%s')
    ? settings.seo_title_template.replace('%s', course.title)
    : `${course.title} — ${settings.site_title}`
  const description = settings.seo_description || course.subtitle || course.description || undefined
  return {
    title,
    description,
    openGraph: {
      title: course.title,
      description,
      type: 'website',
      images: course.cover_image_url ? [{ url: course.cover_image_url }] : [],
    },
  }
}

export default async function HomePage() {
  const supabase = createPublicClient()
  const [course, settings] = await Promise.all([getFeaturedCourse(), getSiteSettings()])
  if (!course) notFound()

  const [{ data: testimonials }, { data: faqs }] = await Promise.all([
    supabase
      .from('testimonials')
      .select('*')
      .eq('is_published', true)
      .or(`course_id.eq.${course.id},course_id.is.null`)
      .order('position'),
    supabase
      .from('faq_items')
      .select('*')
      .eq('is_published', true)
      .or(`course_id.eq.${course.id},course_id.is.null`)
      .order('position'),
  ])

  // The CTA always routes to /register; the auth pages redirect a signed-in
  // user to their dashboard (keeps the landing fully static / ISR).
  const ctaHref = '/register'
  const priceLabel = formatPrice(course.price_cents, course.currency)
  const priceMajor = Math.round(course.price_cents / 100)
  const oldPriceLabel = course.old_price_cents
    ? formatPrice(course.old_price_cents, course.currency)
    : null

  return (
    <>
      <Hero
        priceLabel={priceLabel}
        ctaHref={ctaHref}
        badge={settings.hero_badge_text}
        title={settings.hero_title}
        subtitle={settings.hero_subtitle}
        cta={settings.hero_cta}
      />
      <Trust />
      <PainPoints />
      <Transformation />
      <Program />
      <About />
      <Stats />
      <Testimonials items={testimonials ?? []} />
      <Comparison priceLabel={priceLabel} />
      <Calculator ctaHref={ctaHref} />
      <Pricing priceMajor={priceMajor} oldPriceLabel={oldPriceLabel} ctaHref={ctaHref} />
      <Faq items={faqs ?? []} />
      <FinalCta ctaHref={ctaHref} priceLabel={priceLabel} />
      <BuyBar priceLabel={priceLabel} oldPriceLabel={oldPriceLabel} ctaHref={ctaHref} />
      <JsonLd course={course} faqs={faqs ?? []} siteUrl={siteUrl()} />
      <RevealObserver />
    </>
  )
}
