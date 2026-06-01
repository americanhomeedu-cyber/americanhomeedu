import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/admin/page-header'
import { RevenueChart } from '@/components/admin/dashboard/revenue-chart'

export const metadata: Metadata = { title: 'Аналитика — Админка' }

const FUNNEL_COLORS = ['#2D4A3E', '#3C6151', '#C9A96E', '#B8965A']

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { course?: string }
}) {
  const supabase = createClient()
  const { data: courses } = await supabase.from('courses').select('id, is_featured, title')
  const featured = courses?.find((c) => c.is_featured) ?? courses?.[0] ?? null
  const param = searchParams.course
  const isAll = param === 'all'
  const courseId = isAll ? null : param || featured?.id || null
  const courseLabel = isAll
    ? 'Все курсы'
    : (courses?.find((c) => c.id === courseId)?.title ?? 'курс')

  let evQ = supabase.from('analytics_events').select('event_type, utm_source')
  if (courseId) evQ = evQ.eq('course_id', courseId)
  const { data: events } = await evQ
  const count = (t: string) => (events ?? []).filter((e) => e.event_type === t).length

  const funnel = [
    { label: 'Посещения', value: count('page_view') },
    { label: 'Начали регистрацию', value: count('register_start') },
    { label: 'Начали оплату', value: count('checkout_start') },
    { label: 'Покупки', value: count('purchase') },
  ]
  const maxF = Math.max(1, funnel[0].value)

  const sources: Record<string, number> = {}
  ;(events ?? []).forEach((e) => {
    const s = e.utm_source || 'direct'
    sources[s] = (sources[s] || 0) + 1
  })
  const topSources = Object.entries(sources)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
  const sourcesTotal = topSources.reduce((s, [, v]) => s + v, 0) || 1

  let ordersQ = supabase.from('orders').select('amount_cents, created_at').eq('status', 'completed')
  if (courseId) ordersQ = ordersQ.eq('course_id', courseId)
  const { data: orders } = await ordersQ
  const byDay: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10)
    byDay[d] = 0
  }
  ;(orders ?? []).forEach((o) => {
    const d = o.created_at.slice(0, 10)
    if (d in byDay) byDay[d] += o.amount_cents
  })
  const chartData = Object.entries(byDay).map(([date, cents]) => ({
    date,
    value: Math.round(cents / 100),
  }))

  return (
    <>
      <PageHeader title="Аналитика" subtitle={`Источники, воронка и динамика · ${courseLabel}`} />

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-head">
            <h3>Воронка конверсии</h3>
          </div>
          <div className="card-body">
            <div className="funnel">
              {funnel.map((f, i) => {
                const pct = Math.round((f.value / maxF) * 100)
                return (
                  <div className="funnel-row" key={f.label}>
                    <div
                      className="funnel-bar"
                      style={{ width: `${Math.max(pct, 22)}%`, background: FUNNEL_COLORS[i] }}
                    >
                      <span className="fn-label">{f.label}</span>
                      <span className="fn-val">{f.value}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Источники трафика</h3>
          </div>
          <div className="card-body">
            {topSources.length === 0 ? (
              <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>
                Данных пока нет — трекинг подключается на этапе аналитики.
              </div>
            ) : (
              <div className="legend">
                {topSources.map(([name, val], i) => (
                  <div className="lg-row" key={name}>
                    <span
                      className="lg-dot"
                      style={{ background: FUNNEL_COLORS[i % FUNNEL_COLORS.length] }}
                    />
                    <span className="lg-name">{name}</span>
                    <span className="lg-val">
                      {Math.round((val / sourcesTotal) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Выручка за 30 дней</h3>
        </div>
        <div className="card-body">
          <RevenueChart data={chartData} />
        </div>
      </div>
    </>
  )
}
