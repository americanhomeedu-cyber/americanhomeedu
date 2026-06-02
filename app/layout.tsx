import type { Metadata } from 'next'
import { Playfair_Display, Manrope, Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { AnalyticsScripts } from '@/components/analytics/analytics-scripts'
import { PageViewTracker } from '@/components/analytics/page-view-tracker'
import './globals.css'

/**
 * Brand typography (loaded once at the root; areas pick which sans to use
 * via CSS variables in globals.css):
 *  - Playfair Display -> all headings everywhere (--font-playfair)
 *  - Manrope          -> marketing landing body (--font-manrope)
 *  - Inter            -> admin + student body (--font-inter)
 * All include the Cyrillic subset (UI copy is Russian).
 */
const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair',
  display: 'swap',
})
const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
})
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'American Home Blueprint with Alla',
  description:
    'Онлайн-курс «Как купить дом в Америке» — пошаговая система для русскоязычных иммигрантов от Аллы Ризаевой.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
  openGraph: { type: 'website', images: ['/images/alla-banner.jpg'] },
  twitter: { card: 'summary_large_image', images: ['/images/alla-banner.jpg'] },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${playfair.variable} ${manrope.variable} ${inter.variable}`}
    >
      <body className="font-sans antialiased">
        {children}
        <Toaster position="bottom-right" richColors closeButton />
        <PageViewTracker />
        <AnalyticsScripts />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
