import type { ReactNode } from 'react'

export function LegalPage({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 820 }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: 20 }}>
          {title}
        </h1>
        <div style={{ color: 'var(--ink-soft)', fontSize: 17, lineHeight: 1.7 }}>
          {children}
        </div>
        <p style={{ marginTop: 28, fontSize: 14, color: 'var(--ink-mute)' }}>
          Последнее обновление: июнь 2026.
        </p>
      </div>
    </section>
  )
}
