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
  compress: true,
  poweredByHeader: false,
  images: {
    // Serve AVIF first (smaller), fall back to WebP. Cache optimized images 30d.
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
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
    return [
      { source: '/:path*', headers: securityHeaders },
      // Long-cache immutable static brand assets in /public.
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }],
      },
      {
        source: '/:file(favicon.ico|robots.txt|manifest.webmanifest|apple-touch-icon.png)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
    ]
  },
}

export default nextConfig
