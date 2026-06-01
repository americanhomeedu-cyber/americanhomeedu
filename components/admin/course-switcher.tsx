'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronDown, Globe, Check, Search, Plus } from 'lucide-react'
import { useCurrentCourse } from '@/lib/contexts/course-context'
import { formatPrice } from '@/lib/utils'

const COLORS = ['#2D4A3E', '#C9A96E', '#3C6151', '#B8965A', '#213A30', '#6B7280']

export function CourseSwitcher() {
  const { courses, current, isAll, courseId, switchCourse } = useCurrentCourse()
  const [open, setOpen] = React.useState(false)
  const [q, setQ] = React.useState('')
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const color = (id: string) => {
    const i = courses.findIndex((c) => c.id === id)
    return COLORS[(i < 0 ? 0 : i) % COLORS.length]
  }
  const label = isAll ? 'Все курсы' : (current?.title ?? 'Курс')
  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="course-switch" onClick={() => setOpen((o) => !o)}>
        {isAll ? (
          <span className="cs-ava" style={{ background: 'var(--beige)', color: 'var(--ink-2)' }}>
            <Globe size={15} />
          </span>
        ) : (
          <span className="cs-ava" style={{ background: color(current?.id ?? '') }}>
            {(current?.title ?? '?')[0]}
          </span>
        )}
        <span className="cs-label">{label}</span>
        <ChevronDown size={15} />
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 60, width: 320 }}>
          <div className="cmdk" style={{ margin: 0, maxWidth: 'none', boxShadow: 'var(--shadow-md)' }}>
            <div className="cmdk-input">
              <Search size={18} />
              <input
                placeholder="Поиск курса..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                autoFocus
              />
            </div>
            <div className="cmdk-list">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  className="cmdk-item"
                  style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
                  onClick={() => {
                    switchCourse(c.id)
                    setOpen(false)
                  }}
                >
                  {c.id === courseId ? (
                    <Check size={16} style={{ color: 'var(--success)' }} />
                  ) : (
                    <span style={{ width: 16 }} />
                  )}
                  <span className="cs-ava" style={{ background: color(c.id), width: 26, height: 26, fontSize: 12 }}>
                    {c.title[0]}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                      {formatPrice(c.price_cents, c.currency)} ·{' '}
                      {c.is_published ? 'published' : 'draft'}
                    </div>
                  </div>
                </button>
              ))}
              <div className="dd-sep" />
              <button
                className="cmdk-item"
                style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
                onClick={() => {
                  switchCourse('all')
                  setOpen(false)
                }}
              >
                {isAll ? (
                  <Check size={16} style={{ color: 'var(--success)' }} />
                ) : (
                  <span style={{ width: 16 }} />
                )}
                <Globe size={16} />
                <span style={{ fontWeight: 600 }}>Все курсы (обзор)</span>
              </button>
              <div className="dd-sep" />
              <Link className="cmdk-item" href="/admin/courses" onClick={() => setOpen(false)}>
                <span style={{ width: 16 }} />
                <Plus size={16} />
                Управление курсами
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
