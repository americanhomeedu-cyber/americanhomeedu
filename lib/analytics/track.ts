type Trackable = Window & {
  gtag?: (...args: unknown[]) => void
  fbq?: (...args: unknown[]) => void
}

/** Stable per-browser id so analytics can count unique visitors / sessions. */
function getSessionId(): string {
  try {
    const KEY = 'ahb_sid'
    let sid = localStorage.getItem(KEY)
    if (!sid) {
      sid =
        (typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36))
      localStorage.setItem(KEY, sid)
    }
    return sid
  } catch {
    return 'anon'
  }
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
      session_id: getSessionId(),
      metadata: data?.metadata ?? {},
    }
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {})

    // Only forward to third parties (Google / Meta) after cookie consent.
    let consented = false
    try {
      consented = localStorage.getItem('ahb_cookie_consent') === 'accepted'
    } catch {
      /* ignore */
    }
    if (consented) {
      const w = window as Trackable
      if (w.gtag) w.gtag('event', eventType, data?.metadata || {})
      if (w.fbq) w.fbq('trackCustom', eventType, data?.metadata || {})
    }
  } catch {
    /* never let tracking break the UI */
  }
}
