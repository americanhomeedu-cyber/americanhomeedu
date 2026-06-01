import type { Metadata } from 'next'
import { Playfair_Display, Manrope, Inter } from 'next/font/google'
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
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${playfair.variable} ${manrope.variable} ${inter.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
