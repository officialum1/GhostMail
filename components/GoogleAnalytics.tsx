'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

const measurementId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-0TQ5RRS797'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const trackedPath = useRef<string | null>(null)

  useEffect(() => {
    if (!measurementId || typeof window === 'undefined') return

    const pagePath = `${pathname}${window.location.search}`
    if (trackedPath.current === null) {
      trackedPath.current = pagePath
      return
    }

    if (trackedPath.current !== pagePath && window.gtag) {
      window.gtag('config', measurementId, {
        page_path: pagePath,
      })
      trackedPath.current = pagePath
    }
  }, [pathname])

  if (!measurementId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname + window.location.search,
          });
        `}
      </Script>
    </>
  )
}
