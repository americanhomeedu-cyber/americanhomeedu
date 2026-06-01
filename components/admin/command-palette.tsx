'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  Users,
  CreditCard,
  Ticket,
  Star,
  HelpCircle,
  Settings,
  UserPlus,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Target = { label: string; href: string; icon: LucideIcon }

const TARGETS: Target[] = [
  { label: 'Главная', href: '/admin', icon: LayoutDashboard },
  { label: 'Аналитика', href: '/admin/analytics', icon: TrendingUp },
  { label: 'Курсы', href: '/admin/courses', icon: BookOpen },
  { label: 'Ученики', href: '/admin/users', icon: Users },
  { label: 'Заказы', href: '/admin/orders', icon: CreditCard },
  { label: 'Промокоды', href: '/admin/promo-codes', icon: Ticket },
  { label: 'Отзывы', href: '/admin/testimonials', icon: Star },
  { label: 'FAQ', href: '/admin/faq', icon: HelpCircle },
  { label: 'Настройки', href: '/admin/settings', icon: Settings },
  { label: 'Добавить ученика', href: '/admin/users', icon: UserPlus },
]

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const [q, setQ] = React.useState('')
  const [active, setActive] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const filtered = TARGETS.filter((t) => t.label.toLowerCase().includes(q.toLowerCase()))

  React.useEffect(() => {
    if (open) {
      setQ('')
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  if (!open) return null

  function go(href: string) {
    router.push(href)
    onClose()
  }

  return (
    <div className="overlay show" onClick={onClose}>
      <div className="cmdk" onClick={(e) => e.stopPropagation()}>
        <div className="cmdk-input">
          <Search size={18} />
          <input
            ref={inputRef}
            placeholder="Перейти к… или выполнить действие"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setActive(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActive((a) => Math.min(a + 1, filtered.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActive((a) => Math.max(a - 1, 0))
              } else if (e.key === 'Enter' && filtered[active]) {
                go(filtered[active].href)
              } else if (e.key === 'Escape') {
                onClose()
              }
            }}
          />
        </div>
        <div className="cmdk-list">
          {filtered.length === 0 ? (
            <div style={{ padding: 16, color: 'var(--ink-3)', fontSize: 13 }}>Ничего не найдено</div>
          ) : (
            filtered.map((t, i) => {
              const Icon = t.icon
              return (
                <div
                  key={t.label}
                  className={`cmdk-item${i === active ? ' active' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(t.href)}
                >
                  <Icon size={16} />
                  {t.label}
                  <span className="ci-hint">↵</span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
