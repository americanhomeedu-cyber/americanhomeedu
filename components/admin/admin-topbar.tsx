'use client'

import { Menu } from 'lucide-react'
import { CourseSwitcher } from './course-switcher'

export function AdminTopbar({ onBurger }: { onBurger: () => void }) {
  return (
    <header className="topbar">
      <div className="tb-left">
        <button className="tb-burger" onClick={onBurger} aria-label="Меню">
          <Menu size={22} />
        </button>
        <CourseSwitcher />
      </div>
      <div className="tb-right">
        <span className="tb-testmode">
          <span className="d" />
          Test mode
        </span>
      </div>
    </header>
  )
}
