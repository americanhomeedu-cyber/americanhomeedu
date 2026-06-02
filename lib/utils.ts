import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names with Tailwind-aware conflict resolution.
 * Used by every UI component (shadcn convention).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format integer cents as a price, e.g. 39700 -> "$397". */
export function formatPrice(cents: number, currency = 'usd') {
  const symbol = currency.toLowerCase() === 'usd' ? '$' : ''
  return symbol + Math.round(cents / 100).toLocaleString('en-US')
}

/** Absolute site URL base (no trailing slash). */
export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
}

/**
 * Guard against open redirects — only same-origin relative paths are allowed.
 * Rejects absolute URLs and protocol-relative (`//evil.com`, `/\evil.com`).
 */
export function safePath(p: string | undefined | null, fallback = '/dashboard') {
  if (p && p.startsWith('/') && !p.startsWith('//') && !p.startsWith('/\\')) return p
  return fallback
}
