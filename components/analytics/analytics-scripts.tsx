'use client'

import * as React from 'react'
import Script from 'next/script'

/**
 * GA4 + Meta Pixel — loaded ONLY after the visitor accepts cookies (consent
 * stored by the cookie banner). Re-checks on the `ahb-consent` event so they
 * mount immediately when the user clicks «Принять».
 */
export function AnalyticsScripts() {
  const ga = process.env.NEXT_PUBLIC_GA_ID
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const [consented, setConsented] = React.useState(false)

  React.useEffect(() => {
    const check = () => {
      try {
        setConsented(localStorage.getItem('ahb_cookie_consent') === 'accepted')
      } catch {
        setConsented(false)
      }
    }
    check()
    window.addEventListener('ahb-consent', check)
    window.addEventListener('storage', check)
    return () => {
      window.removeEventListener('ahb-consent', check)
      window.removeEventListener('storage', check)
    }
  }, [])

  if (!consented) return null

  return (
    <>
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
          </Script>
        </>
      )}
      {pixel && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  )
}
