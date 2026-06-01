import type { ReactNode } from 'react'
import { SiteNav } from '@/components/marketing/site-nav'
import { SiteFooter } from '@/components/marketing/site-footer'
import './landing.css'

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="theme-marketing bg-cream text-ink">
      <SiteNav />
      {children}
      <SiteFooter />
    </div>
  )
}
