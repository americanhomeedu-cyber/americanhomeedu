import type { ReactNode } from 'react'
import { SiteNav } from '@/components/marketing/site-nav'
import { SiteFooter } from '@/components/marketing/site-footer'
import { CookieBanner } from '@/components/marketing/cookie-banner'
import { getSiteSettings } from '@/lib/settings'
import './landing.css'

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const s = await getSiteSettings()
  return (
    <div className="theme-marketing bg-cream text-ink">
      <SiteNav />
      {children}
      <SiteFooter />
      <CookieBanner enabled={s.cookie_enabled === 'true'} text={s.cookie_banner_text} />
    </div>
  )
}
