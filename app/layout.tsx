import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import SchemaMarkup from '@/components/SchemaMarkup';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'GhostMail — Free Custom Email Address',
    template: '%s | GhostMail',
  },
  description:
    'Get your own custom email address instantly at ghostmail.store. Perfect for receiving OTPs, sign-ups, and protecting your real inbox. Free forever, no credit card required.',
  keywords: [
    'free email address',
    'custom email',
    'OTP email',
    'disposable email',
    'temporary email',
    'receive OTP',
    'ghostmail',
    'free inbox',
    'email privacy',
    'burner email',
  ],
  authors: [{ name: 'GhostMail' }],
  creator: 'GhostMail',
  publisher: 'GhostMail',
  metadataBase: new URL('https://ghostmail.store'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ghostmail.store',
    siteName: 'GhostMail',
    title: 'GhostMail — Free Custom Email Address',
    description:
      'Get your own custom email address instantly. Receive OTPs, sign-ups, and protect your real inbox. Free forever.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GhostMail',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GhostMail — Free Custom Email Address',
    description: 'Get your own custom email address instantly. Free forever.',
    images: ['/og-image.png'],
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
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'add-your-google-verification-code-here',
  },
  alternates: {
    canonical: 'https://ghostmail.store',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0f1e',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} bg-[#0a0f1e] font-sans text-white antialiased`}>
        <Providers>
          <SchemaMarkup />
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
  );
}
