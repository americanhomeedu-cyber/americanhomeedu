'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import type { Database } from '@/types/database'

type Testimonial = Database['public']['Tables']['testimonials']['Row']

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Testimonials({ items }: { items: Testimonial[] }) {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [index, setIndex] = React.useState(0)
  const [max, setMax] = React.useState(0)
  const [paused, setPaused] = React.useState(false)
  const touchX = React.useRef(0)

  const step = React.useCallback(() => {
    const c = trackRef.current?.querySelector<HTMLElement>('.testi-card')
    return c ? c.offsetWidth + 22 : 0
  }, [])

  const recalc = React.useCallback(() => {
    const t = trackRef.current
    if (!t) return
    const wrap = t.parentElement?.clientWidth ?? 0
    const s = step()
    setMax(s ? Math.max(0, Math.ceil((t.scrollWidth - wrap) / s)) : 0)
  }, [step])

  React.useEffect(() => {
    recalc()
    window.addEventListener('resize', recalc)
    return () => window.removeEventListener('resize', recalc)
  }, [recalc, items.length])

  React.useEffect(() => {
    const t = trackRef.current
    if (t) t.style.transform = `translateX(${-index * step()}px)`
  }, [index, step, max])

  React.useEffect(() => {
    if (paused || max === 0) return
    const id = setInterval(() => setIndex((i) => (i >= max ? 0 : i + 1)), 5000)
    return () => clearInterval(id)
  }, [paused, max])

  if (!items.length) return null

  return (
    <section className="section" id="reviews">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow center">Отзывы</span>
          <h2>Что говорят клиенты Аллы</h2>
        </div>
      </div>
      <div className="wrap">
        <div
          className="testi-track-wrap"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="testi-track"
            ref={trackRef}
            onTouchStart={(e) => {
              touchX.current = e.touches[0].clientX
            }}
            onTouchEnd={(e) => {
              const dx = e.changedTouches[0].clientX - touchX.current
              if (Math.abs(dx) > step() * 0.25)
                setIndex((i) => Math.max(0, Math.min(max, i + (dx < 0 ? 1 : -1))))
            }}
          >
            {items.map((t) => (
              <article className="testi-card" key={t.id}>
                <div className="testi-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={17} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="testi-text">«{t.text}»</p>
                <div className="testi-foot">
                  <span className="testi-ava">{initials(t.name)}</span>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    {t.city && <div className="testi-city">{t.city}</div>}
                  </div>
                  {t.tag && <span className="testi-tag">{t.tag}</span>}
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="testi-nav">
          <button
            className="testi-btn"
            aria-label="Назад"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="testi-btn"
            aria-label="Вперёд"
            onClick={() => setIndex((i) => Math.min(max, i + 1))}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="testi-dots">
          {Array.from({ length: max + 1 }).map((_, i) => (
            <button
              key={i}
              className={i === index ? 'active' : ''}
              aria-label={`Отзыв ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
