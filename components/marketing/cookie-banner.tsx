'use client'

import * as React from 'react'
import Link from 'next/link'

const KEY = 'ahb_cookie_consent'

export function CookieBanner({ enabled, text }: { enabled: boolean; text: string }) {
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    if (!enabled) return
    try {
      if (!localStorage.getItem(KEY)) setShow(true)
    } catch {
      /* storage blocked — don't show */
    }
  }, [enabled])

  function decide(value: 'accepted' | 'declined') {
    try {
      localStorage.setItem(KEY, value)
    } catch {
      /* ignore */
    }
    // Let the analytics scripts mount immediately on accept.
    try {
      window.dispatchEvent(new Event('ahb-consent'))
    } catch {
      /* ignore */
    }
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      role="dialog"
      aria-label="Согласие на использование cookie"
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 400,
        maxWidth: 600,
        margin: '0 auto',
        background: '#fff',
        border: '1px solid var(--line, #E4DDD0)',
        borderRadius: 16,
        boxShadow: '0 24px 50px -16px rgba(26,26,26,.28)',
        padding: '18px 20px',
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: 220, fontSize: 14, color: 'var(--ink-soft, #5b5b52)', lineHeight: 1.55 }}>
        {text || 'Мы используем cookie для корректной работы сайта и аналитики.'}{' '}
        <Link href="/cookies" style={{ color: 'var(--green, #2D4A3E)', textDecoration: 'underline' }}>
          Подробнее
        </Link>
      </div>
      <div style={{ display: 'flex', gap: 10, flex: 'none' }}>
        <button
          onClick={() => decide('declined')}
          style={{
            border: '1px solid var(--line, #E4DDD0)',
            background: '#fff',
            color: 'var(--ink, #1a1a1a)',
            borderRadius: 10,
            padding: '10px 16px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Только необходимые
        </button>
        <button
          onClick={() => decide('accepted')}
          style={{
            border: 'none',
            background: 'var(--green, #2D4A3E)',
            color: '#fff',
            borderRadius: 10,
            padding: '10px 18px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Принять
        </button>
      </div>
    </div>
  )
}
