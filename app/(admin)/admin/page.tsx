import type { Metadata } from 'next'
import { CreditCard, Users, UserPlus, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/admin/page-header'
import { StatCard } from '@/components/admin/stat-card'
import { RevenueChart } from '@/components/admin/dashboard/revenue-chart'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Главная — Админка' }

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: { course?: string }
}) {
  const supabase = createClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, currency, is_featured')
  const featured = courses?.find((c) => c.is_featured) ?? courses?.[0] ?? null
  const param = searchParams.course
  const isAll = param === 'all'
  const courseId = isAll ? null : param || featured?.id || null
  const currency =
    (courseId ? courses?.find((c) => c.id === courseId)?.currency : featured?.currency) ||
    'usd'
  const courseLabel = isAll
    ? 'Все курсы'
    : (courses?.find((c) => c.id === courseId)?.title ?? 'курс')

  let ordersQ = supabase
    .from('orders')
    .select('amount_cents, created_at, customer_name, customer_email')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
  if (courseId) ordersQ = ordersQ.eq('course_id', courseId)
  const { data: orders } = await ordersQ

  let enrQ = supabase
    .from('course_enrollments')
    .select('id, granted_at')
    .is('revoked_at', null)
  if (courseId) enrQ = enrQ.eq('course_id', courseId)
  const { data: enr } = await enrQ

  const revenue = (orders ?? []).reduce((s, o) => s + o.amount_cents, 0)
  const students = enr?.length ?? 0
  const monthAgo = new Date(Date.now() - 30 * 864e5).toISOString()
  const newStudents = (enr ?? []).filter((e) => e.granted_at > monthAgo).length
  const ordersCount = orders?.length ?? 0

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
  const recent = (orders ?? []).slice(0, 6)

  return (
    <>
      <PageHeader title="Главная" subtitle={`Обзор · ${courseLabel}`} />
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard
          label="Выручка"
          value={formatPrice(revenue, currency)}
          icon={CreditCard}
          iconBg="var(--accent-soft)"
          iconColor="#9A7B3F"
        />
        <StatCard label="Активные ученики" value={students} icon={Users} />
        <StatCard label="Новые за 30 дней" value={newStudents} icon={UserPlus} />
        <StatCard label="Заказов" value={ordersCount} icon={ShoppingBag} />
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <h3>Выручка за 30 дней</h3>
          </div>
          <div className="card-body">
            <RevenueChart data={chartData} />
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <h3>Последние покупки</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recent.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
                Пока нет покупок
              </div>
            ) : (
              <table className="tbl">
                <tbody>
                  {recent.map((o, i) => (
                    <tr key={i}>
                      <td>
                        <div className="cell-user">
                          <span className="ava s32">
                            {(o.customer_name || o.customer_email || '?')[0].toUpperCase()}
                          </span>
                          <div>
                            <div className="cu-name">{o.customer_name || '—'}</div>
                            <div className="cu-sub">{o.customer_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="cell-strong" style={{ textAlign: 'right' }}>
                        {formatPrice(o.amount_cents, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
