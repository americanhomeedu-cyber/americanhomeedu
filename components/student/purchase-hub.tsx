'use client'

import * as React from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { track } from '@/lib/analytics/track'
import type { Database } from '@/types/database'

type Course = Database['public']['Tables']['courses']['Row']

/** The single purchase entry point — shown on /dashboard when no enrollment. */
export function PurchaseHub({ course, name }: { course: Course; name: string }) {
  const [loading, setLoading] = React.useState(false)

  async function buy() {
    setLoading(true)
    track('checkout_start', { course_id: course.id })
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id }),
      })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
        return
      }
      toast.error(data.error || 'Не удалось начать оплату')
    } catch {
      toast.error('Ошибка сети, попробуйте ещё раз')
    }
    setLoading(false)
  }

  return (
    <main className="s-main">
      <div className="greet fade-in" style={{ marginBottom: 28 }}>
        <h1>Здравствуйте, {name.split(' ')[0]}!</h1>
        <p>Откройте доступ к курсу и начните путь к собственному дому.</p>
      </div>
      <div className="course-feature">
        <div className="cf-cover">
          <span className="cf-badge">
            <span className="badge gold">Доступно к покупке</span>
          </span>
          <Image
            src={course.cover_image_url || '/images/alla-guide.png'}
            alt=""
            fill
            sizes="340px"
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="cf-body">
          <h2>{course.title}</h2>
          <p className="cf-sub">{course.subtitle}</p>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 12,
              margin: '6px 0 22px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 42,
                fontWeight: 700,
                color: 'var(--green)',
                lineHeight: 1,
              }}
            >
              {formatPrice(course.price_cents, course.currency)}
            </span>
            {course.old_price_cents && (
              <span style={{ color: 'var(--ink-3)', textDecoration: 'line-through' }}>
                {formatPrice(course.old_price_cents, course.currency)}
              </span>
            )}
          </div>
          <div className="cf-actions">
            <Button variant="gold" size="lg" onClick={buy} disabled={loading}>
              {loading ? 'Переходим к оплате…' : 'Купить курс'}
            </Button>
            <span className="cf-note">
              <ShieldCheck size={15} />
              30-дневная гарантия возврата · доступ навсегда
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}
