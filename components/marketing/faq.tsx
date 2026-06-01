'use client'

import * as React from 'react'
import type { Database } from '@/types/database'

type FaqItem = Database['public']['Tables']['faq_items']['Row']

export function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = React.useState<number | null>(null)
  if (!items.length) return null

  return (
    <section className="section" id="faq" style={{ background: 'var(--cream-deep)' }}>
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow center">FAQ</span>
          <h2>Частые вопросы</h2>
        </div>
        <div className="faq-list">
          {items.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={f.id} className={`faq-item${isOpen ? ' open' : ''}`}>
                <div className="faq-q" onClick={() => setOpen(isOpen ? null : i)}>
                  <span className="fq-icon" />
                  <span>{f.question}</span>
                </div>
                <div className="faq-a" style={{ maxHeight: isOpen ? 500 : 0 }}>
                  <div className="faq-a-inner">{f.answer}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
