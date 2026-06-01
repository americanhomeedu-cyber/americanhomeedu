/** @type {import('next').NextConfig} */

// Security headers applied to every route. A strict Content-Security-Policy is
// intentionally deferred to STAGE 14 (polish) — it needs per-integration tuning
// for Stripe / Supabase / GA and would otherwise break those in development.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Supabase Storage (course covers, images, avatars)
      { protocol: 'https', hostname: 'snmkzxdhbnkamyrmapvy.supabase.co' },
      // Design placeholder photos
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // YouTube / Vimeo thumbnails
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'i.vimeocdn.com' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
