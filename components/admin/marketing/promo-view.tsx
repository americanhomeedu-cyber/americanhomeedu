'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/page-header'
import { AdminModal } from '@/components/admin/modal'

type Promo = {
  id: string
  code: string
  applies_to: string
  course_id: string | null
  discount_type: string
  discount_value: number
  max_uses: number | null
  current_uses: number
  is_active: boolean
}
type Course = { id: string; title: string }

export function PromoView({ promos, courses }: { promos: Promo[]; courses: Course[] }) {
  const router = useRouter()
  const [show, setShow] = React.useState(false)
  const blank = {
    code: '',
    applies_to: 'all',
    course_id: courses[0]?.id || '',
    discount_type: 'percent',
    discount_value: '10',
    max_uses: '',
  }
  const [f, setF] = React.useState(blank)
  const [busy, setBusy] = React.useState(false)
  const courseTitle = (id: string | null) => courses.find((c) => c.id === id)?.title

  async function create() {
    setBusy(true)
    const res = await fetch('/api/admin/promo-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: f.code,
        applies_to: f.applies_to,
        course_id: f.applies_to === 'specific' ? f.course_id : null,
        discount_type: f.discount_type,
        discount_value: parseInt(f.discount_value) || 0,
        max_uses: f.max_uses ? parseInt(f.max_uses) : null,
      }),
    })
    const d = await res.json()
    setBusy(false)
    if (!res.ok) toast.error(d.error || 'Ошибка')
    else {
      toast.success('Промокод создан')
      setShow(false)
      setF(blank)
      router.refresh()
    }
  }

  async function toggle(p: Promo) {
    const res = await fetch(`/api/admin/promo-codes/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !p.is_active }),
    })
    if (res.ok) router.refresh()
  }

  async function del(id: string) {
    if (!confirm('Удалить промокод?')) return
    const res = await fetch(`/api/admin/promo-codes/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Удалено')
      router.refresh()
    } else toast.error('Ошибка')
  }

  return (
    <>
      <PageHeader title="Промокоды" subtitle={`${promos.length} кодов`}>
        <button className="btn btn-primary" onClick={() => setShow(true)}>
          <Plus size={16} />
          Создать промокод
        </button>
      </PageHeader>
      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Код</th>
              <th>Применяется к</th>
              <th>Скидка</th>
              <th>Использований</th>
              <th>Активен</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {promos.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--ink-3)', padding: 32 }}>
                  Нет промокодов
                </td>
              </tr>
            ) : (
              promos.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{p.code}</span>
                  </td>
                  <td className="cell-muted">
                    {p.applies_to === 'all' ? 'Все курсы' : courseTitle(p.course_id) || '—'}
                  </td>
                  <td className="cell-strong">
                    {p.discount_type === 'percent' ? `${p.discount_value}%` : `$${p.discount_value}`}
                  </td>
                  <td className="tnum">
                    {p.current_uses}
                    {p.max_uses ? ` / ${p.max_uses}` : ''}
                  </td>
                  <td>
                    <label className="switch">
                      <input type="checkbox" checked={p.is_active} onChange={() => toggle(p)} />
                      <span className="track" />
                    </label>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => del(p.id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdminModal
        open={show}
        onClose={() => setShow(false)}
        title="Создать промокод"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShow(false)}>
              Отмена
            </button>
            <button className="btn btn-primary" onClick={create} disabled={busy || !f.code}>
              {busy ? 'Создаём…' : 'Создать'}
            </button>
          </>
        }
      >
        <div className="field">
          <label>Код</label>
          <input
            className="input"
            value={f.code}
            onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })}
            placeholder="EARLYBIRD20"
          />
        </div>
        <div className="field">
          <label>Применяется к</label>
          <select className="select" value={f.applies_to} onChange={(e) => setF({ ...f, applies_to: e.target.value })}>
            <option value="all">Все курсы</option>
            <option value="specific">Конкретный курс</option>
          </select>
        </div>
        {f.applies_to === 'specific' && (
          <div className="field">
            <label>Курс</label>
            <select className="select" value={f.course_id} onChange={(e) => setF({ ...f, course_id: e.target.value })}>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Тип</label>
            <select className="select" value={f.discount_type} onChange={(e) => setF({ ...f, discount_type: e.target.value })}>
              <option value="percent">Процент %</option>
              <option value="fixed">Фикс. $</option>
            </select>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Значение</label>
            <input
              className="input"
              type="number"
              value={f.discount_value}
              onChange={(e) => setF({ ...f, discount_value: e.target.value })}
            />
          </div>
        </div>
        <div className="field">
          <label>Лимит использований (опционально)</label>
          <input
            className="input"
            type="number"
            value={f.max_uses}
            onChange={(e) => setF({ ...f, max_uses: e.target.value })}
          />
        </div>
      </AdminModal>
    </>
  )
}
