import { SOCIALS } from '@/lib/constants'
import type { Database } from '@/types/database'

type Course = Database['public']['Tables']['courses']['Row']
type FaqItem = Database['public']['Tables']['faq_items']['Row']

export function JsonLd({
  course,
  faqs,
  siteUrl,
}: {
  course: Course
  faqs: FaqItem[]
  siteUrl: string
}) {
  const sameAs = [SOCIALS.instagram, SOCIALS.youtube, SOCIALS.facebook]

  const data: unknown[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'American Home Blueprint',
      url: siteUrl,
      sameAs,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Алла Ризаева',
      jobTitle: 'Licensed Real Estate Agent',
      worksFor: { '@type': 'Organization', name: 'Keller Williams Ballantyne' },
      sameAs,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: course.title,
      description: course.subtitle || course.description || undefined,
      provider: { '@type': 'Organization', name: 'American Home Blueprint', sameAs: siteUrl },
      offers: {
        '@type': 'Offer',
        price: (course.price_cents / 100).toFixed(2),
        priceCurrency: course.currency.toUpperCase(),
        availability: 'https://schema.org/InStock',
      },
    },
  ]

  if (faqs.length) {
    data.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    })
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
