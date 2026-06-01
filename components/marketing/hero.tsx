'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, Star } from 'lucide-react'

const POINTS = [
  'Полный путь от подготовки до получения ключей',
  'Все нюансы mortgage, inspection и closing',
  'Объяснения от практикующего эксперта в США',
]

export function Hero({
  priceLabel,
  ctaHref,
}: {
  priceLabel: string
  ctaHref: string
}) {
  const visualRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const vis = visualRef.current
    if (!vis || !window.matchMedia('(pointer:fine)').matches) return
    const photo = vis.querySelector<HTMLElement>('.hero-photo')
    const top = vis.querySelector<HTMLElement>('.float-card.top')
    const bottom = vis.querySelector<HTMLElement>('.float-card.bottom')
    if (photo) photo.style.transition = 'transform .4s ease'
    const onMove = (e: MouseEvent) => {
      const r = vis.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      if (photo)
        photo.style.transform = `perspective(900px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg)`
      if (top) top.style.transform = `translate(${px * 18}px, ${py * 18}px)`
      if (bottom) bottom.style.transform = `translate(${px * -18}px, ${py * -14}px)`
    }
    const onLeave = () => {
      if (photo) photo.style.transform = ''
      if (top) top.style.transform = ''
      if (bottom) bottom.style.transform = ''
    }
    vis.addEventListener('mousemove', onMove)
    vis.addEventListener('mouseleave', onLeave)
    return () => {
      vis.removeEventListener('mousemove', onMove)
      vis.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <header className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <span className="hero-badge reveal">🏡 Курс для русскоязычных в США</span>
          <h1 className="reveal d1">
            Купите свой первый дом в Америке — <span className="hl">без страха и ошибок</span>
          </h1>
          <p className="hero-sub reveal d2">
            Пошаговая система от лицензированного риелтора с 14-летним опытом. На
            понятном русском языке.
          </p>
          <ul className="hero-list reveal d2">
            {POINTS.map((t) => (
              <li key={t}>
                <span className="check">
                  <Check size={13} strokeWidth={3} />
                </span>{' '}
                {t}
              </li>
            ))}
          </ul>
          <div className="hero-actions reveal d3">
            <Link href={ctaHref} className="btn btn-gold btn-lg">
              Получить доступ — {priceLabel}
            </Link>
            <Link href="/#program" className="btn btn-outline btn-lg">
              Смотреть программу
            </Link>
          </div>
          <p className="hero-note reveal d3">
            💳 Безопасная оплата через Stripe • Мгновенный доступ
          </p>
        </div>

        <div className="hero-visual reveal d2" ref={visualRef}>
          <div className="hero-photo">
            <Image
              src="/images/alla-portrait.jpg"
              alt="Алла Ризаева — лицензированный риелтор"
              fill
              sizes="(max-width: 980px) 100vw, 40vw"
              style={{ objectFit: 'cover', objectPosition: 'center 22%' }}
              priority
            />
          </div>
          <div className="float-card top">
            <span className="fc-num">14+</span>
            <span className="fc-label">лет опыта в недвижимости</span>
          </div>
          <div className="float-card bottom">
            <div className="fc-row">
              <span className="fc-seal">
                <Star size={19} />
              </span>
              <div>
                <div className="fc-title">Licensed Real Estate Agent · NC</div>
                <div className="fc-sub">Keller Williams Ballantyne</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
