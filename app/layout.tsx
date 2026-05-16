import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import SchemaMarkup from '@/components/seo/SchemaMarkup'
import AnnouncementBanner from '@/components/AnnouncementBanner'
import { DEFAULT_KEYWORDS, OG_IMAGE_URL, SITE_URL } from '@/lib/seo'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'GhostMail - Free Custom Email Address',
    template: '%s | GhostMail',
  },
  description:
    'Get a free custom email address at ghostmail.store instantly. Perfect for receiving OTPs, sign-ups, and protecting your real inbox from spam. No credit card required.',
  keywords: [...DEFAULT_KEYWORDS],
  authors: [{ name: 'GhostMail' }],
  creator: 'GhostMail',
  publisher: 'GhostMail',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'GhostMail',
    title: 'GhostMail - Free Custom Email Address',
    description:
      'Get your own @ghostmail.store email address instantly. Receive OTPs, sign-ups, and keep your real inbox spam-free.',
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'GhostMail - Free Custom Email Address',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GhostMail - Free Custom Email Address',
    description: 'Get your own email address instantly. Free forever. No credit card required.',
    images: [OG_IMAGE_URL],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: SITE_URL,
  },
  verification: googleVerification
    ? {
        google: googleVerification,
      }
    : undefined,
  other: {
    'theme-color': '#0a0f1e',
    'color-scheme': 'dark',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0f1e',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={SITE_URL} />
      </head>
      <body className={`${inter.variable} bg-[#0a0f1e] font-sans text-white antialiased`}>
        <SchemaMarkup />
        <Providers>
          <AnnouncementBanner />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#10182a',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.08)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
