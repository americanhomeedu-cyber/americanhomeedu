'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, Star } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CourseSettingsForm } from '@/components/admin/courses/course-settings-form'
import { RevenueChart } from '@/components/admin/dashboard/revenue-chart'
import { StatCard } from '@/components/admin/stat-card'
import { formatPrice } from '@/lib/utils'
import type { Database } from '@/types/database'

type Course = Database['public']['Tables']['courses']['Row']
type Section = {
  id: string
  title: string
  position: number
  is_published: boolean
  estimated_minutes: number | null
}
type Student = {
  userId: string
  name: string | null
  email: string
  granted_at: string
  source: string
}
type Testimonial = {
  id: string
  name: string
  city: string | null
  rating: number
  text: string
  is_published: boolean
}
type Faq = { id: string; question: string; is_published: boolean }
type Order = {
  id: string
  amount_cents: number
  currency: string
  status: string
  created_at: string
  customer_name: string | null
  customer_email: string
}

const TABS = [
  ['settings', 'Настройки'],
  ['content', 'Контент'],
  ['students', 'Ученики'],
  ['testimonials', 'Отзывы'],
  ['faq', 'FAQ'],
  ['analytics', 'Аналитика'],
  ['orders', 'Заказы'],
] as const
type TabKey = (typeof TABS)[number][0]

const STATUS: Record<string, { cls: string; label: string }> = {
  completed: { cls: 'green', label: 'Оплачен' },
  pending: { cls: 'amber', label: 'Ожидает' },
  failed: { cls: 'red', label: 'Ошибка' },
  refunded: { cls: 'gray', label: 'Возврат' },
}

export function CourseDetail({
  course,
  color,
  sections,
  students,
  testimonials,
  faqs,
  orders,
}: {
  course: Course
  color: string
  sections: Section[]
  students: Student[]
  testimonials: Testimonial[]
  faqs: Faq[]
  orders: Order[]
}) {
  const router = useRouter()
  const [tab, setTab] = React.useState<TabKey>('settings')

  const completed = orders.filter((o) => o.status === 'completed')
  const revenue = completed.reduce((s, o) => s + o.amount_cents, 0)
  const avgCheck = completed.length ? Math.round(revenue / completed.length) : 0
  const publishedSections = sections.filter((s) => s.is_published).length

  // 30-day revenue series for the analytics tab
  const series: { date: string; value: number }[] = []
  const byDay: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) byDay[new Date(Date.now() - i * 864e5).toISOString().slice(0, 10)] = 0
  completed.forEach((o) => {
    const d = o.created_at.slice(0, 10)
    if (d in byDay) byDay[d] += o.amount_cents
  })
  Object.entries(byDay).forEach(([date, cents]) => series.push({ date, value: Math.round(cents / 100) }))

  return (
    <>
      <Link
        href="/admin/courses"
        className="row"
        style={{ gap: 6, color: 'var(--ink-2)', fontSize: 13, marginBottom: 16 }}
      >
        <ArrowLeft size={15} />
        Все курсы
      </Link>

      <div className="page-head">
        <div className="row" style={{ gap: 16 }}>
          <span
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: color,
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
              fontSize: 22,
              fontFamily: 'var(--serif)',
              flex: 'none',
            }}
          >
            {course.title[0]}
          </span>
          <div>
            <h1 style={{ fontSize: 26 }}>{course.title}</h1>
            <div className="row" style={{ gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-3)' }}>
                /{course.slug}
              </span>
              <span className={`badge ${course.is_published ? 'green' : 'gray'}`}>
                <span className="bd-dot" />
                {course.is_published ? 'Published' : 'Draft'}
              </span>
              {course.is_featured && <span className="badge gold">★ Featured</span>}
            </div>
          </div>
        </div>
        <div className="ph-actions">
          <Link className="btn btn-outline" href={`/admin/courses/${course.id}/editor`}>
            <BookOpen size={16} />
            Редактор
          </Link>
        </div>
      </div>

      <div className="tabs">
        {TABS.map(([k, l]) => (
          <button key={k} className={`tab${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'settings' && <CourseSettingsForm course={course} embedded />}

      {tab === 'content' && (
        <div className="card">
          <div className="card-head">
            <h3>{sections.length} секций</h3>
            <Link className="btn btn-primary btn-sm" href={`/admin/courses/${course.id}/editor`}>
              <BookOpen size={15} />
              Открыть редактор
            </Link>
          </div>
          <div className="card-body" style={{ padding: sections.length ? 0 : 20 }}>
            {sections.length === 0 ? (
              <div className="empty" style={{ padding: '40px 24px' }}>
                <div className="em-ic">
                  <BookOpen size={28} />
                </div>
                <h3>Пока нет секций</h3>
                <p>Добавьте содержимое курса в редакторе.</p>
              </div>
            ) : (
              <table className="tbl">
                <tbody>
                  {sections.map((s, i) => (
                    <tr key={s.id}>
                      <td style={{ width: 50, fontFamily: 'var(--serif)', fontWeight: 700, color: '#9A7B3F' }}>
                        {String(i + 1).padStart(2, '0')}
                      </td>
                      <td style={{ fontWeight: 600 }}>{s.title}</td>
                      <td className="cell-muted">{s.estimated_minutes ? `${s.estimated_minutes} мин` : '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`badge ${s.is_published ? 'green' : 'gray'}`}>
                          {s.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'students' && (
        <div className="table-wrap">
          <div className="toolbar">
            <strong style={{ fontSize: 13 }}>{students.length} учеников записаны на курс</strong>
            <Link className="btn btn-outline btn-sm" href="/admin/users" style={{ marginLeft: 'auto' }}>
              Управление учениками →
            </Link>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Ученик</th>
                <th>Записан</th>
                <th>Источник</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', color: 'var(--ink-3)', padding: 32 }}>
                    Нет учеников
                  </td>
                </tr>
              ) : (
                students.slice(0, 50).map((s) => (
                  <tr
                    key={s.userId}
                    className="clickable"
                    onClick={() => router.push(`/admin/users/${s.userId}`)}
                  >
                    <td>
                      <div className="cell-user">
                        <span className="ava s32">{(s.name || s.email)[0].toUpperCase()}</span>
                        <div>
                          <div className="cu-name">{s.name || '—'}</div>
                          <div className="cu-sub">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="cell-muted">{format(new Date(s.granted_at), 'd MMM yyyy', { locale: ru })}</td>
                    <td>
                      <span className={`badge ${s.source === 'purchase' ? 'green' : 'gray'}`}>
                        {s.source === 'purchase' ? 'Покупка' : 'Вручную'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'testimonials' && (
        <>
          <div className="grid-3">
            {testimonials.length === 0 ? (
              <div className="empty" style={{ gridColumn: '1 / -1' }}>
                <div className="em-ic">
                  <Star size={28} />
                </div>
                <h3>Нет отзывов</h3>
                <p>Добавьте отзывы для этого курса.</p>
              </div>
            ) : (
              testimonials.map((t) => (
                <div className="card card-pad" key={t.id}>
                  <div className="between" style={{ marginBottom: 8 }}>
                    <div className="cell-user">
                      <span className="ava s40 alt">{t.name[0]}</span>
                      <div>
                        <div className="cu-name">{t.name}</div>
                        <div className="cu-sub">{t.city || ''}</div>
                      </div>
                    </div>
                    <span className={`badge ${t.is_published ? 'green' : 'gray'}`}>
                      {t.is_published ? 'Опубликован' : 'Черновик'}
                    </span>
                  </div>
                  <div className="row" style={{ gap: 2, marginBottom: 8 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        style={{ color: i < t.rating ? '#C9A96E' : 'var(--border)' }}
                        fill={i < t.rating ? '#C9A96E' : 'none'}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                    {t.text.length > 120 ? t.text.slice(0, 120) + '…' : t.text}
                  </p>
                </div>
              ))
            )}
          </div>
          <Link className="btn btn-outline mt-4" href="/admin/testimonials">
            Управление отзывами курса →
          </Link>
        </>
      )}

      {tab === 'faq' && (
        <>
          <div style={{ display: 'grid', gap: 10, maxWidth: 820 }}>
            {faqs.length === 0 ? (
              <div className="empty">
                <div className="em-ic">
                  <Star size={28} />
                </div>
                <h3>Нет вопросов</h3>
                <p>Добавьте FAQ для этого курса.</p>
              </div>
            ) : (
              faqs.map((f, i) => (
                <div className="card card-pad" key={f.id}>
                  <div className="between">
                    <div className="row" style={{ gap: 12 }}>
                      <span style={{ fontFamily: 'var(--serif)', fontWeight: 700, color: '#9A7B3F' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span style={{ fontWeight: 600 }}>{f.question}</span>
                    </div>
                    <span className={`badge ${f.is_published ? 'green' : 'gray'}`}>
                      {f.is_published ? 'Опубликован' : 'Черновик'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link className="btn btn-outline mt-4" href="/admin/faq">
            Управление FAQ курса →
          </Link>
        </>
      )}

      {tab === 'analytics' && (
        <>
          <div className="stat-grid" style={{ marginBottom: 24 }}>
            <StatCard
              label="Выручка курса"
              value={formatPrice(revenue, course.currency)}
              iconBg="var(--accent-soft)"
              iconColor="#9A7B3F"
            />
            <StatCard label="Учеников" value={students.length} />
            <StatCard label="Опубликовано секций" value={`${publishedSections} / ${sections.length}`} />
            <StatCard label="Средний чек" value={formatPrice(avgCheck, course.currency)} />
          </div>
          <div className="card">
            <div className="card-head">
              <h3>Выручка курса</h3>
              <span className="ch-sub">за 30 дней</span>
            </div>
            <div className="card-body">
              <RevenueChart data={series} />
            </div>
          </div>
        </>
      )}

      {tab === 'orders' && (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--ink-3)', padding: 32 }}>
                    Заказов нет
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const st = STATUS[o.status] ?? { cls: 'gray', label: o.status }
                  return (
                    <tr key={o.id}>
                      <td>
                        <div className="cell-user">
                          <span className="ava s32">{(o.customer_name || o.customer_email)[0].toUpperCase()}</span>
                          <div>
                            <div className="cu-name">{o.customer_name || '—'}</div>
                            <div className="cu-sub">{o.customer_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="cell-strong">{formatPrice(o.amount_cents, o.currency)}</td>
                      <td>
                        <span className={`badge ${st.cls}`}>
                          <span className="bd-dot" />
                          {st.label}
                        </span>
                      </td>
                      <td className="cell-muted">{format(new Date(o.created_at), 'd MMM yyyy', { locale: ru })}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
