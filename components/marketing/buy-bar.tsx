'use client'

import * as React from 'react'

export function BuyBar({
  priceLabel,
  oldPriceLabel,
  ctaHref,
}: {
  priceLabel: string
  oldPriceLabel: string | null
  ctaHref: string
}) {
  const [show, setShow] = React.useState(false)
  const [dismissed, setDismissed] = React.useState(false)

  React.useEffect(() => {
    setDismissed(sessionStorage.getItem('buybarDismissed') === '1')
  }, [])

  React.useEffect(() => {
    if (dismissed) return
    const onScroll = () => {
      const past = window.scrollY > window.innerHeight * 0.9
      const pricing = document.getElementById('pricing')
      const atPricing = pricing
        ? pricing.getBoundingClientRect().top < window.innerHeight &&
          pricing.getBoundingClientRect().bottom > 0
        : false
      setShow(past && !atPricing)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [dismissed])

  if (dismissed) return null

  return (
    <div className={`buybar${show ? ' show' : ''}`}>
      <div className="wrap buybar-inner">
        <div className="buybar-text">
          <span className="bb-title">American Home Blueprint</span>
          <span className="bb-sub">Доступ навсегда · гарантия 30 дней</span>
        </div>
        <div className="buybar-price">
          {oldPriceLabel && <span className="bb-old">{oldPriceLabel}</span>}
          <span className="bb-now">{priceLabel}</span>
        </div>
        <a href={ctaHref} className="btn btn-gold">
          Получить доступ
        </a>
        <button
          className="buybar-close"
          aria-label="Закрыть"
          onClick={() => {
            setDismissed(true)
            sessionStorage.setItem('buybarDismissed', '1')
          }}
        >
          ×
        </button>
      </div>
    </div>
  )
}
