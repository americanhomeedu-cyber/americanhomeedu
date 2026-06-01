'use client'

import * as React from 'react'
import { AdminSidebar } from './admin-sidebar'
import { AdminTopbar } from './admin-topbar'

export function AdminShell({
  adminName,
  adminEmail,
  children,
}: {
  adminName: string
  adminEmail?: string
  children: React.ReactNode
}) {
  const [sbOpen, setSbOpen] = React.useState(false)
  return (
    <div className={`app${sbOpen ? ' sb-open' : ''}`}>
      <div className="sb-scrim" onClick={() => setSbOpen(false)} />
      <AdminSidebar
        adminName={adminName}
        adminEmail={adminEmail}
        onNavigate={() => setSbOpen(false)}
      />
      <div className="main">
        <AdminTopbar onBurger={() => setSbOpen((o) => !o)} />
        <main className="content">{children}</main>
      </div>
    </div>
  )
}
