'use client'

import * as React from 'react'
import Link from 'next/link'

const LINKS = [
  ['about-course', 'О курсе'],
  ['program', 'Программа'],
  ['author', 'Об авторе'],
  ['reviews', 'Отзывы'],
  ['faq', 'FAQ'],
] as const

export function SiteNav() {
  const [scrolled, setScrolled] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [active, setActive] = React.useState('')

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  React.useEffect(() => {
    const sections = LINKS.map(([id]) => document.getElementById(id)).filter(
      Boolean,
    ) as HTMLElement[]
    if (!sections.length) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  React.useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="wrap nav-inner">
          <Link href="/" className="brand">
            <span className="b-main">American Home Blueprint</span>
            <span className="b-sub">with Alla</span>
          </Link>
          <div className="nav-links">
            {LINKS.map(([id, label]) => (
              <Link key={id} href={`/#${id}`} className={active === id ? 'active' : ''}>
                {label}
              </Link>
            ))}
          </div>
          <div className="nav-cta">
            <Link href="/login" className="btn btn-ghost">
              Войти
            </Link>
            <Link href="/#pricing" className="btn btn-gold">
              Купить курс
            </Link>
            <button
              className={`burger${menuOpen ? ' open' : ''}`}
              aria-label="Меню"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {LINKS.map(([id, label]) => (
          <Link key={id} href={`/#${id}`} onClick={() => setMenuOpen(false)}>
            {label}
          </Link>
        ))}
        <div className="mm-cta">
          <Link href="/login" className="btn btn-outline" onClick={() => setMenuOpen(false)}>
            Войти
          </Link>
          <Link href="/#pricing" className="btn btn-gold" onClick={() => setMenuOpen(false)}>
            Купить курс
          </Link>
        </div>
      </div>
    </>
  )
}
