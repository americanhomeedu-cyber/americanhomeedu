'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  User,
  Home,
  LogOut,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useCurrentCourse } from '@/lib/contexts/course-context'
import { createClient } from '@/lib/supabase/client'

type NavItem = { label: string; icon: LucideIcon; href: string; match: string }
type NavGroup = { group: string; items: NavItem[] }

export function AdminSidebar({
  adminName,
  adminEmail,
  onNavigate,
}: {
  adminName: string
  adminEmail?: string
  onNavigate: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])
  const { current, isAll, withCourse } = useCurrentCourse()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  const editorHref = current
    ? `/admin/courses/${current.id}/editor`
    : '/admin/courses'

  React.useEffect(() => {
    if (!menuOpen) return
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  async function logout() {
    setMenuOpen(false)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

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

  // full_name may equal the email (admins created via Supabase dashboard have
  // no full_name) — show the part before @ so it fits; full email lives in the menu.
  const displayName = adminName.includes('@')
    ? adminName.split('@')[0]
    : adminName
  const initials =
    displayName
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
        <div
          className={`dd up sb-user-dd${menuOpen ? ' open' : ''}`}
          ref={menuRef}
        >
          <button
            type="button"
            className="sb-user"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="ava s32 alt">{initials}</span>
            <div className="sb-user-info">
              <div className="u-name">{displayName}</div>
              <div className="u-role">Администратор</div>
            </div>
            <ChevronDown size={16} />
          </button>
          <div className="dd-menu" role="menu">
            {adminEmail && <div className="dd-label email">{adminEmail}</div>}
            <Link className="dd-item" href="/profile" onClick={onNavigate}>
              <User size={15} />
              Профиль
            </Link>
            <Link className="dd-item" href="/" onClick={onNavigate}>
              <Home size={15} />
              На сайт
            </Link>
            <div className="dd-sep" />
            <button type="button" className="dd-item danger" onClick={logout}>
              <LogOut size={15} />
              Выйти
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
