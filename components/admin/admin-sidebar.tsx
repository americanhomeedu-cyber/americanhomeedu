'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  Star,
  HelpCircle,
  Users,
  CreditCard,
  Ticket,
  Settings,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useCurrentCourse } from '@/lib/contexts/course-context'

type NavItem = { label: string; icon: LucideIcon; href: string; match: string }
type NavGroup = { group: string; items: NavItem[] }

export function AdminSidebar({
  adminName,
  onNavigate,
}: {
  adminName: string
  onNavigate: () => void
}) {
  const pathname = usePathname()
  const { current, isAll, withCourse } = useCurrentCourse()
  const editorHref = current
    ? `/admin/courses/${current.id}/editor`
    : '/admin/courses'

  const overview: NavGroup = {
    group: 'Обзор',
    items: [
      { label: 'Главная', icon: LayoutDashboard, href: '/admin', match: '/admin' },
      { label: 'Аналитика', icon: TrendingUp, href: '/admin/analytics', match: '/admin/analytics' },
    ],
  }
  const courseGroup: NavGroup = {
    group: 'Курс',
    items: [
      { label: 'Редактор', icon: BookOpen, href: editorHref, match: '/editor' },
      { label: 'Отзывы', icon: Star, href: '/admin/testimonials', match: '/admin/testimonials' },
      { label: 'FAQ', icon: HelpCircle, href: '/admin/faq', match: '/admin/faq' },
    ],
  }
  const common: NavGroup = {
    group: 'Общее',
    items: [
      { label: 'Ученики', icon: Users, href: '/admin/users', match: '/admin/users' },
      { label: 'Заказы', icon: CreditCard, href: '/admin/orders', match: '/admin/orders' },
      { label: 'Промокоды', icon: Ticket, href: '/admin/promo-codes', match: '/admin/promo-codes' },
    ],
  }
  const system: NavGroup = {
    group: 'Система',
    items: [
      { label: 'Курсы', icon: BookOpen, href: '/admin/courses', match: '/admin/courses' },
      { label: 'Настройки', icon: Settings, href: '/admin/settings', match: '/admin/settings' },
    ],
  }
  const groups = isAll
    ? [overview, common, system]
    : [overview, courseGroup, common, system]

  function isActive(match: string) {
    if (match === '/admin') return pathname === '/admin'
    if (match === '/editor') return pathname.includes('/editor')
    if (match === '/admin/courses')
      return pathname.startsWith('/admin/courses') && !pathname.includes('/editor')
    return pathname.startsWith(match)
  }

  const initials =
    adminName
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'А'

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="sb-logo">A</div>
        <div className="sb-brand-text">
          <div className="bt-main">Home Blueprint</div>
          <div className="bt-sub">Admin</div>
        </div>
      </div>
      <nav className="sb-nav">
        {groups.map((g) => (
          <div className="sb-group" key={g.group}>
            <div className="sb-group-label">{g.group}</div>
            {g.items.map((it) => {
              const Icon = it.icon
              return (
                <Link
                  key={it.label}
                  href={withCourse(it.href)}
                  onClick={onNavigate}
                  className={`sb-link${isActive(it.match) ? ' active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{it.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
      <div className="sb-foot">
        <Link href="/" className="sb-tosite">
          <ArrowLeft size={15} />
          Перейти на сайт
        </Link>
        <div className="sb-user">
          <span className="ava s32 alt">{initials}</span>
          <div className="sb-user-info">
            <div className="u-name">{adminName}</div>
            <div className="u-role">Администратор</div>
          </div>
          <ChevronDown size={16} />
        </div>
      </div>
    </aside>
  )
}
