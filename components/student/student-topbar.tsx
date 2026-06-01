'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Book, ChevronDown, Settings, Globe, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '•'
  )
}

export function StudentTopbar({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])

  React.useEffect(() => {
    if (!open) return
    const h = () => setOpen(false)
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [open])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="s-topbar">
      <div className="wrap">
        <Link className="s-logo" href="/dashboard">
          <span className="l-main">American Home Blueprint</span>
          <span className="l-sub">with Alla</span>
        </Link>
        <div className="s-nav">
          <Link className="s-navlink" href="/dashboard">
            <Book size={17} />
            <span>Мои курсы</span>
          </Link>
          <div className={`u-menu${open ? ' open' : ''}`}>
            <button
              className="u-trigger"
              onClick={(e) => {
                e.stopPropagation()
                setOpen((o) => !o)
              }}
            >
              <span className="avatar s32">{initials(name)}</span>
              <ChevronDown size={15} />
            </button>
            <div className="u-pop">
              <div className="up-head">
                <div className="n">{name}</div>
                <div className="e">{email}</div>
              </div>
              <Link className="up-item" href="/profile">
                <Settings size={16} />
                Настройки профиля
              </Link>
              <Link className="up-item" href="/">
                <Globe size={16} />
                Вернуться на сайт
              </Link>
              <div className="up-sep" />
              <button className="up-item danger" onClick={logout}>
                <LogOut size={16} />
                Выйти
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
