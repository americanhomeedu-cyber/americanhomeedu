'use client'

import type { ReactNode } from 'react'
import { track } from '@/lib/analytics/track'

/** Landing CTA anchor that records a `cta_click` analytics event on click. */
export function CtaLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) {
  return (
    <a href={href} className={className} onClick={() => track('cta_click')}>
      {children}
    </a>
  )
}
