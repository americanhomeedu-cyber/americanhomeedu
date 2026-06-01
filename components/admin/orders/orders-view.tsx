'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { PageHeader } from '@/components/admin/page-header'
import { formatPrice } from '@/lib/utils'

type Order = {
  id: string
  amount_cents: number
  currency: string
  status: string
  customer_name: string | null
  customer_email: string
  created_at: string
  courseTitle: string | null
}

const STATUS: Record<string, { cls: string; label: string }> = {
  completed: { cls: 'green', label: 'Оплачен' },
  pending: { cls: 'amber', label: 'Ожидает' },
  failed: { cls: 'red', label: 'Ошибка' },
  refunded: { cls: 'gray', label: 'Возврат' },
}

export function OrdersView({ orders }: { orders: Order[] }) {
  const router = useRouter()
  const [filter, setFilter] = React.useState<string>('all')

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)
  const currency = orders[0]?.currency || 'usd'
  const totalRevenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((s, o) => s + o.amount_cents, 0)

  async function refund(id: string) {
    if (!confirm('Сделать возврат? Доступ к курсу будет отозван.')) return
    const res = await fetch(`/api/admin/orders/${id}/refund`, { method: 'POST' })
    const d = await res.json()
    if (!res.ok) toast.error(d.error || 'Ошибка')
    else {
      toast.success('Возврат выполнен')
      router.refresh()
    }
  }

  return (
    <>
      <PageHeader
        title="Заказы"
        subtitle={`Выручка: ${formatPrice(totalRevenue, currency)} · заказов: ${orders.length}`}
      />
      <div className="table-wrap">
        <div className="toolbar">
          <div className="chips">
            {[
              ['all', 'Все'],
              ['completed', 'Оплачены'],
              ['pending', 'Ожидают'],
              ['refunded', 'Возвраты'],
            ].map(([k, l]) => (
              <button
                key={k}
                className={`chip filter-tab${filter === k ? ' active' : ''}`}
                onClick={() => setFilter(k)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Клиент</th>
              <th>Курс</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Дата</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--ink-3)', padding: 32 }}>
                  Заказов нет
                </td>
              </tr>
            ) : (
              filtered.map((o) => {
                const st = STATUS[o.status] ?? { cls: 'gray', label: o.status }
                return (
                  <tr key={o.id}>
                    <td>
                      <div className="cell-user">
                        <span className="ava s32">
                          {(o.customer_name || o.customer_email)[0].toUpperCase()}
                        </span>
                        <div>
                          <div className="cu-name">{o.customer_name || '—'}</div>
                          <div className="cu-sub">{o.customer_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="cell-muted">{o.courseTitle || '—'}</td>
                    <td className="cell-strong">{formatPrice(o.amount_cents, o.currency)}</td>
                    <td>
                      <span className={`badge ${st.cls}`}>
                        <span className="bd-dot" />
                        {st.label}
                      </span>
                    </td>
                    <td className="cell-muted">
                      {format(new Date(o.created_at), 'd MMM yyyy', { locale: ru })}
                    </td>
                    <td>
                      {o.status === 'completed' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => refund(o.id)}>
                          Возврат
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
