/** @type {import('next').NextConfig} */

/**
 * Content-Security-Policy.
 *
 * `'unsafe-inline'` is required for scripts because Next.js App Router emits
 * inline bootstrap/flight scripts and `next/script` injects the GA snippet
 * inline; a nonce-based policy would need a custom document and middleware
 * rewrite. It is required for styles because Tailwind's runtime and React's
 * `style` props emit inline style attributes.
 *
 * `img-src` stays wide open: email bodies render in a sandboxed `srcdoc`
 * iframe, and srcdoc documents inherit the parent policy, so narrowing this
 * would break remote images in received mail. Untrusted email HTML is
 * neutralised by `sanitizeEmailHtml` plus the iframe sandbox instead.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src * data: blob:",
  "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // X-Frame-Options: DENY is kept below for older browsers.
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ')

const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  httpAgentOptions: { keepAlive: true },
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs', 'prisma', '@prisma/client'],
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Content-Security-Policy', value: contentSecurityPolicy },
        {
          // 2 years, preload-eligible. Only meaningful over HTTPS.
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
        },
      ],
    },
    {
      source: '/fonts/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/_next/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
  webpack: (config) => {
    config.externals.push('bcryptjs')
    return config
  },
}

export default nextConfig
