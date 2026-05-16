import type { Metadata } from "next";
import localFont from "next/font/local";
import SchemaMarkup from "@/components/SchemaMarkup";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "GhostMail — Free Custom Email Address",
    template: "%s | GhostMail"
  },
  description: "Get your own custom email address instantly. Perfect for receiving OTPs, sign-ups, and protecting your real inbox. Free forever.",
  keywords: ["temporary email", "custom email", "OTP email", "disposable email", "free email address", "receive OTP", "email inbox"],
  authors: [{ name: "GhostMail" }],
  creator: "GhostMail",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXTAUTH_URL,
    siteName: "GhostMail",
    title: "GhostMail — Free Custom Email Address",
    description: "Get your own custom email address instantly. Free forever.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GhostMail — Free Custom Email Address",
    description: "Get your own custom email address instantly. Free forever.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    }
  },
  alternates: {
    canonical: process.env.NEXTAUTH_URL
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SchemaMarkup />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
