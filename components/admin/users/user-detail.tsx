'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  MoreHorizontal,
  KeyRound,
  RefreshCw,
  Trash2,
  Check,
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { AdminModal } from '@/components/admin/modal'
import { formatPrice } from '@/lib/utils'

type Profile = {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  notes: string | null
  role: string
  created_at: string
  last_login_at: string | null
}
type Enrollment = { courseId: string; title: string; source: string; granted_at: string }
type Order = {
  id: string
  amount_cents: number
  currency: string
  status: string
  created_at: string
  promo_code: string | null
  courseTitle: string | null
}
type Section = { id: string; title: string; position: number; course_id: string }
type Course = { id: string; title: string }
type Ev = { event_type: string; page_url: string | null; created_at: string }

const STATUS: Record<string, { cls: string; label: string }> = {
  completed: { cls: 'green', label: 'Оплачен' },
  pending: { cls: 'amber', label: 'Ожидает' },
  failed: { cls: 'red', label: 'Ошибка' },
  refunded: { cls: 'gray', label: 'Возврат' },
}

function fmtTime(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  return h ? `${h}ч ${m}м` : `${m}м`
}
function genPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let s = ''
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s + 'A7'
}

export function UserDetail({
  profile,
  enrollments,
  orders,
  sections,
  doneSectionIds,
  events,
  courses,
  stats,
}: {
  profile: Profile
  enrollments: Enrollment[]
  orders: Order[]
  sections: Section[]
  doneSectionIds: string[]
  events: Ev[]
  courses: Course[]
  stats: { progressPct: number; timeSpent: number; ordersCount: number; spent: number }
}) {
  const router = useRouter()
  const [tab, setTab] = React.useState<'overview' | 'progress' | 'orders' | 'events'>('overview')
  const [fullName, setFullName] = React.useState(profile.full_name || '')
  const [phone, setPhone] = React.useState(profile.phone || '')
  const [notes, setNotes] = React.useState(profile.notes || '')
  const [role, setRole] = React.useState(profile.role)
  const [saving, setSaving] = React.useState(false)
  const [menu, setMenu] = React.useState(false)
  const [pwOpen, setPwOpen] = React.useState(false)
  const [pw, setPw] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  const enrolledIds = new Set(enrollments.map((e) => e.courseId))
  const done = new Set(doneSectionIds)
  const hasAccess = enrollments.length > 0
  const initials =
    (profile.full_name || profile.email)
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'

  React.useEffect(() => {
    if (!menu) return
    const close = () => setMenu(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menu])

  async function api(url: string, body?: unknown, method = 'POST') {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    const d = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(d.error || 'Ошибка')
    return d
  }

  async function saveProfile() {
    setSaving(true)
    try {
      await api(`/api/admin/users/${profile.id}`, { full_name: fullName, phone, notes }, 'PATCH')
      toast.success('Профиль сохранён')
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function changeRole(r: string) {
    setRole(r)
    try {
      await api(`/api/admin/users/${profile.id}`, { role: r }, 'PATCH')
      toast.success('Роль обновлена')
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function toggleCourse(courseId: string, enrolled: boolean) {
    try {
      await api('/api/admin/enrollments', {
        userId: profile.id,
        courseId,
        action: enrolled ? 'revoke' : 'grant',
      })
      toast.success(enrolled ? 'Доступ отозван' : 'Доступ выдан')
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function resetProgress() {
    if (!confirm('Сбросить весь прогресс ученика?')) return
    try {
      await api(`/api/admin/users/${profile.id}/reset-progress`)
      toast.success('Прогресс сброшен')
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function deleteUser() {
    if (!confirm('Удалить аккаунт ученика? Действие необратимо.')) return
    try {
      await api(`/api/admin/users/${profile.id}`, undefined, 'DELETE')
      toast.success('Аккаунт удалён')
      router.push('/admin/users')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  // timeline of real events (purchases + access grants)
  const timeline = [
    ...orders
      .filter((o) => o.status === 'completed')
      .map((o) => ({
        gold: true,
        title: `Покупка${o.courseTitle ? ` «${o.courseTitle}»` : ''} · ${formatPrice(o.amount_cents, o.currency)}`,
        at: o.created_at,
      })),
    ...enrollments.map((e) => ({
      gold: false,
      title: `Доступ к «${e.title}» (${e.source === 'purchase' ? 'покупка' : 'вручную'})`,
      at: e.granted_at,
    })),
  ].sort((a, b) => b.at.localeCompare(a.at))

  const sectionsByCourse = courses
    .filter((c) => enrolledIds.has(c.id))
    .map((c) => ({ course: c, items: sections.filter((s) => s.course_id === c.id) }))

  return (
    <>
      <Link href="/admin/users" className="row" style={{ gap: 6, color: 'var(--ink-2)', fontSize: 13, marginBottom: 16 }}>
        <ArrowLeft size={15} />
        Все ученики
      </Link>

      <div className="page-head">
        <div className="row" style={{ gap: 16 }}>
          <span className="ava s64 alt2">{initials}</span>
          <div>
            <h1 style={{ fontSize: 26 }}>{profile.full_name || '—'}</h1>
            <div className="row" style={{ gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
              <span className="cell-muted">{profile.email}</span>
              {profile.role === 'admin' && <span className="badge blue">Админ</span>}
              <span className={`badge ${hasAccess ? 'green' : 'gray'}`}>
                <span className="bd-dot" />
                {hasAccess ? 'Доступ есть' : 'Без доступа'}
              </span>
            </div>
          </div>
        </div>
        <div className="ph-actions">
          <div className={`dd${menu ? ' open' : ''}`}>
            <button
              className="btn btn-outline btn-icon"
              onClick={(e) => {
                e.stopPropagation()
                setMenu((m) => !m)
              }}
            >
              <MoreHorizontal size={16} />
            </button>
            <div className="dd-menu">
              <button className="dd-item" onClick={() => { setPw(genPassword()); setPwOpen(true) }}>
                <KeyRound size={15} />
                Сменить пароль
              </button>
              <button className="dd-item" onClick={resetProgress}>
                <RotateCcw size={15} />
                Сбросить прогресс
              </button>
              <div className="dd-sep" />
              <button className="dd-item danger" onClick={deleteUser}>
                <Trash2 size={15} />
                Удалить аккаунт
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="user-grid">
        {/* LEFT */}
        <div style={{ display: 'grid', gap: 24 }}>
          <div className="card">
            <div className="card-head">
              <h3>Профиль</h3>
            </div>
            <div className="card-body">
              <div className="field">
                <label>Имя и фамилия</label>
                <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="field">
                <label>Email</label>
                <input className="input" value={profile.email} disabled />
                <div className="hint">Email нельзя изменить</div>
              </div>
              <div className="field">
                <label>Телефон</label>
                <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="field">
                <label>Заметки администратора</label>
                <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
                {saving ? 'Сохраняем…' : 'Сохранить'}
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Доступ и роль</h3>
            </div>
            <div className="card-body">
              <div className="field">
                <label>Роль</label>
                <select className="select" value={role} onChange={(e) => changeRole(e.target.value)}>
                  <option value="student">Ученик</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                Доступ к курсам
              </label>
              <div style={{ display: 'grid', gap: 6 }}>
                {courses.map((c) => {
                  const enrolled = enrolledIds.has(c.id)
                  return (
                    <div className="switch-row" key={c.id} style={{ padding: '8px 0' }}>
                      <div className="sr-text">{c.title}</div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={enrolled}
                          onChange={() => toggleCourse(c.id, enrolled)}
                        />
                        <span className="track" />
                      </label>
                    </div>
                  )
                })}
              </div>
              <button className="btn btn-outline mt-4" onClick={() => { setPw(genPassword()); setPwOpen(true) }}>
                <KeyRound size={15} />
                Сменить пароль
              </button>
            </div>
          </div>

          <div className="card danger-zone">
            <div className="card-head">
              <h3 style={{ color: 'var(--error)' }}>Опасная зона</h3>
            </div>
            <div className="card-body" style={{ display: 'grid', gap: 10 }}>
              <button className="btn btn-outline" onClick={resetProgress}>
                <RotateCcw size={15} />
                Сбросить прогресс
              </button>
              <button className="btn btn-danger-outline" onClick={deleteUser}>
                <Trash2 size={15} />
                Удалить аккаунт
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <div className="tabs">
            {([['overview', 'Обзор'], ['progress', 'Прогресс'], ['orders', 'Заказы'], ['events', 'События']] as const).map(
              ([k, l]) => (
                <button key={k} className={`tab${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>
                  {l}
                </button>
              ),
            )}
          </div>

          {tab === 'overview' && (
            <>
              <div className="grid-3" style={{ marginBottom: 16 }}>
                <div className="mini-stat">
                  <div className="ms-label">Прогресс</div>
                  <div className="ms-num">{stats.progressPct}%</div>
                </div>
                <div className="mini-stat">
                  <div className="ms-label">Время в курсе</div>
                  <div className="ms-num">{fmtTime(stats.timeSpent)}</div>
                </div>
                <div className="mini-stat">
                  <div className="ms-label">Покупок</div>
                  <div className="ms-num">{formatPrice(stats.spent)}</div>
                </div>
                <div className="mini-stat">
                  <div className="ms-label">Регистрация</div>
                  <div className="ms-num" style={{ fontSize: 16 }}>
                    {format(new Date(profile.created_at), 'd MMM yyyy', { locale: ru })}
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-head">
                  <h3>Последние действия</h3>
                </div>
                <div className="card-body">
                  {timeline.length === 0 ? (
                    <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>Активности пока нет</div>
                  ) : (
                    <div className="timeline">
                      {timeline.slice(0, 12).map((t, i) => (
                        <div className={`tl-item${t.gold ? ' gold' : ''}`} key={i}>
                          <div className="tl-title">{t.title}</div>
                          <div className="tl-time">{format(new Date(t.at), 'd MMM yyyy, HH:mm', { locale: ru })}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {tab === 'progress' && (
            <div style={{ display: 'grid', gap: 16 }}>
              {sectionsByCourse.length === 0 ? (
                <div className="card">
                  <div className="card-body" style={{ color: 'var(--ink-3)', fontSize: 13 }}>
                    Нет доступа к курсам — прогресс отсутствует.
                  </div>
                </div>
              ) : (
                sectionsByCourse.map(({ course, items }) => (
                  <div className="card" key={course.id}>
                    <div className="card-head">
                      <h3>{course.title}</h3>
                      <span className="ch-sub">
                        {items.filter((s) => done.has(s.id)).length} / {items.length} секций
                      </span>
                    </div>
                    <div className="card-body" style={{ display: 'grid', gap: 4 }}>
                      {items.length === 0 ? (
                        <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>В курсе пока нет секций</div>
                      ) : (
                        items.map((s) => {
                          const ok = done.has(s.id)
                          return (
                            <div className="row" key={s.id} style={{ gap: 10, padding: '7px 0' }}>
                              <span
                                style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: '50%',
                                  display: 'grid',
                                  placeItems: 'center',
                                  flex: 'none',
                                  background: ok ? 'var(--success)' : 'var(--border-2)',
                                  color: '#fff',
                                }}
                              >
                                {ok && <Check size={12} />}
                              </span>
                              <span style={{ fontSize: 13.5, color: ok ? 'var(--ink)' : 'var(--ink-2)' }}>
                                {s.title}
                              </span>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'orders' && (
            <div className="table-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Курс</th>
                    <th>Сумма</th>
                    <th>Промокод</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-3)', padding: 32 }}>
                        Заказов нет
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => {
                      const st = STATUS[o.status] ?? { cls: 'gray', label: o.status }
                      return (
                        <tr key={o.id}>
                          <td className="cell-muted">{format(new Date(o.created_at), 'd MMM yyyy', { locale: ru })}</td>
                          <td>{o.courseTitle || '—'}</td>
                          <td className="cell-strong">{formatPrice(o.amount_cents, o.currency)}</td>
                          <td>{o.promo_code ? <span className="badge gold">{o.promo_code}</span> : <span className="cell-muted">—</span>}</td>
                          <td>
                            <span className={`badge ${st.cls}`}>
                              <span className="bd-dot" />
                              {st.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'events' && (
            <div className="card">
              <div className="card-body">
                {events.length === 0 ? (
                  <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>
                    Событий пока нет (трекинг подключается на этапе аналитики).
                  </div>
                ) : (
                  <div className="timeline">
                    {events.map((e, i) => (
                      <div className="tl-item" key={i}>
                        <div className="tl-title" style={{ fontFamily: 'var(--mono)', fontSize: 12.5 }}>
                          {e.event_type}
                          {e.page_url ? ` · ${e.page_url}` : ''}
                        </div>
                        <div className="tl-time">{format(new Date(e.created_at), 'd MMM yyyy, HH:mm', { locale: ru })}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AdminModal
        open={pwOpen}
        onClose={() => setPwOpen(false)}
        title="Сменить пароль"
        subtitle={profile.email}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setPwOpen(false)}>
              Отмена
            </button>
            <button
              className="btn btn-primary"
              disabled={busy || pw.length < 6}
              onClick={async () => {
                setBusy(true)
                try {
                  await api(`/api/admin/users/${profile.id}/password`, { password: pw })
                  toast.success('Пароль изменён')
                  setPwOpen(false)
                } catch (e) {
                  toast.error((e as Error).message)
                } finally {
                  setBusy(false)
                }
              }}
            >
              Сохранить
            </button>
          </>
        }
      >
        <div className="field">
          <label>Новый пароль</label>
          <div className="row" style={{ gap: 8 }}>
            <input className="input" value={pw} onChange={(e) => setPw(e.target.value)} />
            <button className="btn btn-outline btn-sm" type="button" onClick={() => setPw(genPassword())}>
              <RefreshCw size={14} />
              Сгенерировать
            </button>
          </div>
        </div>
      </AdminModal>
    </>
  )
}
