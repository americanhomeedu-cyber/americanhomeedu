/**
 * Static brand constants. Dynamic, editable values (price, course title,
 * settings) come from the DB — these are stable identity/links only.
 */

export const SITE = {
  name: 'American Home Blueprint',
  fullName: 'American Home Blueprint with Alla',
  expert: 'Alla Rizayev',
  expertRu: 'Алла Ризаева',
  // TODO(client): confirm production domain
  domain: 'americanhomeedu.com',
} as const

export const SOCIALS = {
  instagram: 'https://instagram.com/move.us.with.alla',
  youtube: 'https://youtube.com/@AllaRizayev',
  facebook: 'https://www.facebook.com/alla.rizayev',
  instagramHandle: '@move.us.with.alla',
} as const

/** Featured course slug (the single landing course; everything else from DB). */
export const FEATURED_COURSE_SLUG = 'american-home-blueprint'

/** Auth / rate-limit tunables referenced across the app. */
export const AUTH = {
  resendCodeCooldownSeconds: 60,
  loginMaxAttempts: 5,
  loginWindowMinutes: 15,
  // Length of the email confirmation code. Must match the OTP length Supabase
  // sends (Authentication → Providers → Email → Email OTP Length).
  otpLength: 8,
} as const

export const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
