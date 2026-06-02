'use client'

import * as React from 'react'
import Script from 'next/script'

/**
 * GA4 + Meta Pixel with Google Consent Mode v2. The tags ALWAYS load (so Google
 * can detect the install and tracking works), but default to `denied` — no
 * analytics/ads cookies fire until the visitor accepts cookies. On accept (or
 * for a returning visitor who already accepted) consent is upgraded to granted.
 */
export function AnalyticsScripts() {
  const ga = process.env.NEXT_PUBLIC_GA_ID
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID

  React.useEffect(() => {
    const grantIfAccepted = () => {
      let accepted = false
      try {
        accepted = localStorage.getItem('ahb_cookie_consent') === 'accepted'
      } catch {
        /* ignore */
      }
      if (!accepted) return
      const w = window as unknown as {
        gtag?: (...a: unknown[]) => void
        fbq?: (...a: unknown[]) => void
      }
      w.gtag?.('consent', 'update', {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      })
      w.fbq?.('consent', 'grant')
    }
    grantIfAccepted()
    window.addEventListener('ahb-consent', grantIfAccepted)
    return () => window.removeEventListener('ahb-consent', grantIfAccepted)
  }, [])

  return (
    <>
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});gtag('js',new Date());gtag('config','${ga}');`}
          </Script>
        </>
      )}
      {pixel && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('consent','revoke');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  )
}
