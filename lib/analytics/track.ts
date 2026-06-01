type Trackable = Window & {
  gtag?: (...args: unknown[]) => void
  fbq?: (...args: unknown[]) => void
}

/** Fire a first-party event + forward to GA4 / Meta Pixel if present. */
export function track(
  eventType: string,
  data?: { course_id?: string; metadata?: Record<string, unknown> },
) {
  if (typeof window === 'undefined') return
  try {
    const params = new URLSearchParams(window.location.search)
    const body = {
      event_type: eventType,
      course_id: data?.course_id,
      page_url: window.location.pathname,
      referrer: document.referrer || null,
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      metadata: data?.metadata ?? {},
    }
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {})

    const w = window as Trackable
    if (w.gtag) w.gtag('event', eventType, data?.metadata || {})
    if (w.fbq) w.fbq('trackCustom', eventType, data?.metadata || {})
  } catch {
    /* never let tracking break the UI */
  }
}
