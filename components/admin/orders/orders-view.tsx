'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Search,
  Copy,
} from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { StatCard } from '@/components/admin/stat-card'
import { AdminModal } from '@/components/admin/modal'
import { Sheet } from '@/components/admin/sheet'
import { formatPrice } from '@/lib/utils'

type Order = {
  id: string
  amount_cents: number
  currency: string
  status: string
  customer_name: string | null
  customer_email: string
  created_at: string
  promo_code: string | null
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  course_id: string | null
  courseTitle: string | null
}

type Course = { id: string; title: string }

const COURSE_COLORS = ['#2D4A3E', '#1E3A5F', '#9A7B3F', '#5B3A6B', '#2A6B5E', '#B45309']
const STATUS: Record<string, { cls: string; label: string }> = {
  completed: { cls: 'green', label: 'Оплачен' },
  pending: { cls: 'amber', label: 'Ожидает' },
  failed: { cls: 'red', label: 'Ошибка' },
  refunded: { cls: 'gray', label: 'Возврат' },
}

function StripeLink({ order }: { order: Order }) {
  const id = order.stripe_payment_intent_id
  if (!id) return <span className="cell-muted">—</span>
  return (
    <a
      href={`https://dashboard.stripe.com/test/payments/${id}`}
      target="_blank"
      rel="noreferrer"
      className="btn btn-ghost btn-icon btn-sm"
      onClick={(e) => e.stopPropagation()}
      aria-label="Открыть в Stripe"
    >
      <ExternalLink size={15} />
    </a>
  )
}

export function OrdersView({ orders, courses }: { orders: Order[]; courses: Course[] }) {
  const router = useRouter()
  const [search, setSearch] = React.useState('')
  const [status, setStatus] = React.useState('all')
  const [courseFilter, setCourseFilter] = React.useState('all')
  const [sheetOrder, setSheetOrder] = React.useState<Order | null>(null)
  const [refundOrder, setRefundOrder] = React.useState<Order | null>(null)
  const [refunding, setRefunding] = React.useState(false)
  const [reason, setReason] = React.useState('')

  const colorOf = (id: string | null) =>
    id
      ? COURSE_COLORS[Math.max(0, courses.findIndex((c) => c.id === id)) % COURSE_COLORS.length]
      : 'var(--ink-3)'

  const currency = orders[0]?.currency || 'usd'
  const completedOrders = orders.filter((o) => o.status === 'completed')
  const refundedOrders = orders.filter((o) => o.status === 'refunded')
  const totalRevenue = completedOrders.reduce((s, o) => s + o.amount_cents, 0)
  const avgCheck = completedOrders.length ? Math.round(totalRevenue / completedOrders.length) : 0
  const refundSum = refundedOrders.reduce((s, o) => s + o.amount_cents, 0)

  const filtered = orders.filter((o) => {
    if (status !== 'all' && o.status !== status) return false
    if (courseFilter !== 'all' && o.course_id !== courseFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const hay = `${o.customer_email} ${o.customer_name ?? ''} ${o.id}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  async function doRefund() {
    if (!refundOrder) return
    setRefunding(true)
    const res = await fetch(`/api/admin/orders/${refundOrder.id}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    const d = await res.json().catch(() => ({}))
    setRefunding(false)
    if (!res.ok) {
      toast.error(d.error || 'Ошибка возврата')
      return
    }
    toast.success('Возврат выполнен')
    setRefundOrder(null)
    setReason('')
    setSheetOrder(null)
    router.refresh()
  }

  function copy(text: string | null) {
    if (!text) return
    navigator.clipboard?.writeText(text)
    toast.info('Скопировано')
  }

  return (
    <>
      <PageHeader title="Заказы" subtitle="История всех покупок и платежей" />

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard label="Всего заказов" value={orders.length} icon={CreditCard} />
        <StatCard
          label="Выручка"
          value={formatPrice(totalRevenue, currency)}
          icon={DollarSign}
          iconBg="var(--accent-soft)"
          iconColor="#9A7B3F"
        />
        <StatCard
          label="Средний чек"
          value={formatPrice(avgCheck, currency)}
          icon={TrendingUp}
          iconBg="var(--success-soft)"
          iconColor="var(--success)"
        />
        <StatCard
          label="Возвраты"
          value={`${refundedOrders.length} · ${formatPrice(refundSum, currency)}`}
          icon={RefreshCw}
          iconBg="var(--error-soft)"
          iconColor="var(--error)"
        />
      </div>

      <div className="table-wrap">
        <div className="toolbar">
          <div className="input-wrap" style={{ maxWidth: 280, flex: 1 }}>
            <Search size={16} />
            <input
              className="input has-icon"
              placeholder="Email, имя клиента или ID заказа..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="select auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Все статусы</option>
            <option value="completed">Оплачен</option>
            <option value="pending">Ожидает</option>
            <option value="failed">Ошибка</option>
            <option value="refunded">Возврат</option>
          </select>
          <select
            className="select auto"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="all">Все курсы</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th>ID</th>
              <th>Клиент</th>
              <th>Курс</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Промокод</th>
              <th>Дата</th>
              <th>Stripe</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--ink-3)', padding: 40 }}>
                  Заказов не найдено
                </td>
              </tr>
            ) : (
              filtered.map((o) => {
                const st = STATUS[o.status] ?? { cls: 'gray', label: o.status }
                return (
                  <tr key={o.id} className="clickable" onClick={() => setSheetOrder(o)}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{o.id.slice(0, 8)}</td>
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
                    <td>
                      {o.courseTitle ? (
                        <div className="row" style={{ gap: 8 }}>
                          <span
                            className="cs-ava"
                            style={{ background: colorOf(o.course_id), width: 20, height: 20, fontSize: 10 }}
                          >
                            {o.courseTitle[0]}
                          </span>
                          <span style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {o.courseTitle}
                          </span>
                        </div>
                      ) : (
                        <span className="cell-muted">—</span>
                      )}
                    </td>
                    <td className="cell-strong">{formatPrice(o.amount_cents, o.currency)}</td>
                    <td>
                      <span className={`badge ${st.cls}`}>
                        <span className="bd-dot" />
                        {st.label}
                      </span>
                    </td>
                    <td>
                      {o.promo_code ? (
                        <span className="badge gold">{o.promo_code}</span>
                      ) : (
                        <span className="cell-muted">—</span>
                      )}
                    </td>
                    <td className="cell-muted">
                      {format(new Date(o.created_at), 'd MMM yyyy, HH:mm', { locale: ru })}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <StripeLink order={o} />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ---- Order detail sheet ---- */}
      <Sheet
        open={!!sheetOrder}
        onClose={() => setSheetOrder(null)}
        title={sheetOrder ? `Заказ ${sheetOrder.id.slice(0, 8)}` : ''}
      >
        {sheetOrder && (
          <SheetContent
            order={sheetOrder}
            onCopy={copy}
            onRefund={() => setRefundOrder(sheetOrder)}
          />
        )}
      </Sheet>

      {/* ---- Refund modal ---- */}
      <AdminModal
        open={!!refundOrder}
        onClose={() => !refunding && setRefundOrder(null)}
        title="Возврат средств"
        subtitle={refundOrder ? refundOrder.customer_email : ''}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setRefundOrder(null)} disabled={refunding}>
              Отмена
            </button>
            <button className="btn btn-danger" onClick={doRefund} disabled={refunding}>
              {refunding ? <span className="spin" /> : null}
              Сделать возврат
            </button>
          </>
        }
      >
        {refundOrder && (
          <>
            <div className="field">
              <label>Сумма возврата</label>
              <input
                className="input"
                value={formatPrice(refundOrder.amount_cents, refundOrder.currency)}
                readOnly
              />
              <div className="hint">Полный возврат через Stripe. Частичный возврат пока недоступен.</div>
            </div>
            <div className="field">
              <label>Причина (необязательно)</label>
              <textarea
                className="textarea"
                placeholder="Например: запрос клиента в течение гарантии"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div
              className="attention"
              style={{ background: 'var(--info-soft)', borderColor: '#CBDCF7' }}
            >
              <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                Доступ к курсу будет отозван, а средства вернутся клиенту в течение 5–10 дней.
              </div>
            </div>
          </>
        )}
      </AdminModal>
    </>
  )
}

function DLRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="dl-row">
      <span className="dt">{label}</span>
      <span className="dd-v">{children}</span>
    </div>
  )
}

function SheetContent({
  order,
  onCopy,
  onRefund,
}: {
  order: Order
  onCopy: (t: string | null) => void
  onRefund: () => void
}) {
  const st = STATUS[order.status] ?? { cls: 'gray', label: order.status }
  return (
    <>
      <div
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 20,
          textAlign: 'center',
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-.02em' }}>
          {formatPrice(order.amount_cents, order.currency)}
        </div>
        <div style={{ marginTop: 8 }}>
          <span className={`badge ${st.cls}`}>
            <span className="bd-dot" />
            {st.label}
          </span>
          <span className="cell-muted" style={{ marginLeft: 10, fontSize: 13 }}>
            {format(new Date(order.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
          </span>
        </div>
      </div>

      <div className="sheet-section">
        <h4>Клиент</h4>
        <div className="cell-user">
          <span className="ava s40">
            {(order.customer_name || order.customer_email)[0].toUpperCase()}
          </span>
          <div>
            <div className="cu-name">{order.customer_name || '—'}</div>
            <div className="cu-sub">{order.customer_email}</div>
          </div>
        </div>
      </div>

      <div className="sheet-section">
        <h4>Платёж</h4>
        <div className="dl">
          <DLRow label="Курс">{order.courseTitle || '—'}</DLRow>
          {order.promo_code && (
            <DLRow label="Промокод">
              <span className="badge gold">{order.promo_code}</span>
            </DLRow>
          )}
          <DLRow label="Stripe Session">
            <button
              className="copy-field"
              style={{ maxWidth: 220 }}
              onClick={() => onCopy(order.stripe_session_id)}
            >
              <span>{order.stripe_session_id || '—'}</span>
              <Copy size={14} />
            </button>
          </DLRow>
          <DLRow label="Payment Intent">
            <button
              className="copy-field"
              style={{ maxWidth: 220 }}
              onClick={() => onCopy(order.stripe_payment_intent_id)}
            >
              <span>{order.stripe_payment_intent_id || '—'}</span>
              <Copy size={14} />
            </button>
          </DLRow>
        </div>
      </div>

      <div className="sheet-section">
        <h4>История</h4>
        <div className="timeline">
          <div className="tl-item">
            <div className="tl-title">Checkout начат</div>
            <div className="tl-time">{format(new Date(order.created_at), 'd MMM, HH:mm', { locale: ru })}</div>
          </div>
          {order.status === 'completed' && (
            <>
              <div className="tl-item gold">
                <div className="tl-title">Платёж успешно проведён</div>
                <div className="tl-time">{format(new Date(order.created_at), 'd MMM, HH:mm', { locale: ru })}</div>
              </div>
              <div className="tl-item">
                <div className="tl-title">Доступ к курсу выдан · письмо отправлено</div>
                <div className="tl-time">{format(new Date(order.created_at), 'd MMM, HH:mm', { locale: ru })}</div>
              </div>
            </>
          )}
          {order.status === 'refunded' && (
            <div className="tl-item">
              <div className="tl-title">Оформлен возврат</div>
            </div>
          )}
        </div>
      </div>

      {order.status === 'completed' && (
        <button
          className="btn btn-danger-outline mt-4"
          style={{ width: '100%' }}
          onClick={onRefund}
        >
          <RefreshCw size={16} />
          Сделать возврат
        </button>
      )}
    </>
  )
}
