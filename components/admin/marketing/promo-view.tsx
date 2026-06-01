'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Pencil, Copy, RefreshCw, Ticket, Activity, Hash } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { PageHeader } from '@/components/admin/page-header'
import { StatCard } from '@/components/admin/stat-card'
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
  expires_at: string | null
  description: string | null
}
type Course = { id: string; title: string }

function genCode() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 8; i++) s += c[Math.floor(Math.random() * c.length)]
  return s
}

function statusOf(p: Promo): [string, string] {
  if (!p.is_active) return ['Выключен', 'gray']
  if (p.expires_at && new Date(p.expires_at) < new Date()) return ['Истёк', 'gray']
  if (p.max_uses && p.current_uses >= p.max_uses) return ['Исчерпан', 'amber']
  return ['Активен', 'green']
}

export function PromoView({ promos, courses }: { promos: Promo[]; courses: Course[] }) {
  const router = useRouter()
  const [edit, setEdit] = React.useState<Partial<Promo> | null>(null)
  const [busy, setBusy] = React.useState(false)
  const courseTitle = (id: string | null) => courses.find((c) => c.id === id)?.title

  const activeCount = promos.filter((p) => statusOf(p)[0] === 'Активен').length
  const totalUses = promos.reduce((s, p) => s + p.current_uses, 0)

  function openNew() {
    setEdit({
      code: genCode(),
      applies_to: 'all',
      course_id: courses[0]?.id || null,
      discount_type: 'percent',
      discount_value: 10,
      max_uses: null,
      is_active: true,
      expires_at: null,
      description: '',
    })
  }

  async function save() {
    if (!edit) return
    setBusy(true)
    const isNew = !edit.id
    const payload = {
      code: edit.code,
      applies_to: edit.applies_to,
      course_id: edit.applies_to === 'specific' ? edit.course_id : null,
      discount_type: edit.discount_type,
      discount_value: Number(edit.discount_value) || 0,
      max_uses: edit.max_uses ? Number(edit.max_uses) : null,
      expires_at: edit.expires_at || null,
      description: edit.description || null,
      is_active: edit.is_active ?? true,
    }
    const res = await fetch(isNew ? '/api/admin/promo-codes' : `/api/admin/promo-codes/${edit.id}`, {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const d = await res.json()
    setBusy(false)
    if (!res.ok) toast.error(d.error || 'Ошибка')
    else {
      toast.success(isNew ? 'Промокод создан' : 'Сохранено')
      setEdit(null)
      router.refresh()
    }
  }

  async function toggle(p: Promo) {
    await fetch(`/api/admin/promo-codes/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !p.is_active }),
    })
    router.refresh()
  }

  async function del(id: string) {
    if (!confirm('Удалить промокод?')) return
    const res = await fetch(`/api/admin/promo-codes/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Удалено')
      router.refresh()
    } else toast.error('Ошибка')
  }

  function copy(code: string) {
    navigator.clipboard?.writeText(code)
    toast.info('Скопировано')
  }

  return (
    <>
      <PageHeader title="Промокоды" subtitle="Скидки и реферальные коды для кампаний">
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} />
          Создать промокод
        </button>
      </PageHeader>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard label="Активных промокодов" value={activeCount} icon={Ticket} iconBg="var(--accent-soft)" iconColor="#9A7B3F" />
        <StatCard label="Всего использований" value={totalUses} icon={Activity} />
        <StatCard label="Кодов всего" value={promos.length} icon={Hash} />
      </div>

      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Код</th>
              <th>Скидка</th>
              <th>Применяется к</th>
              <th>Использовано</th>
              <th>Срок</th>
              <th>Статус</th>
              <th style={{ width: 110 }} />
            </tr>
          </thead>
          <tbody>
            {promos.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--ink-3)', padding: 40 }}>
                  Нет промокодов
                </td>
              </tr>
            ) : (
              promos.map((p) => {
                const [label, cls] = statusOf(p)
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="row" style={{ gap: 6 }}>
                        <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{p.code}</span>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => copy(p.code)}>
                          <Copy size={13} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className="badge gold">
                        {p.discount_type === 'percent' ? `${p.discount_value}%` : `−$${p.discount_value}`}
                      </span>
                    </td>
                    <td>
                      {p.applies_to === 'all' ? (
                        <span className="badge blue">Все курсы</span>
                      ) : (
                        <span className="cell-muted">{courseTitle(p.course_id) || '—'}</span>
                      )}
                    </td>
                    <td className="tnum">
                      {p.current_uses}
                      {p.max_uses ? ` / ${p.max_uses}` : ' / ∞'}
                    </td>
                    <td className="cell-muted">
                      {p.expires_at ? format(new Date(p.expires_at), 'd MMM yyyy', { locale: ru }) : 'Бессрочно'}
                    </td>
                    <td>
                      <span className={`badge ${cls}`}>
                        <span className="bd-dot" />
                        {label}
                      </span>
                    </td>
                    <td>
                      <div className="row" style={{ gap: 4, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => toggle(p)} title={p.is_active ? 'Выключить' : 'Включить'}>
                          <Activity size={14} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setEdit(p)}>
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => del(p.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {edit && (
        <AdminModal
          open
          onClose={() => setEdit(null)}
          title={edit.id ? 'Редактировать промокод' : 'Создать промокод'}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setEdit(null)}>
                Отмена
              </button>
              <button className="btn btn-primary" onClick={save} disabled={busy || !edit.code}>
                {busy ? 'Сохраняем…' : 'Сохранить'}
              </button>
            </>
          }
        >
          <div className="field">
            <label>Код</label>
            <div className="row" style={{ gap: 8 }}>
              <input
                className="input"
                style={{ fontFamily: 'var(--mono)' }}
                value={edit.code || ''}
                onChange={(e) => setEdit({ ...edit, code: e.target.value.toUpperCase() })}
              />
              <button className="btn btn-outline btn-sm" type="button" onClick={() => setEdit({ ...edit, code: genCode() })}>
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Тип скидки</label>
              <select className="select" value={edit.discount_type} onChange={(e) => setEdit({ ...edit, discount_type: e.target.value })}>
                <option value="percent">Процент %</option>
                <option value="fixed">Фикс. сумма $</option>
              </select>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Размер</label>
              <input
                className="input"
                type="number"
                value={edit.discount_value ?? ''}
                onChange={(e) => setEdit({ ...edit, discount_value: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Макс. использований</label>
              <input
                className="input"
                type="number"
                placeholder="∞"
                value={edit.max_uses ?? ''}
                onChange={(e) => setEdit({ ...edit, max_uses: e.target.value ? Number(e.target.value) : null })}
              />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Действует до</label>
              <input
                className="input"
                type="date"
                value={edit.expires_at ? edit.expires_at.slice(0, 10) : ''}
                onChange={(e) => setEdit({ ...edit, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
              />
            </div>
          </div>

          <div className="field">
            <label>Применяется к</label>
            <div className="seg" style={{ marginBottom: 0 }}>
              <button className={edit.applies_to === 'specific' ? 'active' : ''} onClick={() => setEdit({ ...edit, applies_to: 'specific' })}>
                Конкретный курс
              </button>
              <button className={edit.applies_to === 'all' ? 'active' : ''} onClick={() => setEdit({ ...edit, applies_to: 'all' })}>
                Все курсы
              </button>
            </div>
          </div>
          {edit.applies_to === 'specific' && (
            <div className="field">
              <label>Курс</label>
              <select className="select" value={edit.course_id || ''} onChange={(e) => setEdit({ ...edit, course_id: e.target.value })}>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="field">
            <label>Описание (для админа)</label>
            <input
              className="input"
              value={edit.description || ''}
              onChange={(e) => setEdit({ ...edit, description: e.target.value })}
              placeholder="Напр.: Launch-кампания"
            />
          </div>

          <div className="switch-row">
            <div className="sr-text">Активен</div>
            <label className="switch">
              <input type="checkbox" checked={edit.is_active ?? true} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} />
              <span className="track" />
            </label>
          </div>
        </AdminModal>
      )}
    </>
  )
}
