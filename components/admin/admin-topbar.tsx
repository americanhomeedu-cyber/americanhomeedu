'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, Bell, AlertCircle, Star, BookOpen, ChevronRight } from 'lucide-react'
import { CourseSwitcher } from './course-switcher'
import { CommandPalette } from './command-palette'
import { Sheet } from './sheet'

export type Notif = { pendingOrders: number; draftReviews: number; draftSections: number }

const LABELS: Record<string, string> = {
  admin: 'Главная',
  analytics: 'Аналитика',
  courses: 'Курсы',
  users: 'Ученики',
  orders: 'Заказы',
  'promo-codes': 'Промокоды',
  testimonials: 'Отзывы',
  faq: 'FAQ',
  settings: 'Настройки',
  editor: 'Редактор',
  new: 'Новый',
}

function useCrumbs() {
  const pathname = usePathname()
  const parts = pathname.split('/').filter(Boolean) // ['admin', ...]
  const crumbs: { label: string; href: string }[] = []
  let acc = ''
  parts.forEach((seg) => {
    acc += `/${seg}`
    const isId = seg.length >= 20 || /^[0-9a-f-]{30,}$/.test(seg)
    const label = isId ? 'Детали' : LABELS[seg] || seg
    crumbs.push({ label, href: acc })
  })
  return crumbs
}

export function AdminTopbar({ onBurger, notif }: { onBurger: () => void; notif: Notif }) {
  const crumbs = useCrumbs()
  const [cmdkOpen, setCmdkOpen] = React.useState(false)
  const [bellOpen, setBellOpen] = React.useState(false)
  const total = notif.pendingOrders + notif.draftReviews + notif.draftSections

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCmdkOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const items = [
    notif.pendingOrders > 0 && {
      icon: AlertCircle,
      title: `${notif.pendingOrders} ${notif.pendingOrders === 1 ? 'заказ ожидает' : 'заказов ожидают'} обработки`,
      href: '/admin/orders',
    },
    notif.draftReviews > 0 && {
      icon: Star,
      title: `${notif.draftReviews} ${notif.draftReviews === 1 ? 'отзыв' : 'отзывов'} на модерации`,
      href: '/admin/testimonials',
    },
    notif.draftSections > 0 && {
      icon: BookOpen,
      title: `${notif.draftSections} ${notif.draftSections === 1 ? 'секция курса' : 'секций курса'} в черновике`,
      href: '/admin/courses',
    },
  ].filter(Boolean) as { icon: typeof Star; title: string; href: string }[]

  return (
    <header className="topbar">
      <div className="tb-left">
        <button className="tb-burger" onClick={onBurger} aria-label="Меню">
          <Menu size={22} />
        </button>
        <CourseSwitcher />
        <nav className="crumbs">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1
            return (
              <React.Fragment key={c.href}>
                {last ? (
                  <span className="current">{c.label}</span>
                ) : (
                  <Link href={c.href}>{c.label}</Link>
                )}
                {!last && <span className="sep">/</span>}
              </React.Fragment>
            )
          })}
        </nav>
      </div>
      <div className="tb-right">
        <button className="tb-search" onClick={() => setCmdkOpen(true)}>
          <Search size={15} />
          <span>Поиск…</span>
          <span className="kbd">⌘K</span>
        </button>
        <span className="tb-testmode">
          <span className="d" />
          Test mode
        </span>
        <button className="tb-icon-btn" onClick={() => setBellOpen(true)} aria-label="Уведомления">
          <Bell size={17} />
          {total > 0 && <span className="tb-dot" />}
        </button>
      </div>

      <CommandPalette open={cmdkOpen} onClose={() => setCmdkOpen(false)} />

      <Sheet open={bellOpen} onClose={() => setBellOpen(false)} title="Уведомления">
        {items.length === 0 ? (
          <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>Нет новых уведомлений 🎉</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {items.map((it, i) => {
              const Icon = it.icon
              return (
                <Link
                  key={i}
                  href={it.href}
                  onClick={() => setBellOpen(false)}
                  className="card card-pad row"
                  style={{ gap: 12, justifyContent: 'space-between' }}
                >
                  <span className="row" style={{ gap: 10 }}>
                    <Icon size={17} style={{ color: '#9A7B3F' }} />
                    <span style={{ fontSize: 13.5 }}>{it.title}</span>
                  </span>
                  <ChevronRight size={16} style={{ color: 'var(--ink-3)' }} />
                </Link>
              )
            })}
          </div>
        )}
      </Sheet>
    </header>
  )
}
