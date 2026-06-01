'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Download,
  Search,
  Plus,
  X,
  MoreHorizontal,
  Eye,
  KeyRound,
  Shield,
  Trash2,
  UserPlus,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { PageHeader } from '@/components/admin/page-header'
import { AdminModal } from '@/components/admin/modal'
import { formatPrice } from '@/lib/utils'

type Enr = { courseId: string; title: string }
type User = {
  id: string
  full_name: string | null
  email: string
  role: string
  created_at: string
  last_login_at: string | null
  courses: Enr[]
  spent: number
  progress: number
  hasAccess: boolean
}
type Course = { id: string; title: string }
type SortKey = 'name' | 'spent' | 'created'

function timeAgo(iso: string | null) {
  if (!iso) return '—'
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'только что'
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`
  if (diff < 172800) return 'вчера'
  if (diff < 604800) return `${Math.floor(diff / 86400)} дн назад`
  return format(new Date(iso), 'd MMM yyyy', { locale: ru })
}

function genPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let s = ''
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s + 'A7'
}

export function UsersView({ users, courses }: { users: User[]; courses: Course[] }) {
  const router = useRouter()
  const [search, setSearch] = React.useState('')
  const [access, setAccess] = React.useState('all')
  const [role, setRole] = React.useState('all')
  const [courseFilter, setCourseFilter] = React.useState('all')
  const [sortKey, setSortKey] = React.useState<SortKey>('created')
  const [sortDir, setSortDir] = React.useState<1 | -1>(-1)
  const [page, setPage] = React.useState(1)
  const [per, setPer] = React.useState(20)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [openMenu, setOpenMenu] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)

  // modals
  const [createOpen, setCreateOpen] = React.useState(false)
  const [grantFor, setGrantFor] = React.useState<User | 'bulk' | null>(null)
  const [grantCourse, setGrantCourse] = React.useState(courses[0]?.id || '')
  const [pwFor, setPwFor] = React.useState<User | null>(null)
  const [pw, setPw] = React.useState('')

  React.useEffect(() => setPage(1), [search, access, role, courseFilter, per])
  React.useEffect(() => {
    if (!openMenu) return
    const close = () => setOpenMenu(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [openMenu])

  const filtersActive = access !== 'all' || role !== 'all' || courseFilter !== 'all' || !!search

  const filtered = users.filter((u) => {
    if (access === 'yes' && !u.hasAccess) return false
    if (access === 'no' && u.hasAccess) return false
    if (role !== 'all' && u.role !== role) return false
    if (courseFilter !== 'all' && !u.courses.some((c) => c.courseId === courseFilter)) return false
    if (search) {
      const q = search.toLowerCase()
      if (!`${u.full_name ?? ''} ${u.email}`.toLowerCase().includes(q)) return false
    }
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    let r = 0
    if (sortKey === 'name') r = (a.full_name || a.email).localeCompare(b.full_name || b.email)
    else if (sortKey === 'spent') r = a.spent - b.spent
    else r = a.created_at.localeCompare(b.created_at)
    return r * sortDir
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / per))
  const pageRows = sorted.slice((page - 1) * per, page * per)

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === 1 ? -1 : 1))
    else {
      setSortKey(k)
      setSortDir(1)
    }
  }

  function arrow(k: SortKey) {
    if (sortKey !== k) return <span className="th-arrow">↕</span>
    return <span className="th-arrow" style={{ opacity: 1 }}>{sortDir === 1 ? '↑' : '↓'}</span>
  }

  function toggleSel(id: string) {
    setSelected((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }
  function toggleAllOnPage() {
    setSelected((s) => {
      const n = new Set(s)
      const allSel = pageRows.every((u) => n.has(u.id))
      pageRows.forEach((u) => (allSel ? n.delete(u.id) : n.add(u.id)))
      return n
    })
  }

  function resetFilters() {
    setSearch('')
    setAccess('all')
    setRole('all')
    setCourseFilter('all')
  }

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

  async function enroll(userId: string, courseId: string, action: 'grant' | 'revoke') {
    try {
      await api('/api/admin/enrollments', { userId, courseId, action })
      toast.success(action === 'grant' ? 'Доступ выдан' : 'Доступ отозван')
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function bulkGrant(courseId: string) {
    setBusy(true)
    try {
      await Promise.all(
        Array.from(selected).map((id) => api('/api/admin/enrollments', { userId: id, courseId, action: 'grant' })),
      )
      toast.success(`Доступ выдан: ${selected.size}`)
      setSelected(new Set())
      setGrantFor(null)
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function bulkDelete() {
    if (!confirm(`Удалить выбранных учеников (${selected.size})? Действие необратимо.`)) return
    setBusy(true)
    try {
      await Promise.all(Array.from(selected).map((id) => api(`/api/admin/users/${id}`, undefined, 'DELETE')))
      toast.success('Удалено')
      setSelected(new Set())
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function setRoleFor(u: User, newRole: 'student' | 'admin') {
    try {
      await api(`/api/admin/users/${u.id}`, { role: newRole }, 'PATCH')
      toast.success(newRole === 'admin' ? 'Назначен админом' : 'Роль снята')
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function deleteUser(u: User) {
    if (!confirm(`Удалить ${u.full_name || u.email}? Действие необратимо.`)) return
    try {
      await api(`/api/admin/users/${u.id}`, undefined, 'DELETE')
      toast.success('Ученик удалён')
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  function exportCsv() {
    const rows = [
      ['Имя', 'Email', 'Роль', 'Курсы', 'Покупки', 'Регистрация'],
      ...sorted.map((u) => [
        u.full_name || '',
        u.email,
        u.role,
        u.courses.map((c) => c.title).join('; '),
        String(u.spent / 100),
        u.created_at,
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'users.csv'
    a.click()
  }

  return (
    <>
      <PageHeader title="Ученики" subtitle="Все пользователи системы и их доступы">
        <button className="btn btn-outline" onClick={exportCsv}>
          <Download size={16} />
          Экспорт CSV
        </button>
        <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          <UserPlus size={16} />
          Добавить ученика
        </button>
      </PageHeader>

      <div className="table-wrap">
        <div className="toolbar">
          <div className="input-wrap" style={{ maxWidth: 260, flex: 1 }}>
            <Search size={16} />
            <input
              className="input has-icon"
              placeholder="Поиск по имени или email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="select auto" value={access} onChange={(e) => setAccess(e.target.value)}>
            <option value="all">Доступ: все</option>
            <option value="yes">Есть доступ</option>
            <option value="no">Без доступа</option>
          </select>
          <select className="select auto" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="all">Роль: все</option>
            <option value="student">Ученик</option>
            <option value="admin">Админ</option>
          </select>
          <select className="select auto" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
            <option value="all">Курс: любой</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          {filtersActive && (
            <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
              Сбросить
            </button>
          )}
        </div>

        {selected.size > 0 && (
          <div
            className="toolbar"
            style={{ background: 'var(--primary-soft)', borderBottom: '1px solid var(--border-2)' }}
          >
            <strong style={{ fontSize: 13 }}>Выбрано: {selected.size}</strong>
            <button className="btn btn-outline btn-sm" onClick={() => setGrantFor('bulk')} disabled={busy}>
              <Plus size={14} />
              Дать доступ
            </button>
            <button className="btn btn-danger-outline btn-sm" onClick={bulkDelete} disabled={busy}>
              <Trash2 size={14} />
              Удалить
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>
              Снять выбор
            </button>
          </div>
        )}

        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <input
                  type="checkbox"
                  className="row-check"
                  checked={pageRows.length > 0 && pageRows.every((u) => selected.has(u.id))}
                  onChange={toggleAllOnPage}
                />
              </th>
              <th className="sortable sorted" onClick={() => toggleSort('name')}>
                Ученик {arrow('name')}
              </th>
              <th>Курсы</th>
              <th>Прогресс</th>
              <th className="sortable" onClick={() => toggleSort('spent')}>
                Покупки {arrow('spent')}
              </th>
              <th className="sortable" onClick={() => toggleSort('created')}>
                Регистрация {arrow('created')}
              </th>
              <th>Активность</th>
              <th style={{ width: 44 }} />
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--ink-3)', padding: 40 }}>
                  Никого не найдено
                </td>
              </tr>
            ) : (
              pageRows.map((u) => (
                <tr key={u.id} className="clickable" onClick={() => router.push(`/admin/users/${u.id}`)}>
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="row-check"
                      checked={selected.has(u.id)}
                      onChange={() => toggleSel(u.id)}
                    />
                  </td>
                  <td>
                    <div className="cell-user">
                      <span className="ava s32">{(u.full_name || u.email)[0].toUpperCase()}</span>
                      <div>
                        <div className="cu-name">
                          {u.full_name || '—'}
                          {u.role === 'admin' && (
                            <span className="badge blue" style={{ marginLeft: 8 }}>
                              Админ
                            </span>
                          )}
                        </div>
                        <div className="cu-sub">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="chips">
                      {u.courses.length === 0 ? (
                        <span className="cell-muted">—</span>
                      ) : u.courses.length <= 2 ? (
                        u.courses.map((c) => (
                          <span className="chip" key={c.courseId}>
                            {c.title}
                            <button onClick={() => enroll(u.id, c.courseId, 'revoke')} title="Отозвать">
                              <X size={12} />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="badge gray" title={u.courses.map((c) => c.title).join(', ')}>
                          {u.courses.length} курса
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {u.hasAccess ? (
                      <div className="cell-prog">
                        <div className="prog">
                          <div className="bar" style={{ width: `${u.progress}%` }} />
                        </div>
                        <span className="pct">{u.progress}%</span>
                      </div>
                    ) : (
                      <span className="cell-muted">—</span>
                    )}
                  </td>
                  <td className="cell-strong">{u.spent ? formatPrice(u.spent) : <span className="cell-muted">—</span>}</td>
                  <td className="cell-muted">{format(new Date(u.created_at), 'd MMM yyyy', { locale: ru })}</td>
                  <td className="cell-muted">{timeAgo(u.last_login_at)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className={`dd${openMenu === u.id ? ' open' : ''}`}>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenu(openMenu === u.id ? null : u.id)
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      <div className="dd-menu">
                        <button className="dd-item" onClick={() => router.push(`/admin/users/${u.id}`)}>
                          <Eye size={15} />
                          Профиль
                        </button>
                        <button className="dd-item" onClick={() => { setGrantFor(u); setGrantCourse(courses[0]?.id || '') }}>
                          <Plus size={15} />
                          Дать доступ
                        </button>
                        <button className="dd-item" onClick={() => { setPwFor(u); setPw(genPassword()) }}>
                          <KeyRound size={15} />
                          Сменить пароль
                        </button>
                        <div className="dd-sep" />
                        <button className="dd-item" onClick={() => setRoleFor(u, u.role === 'admin' ? 'student' : 'admin')}>
                          <Shield size={15} />
                          {u.role === 'admin' ? 'Убрать из админов' : 'Сделать админом'}
                        </button>
                        <div className="dd-sep" />
                        <button className="dd-item danger" onClick={() => deleteUser(u)}>
                          <Trash2 size={15} />
                          Удалить
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="pagination">
          <div className="pg-info">
            Показано {sorted.length === 0 ? 0 : (page - 1) * per + 1}–{Math.min(page * per, sorted.length)} из{' '}
            {sorted.length}
          </div>
          <div className="pg-ctrl">
            <select className="select sm auto" value={per} onChange={(e) => setPer(Number(e.target.value))}>
              <option value={20}>20 / стр.</option>
              <option value={50}>50 / стр.</option>
              <option value={100}>100 / стр.</option>
            </select>
            <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Назад
            </button>
            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
              {page} / {totalPages}
            </span>
            <button
              className="btn btn-outline btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Вперёд
            </button>
          </div>
        </div>
      </div>

      {/* Grant access modal (single or bulk) */}
      <AdminModal
        open={!!grantFor}
        onClose={() => setGrantFor(null)}
        title="Выдать доступ к курсу"
        subtitle={grantFor === 'bulk' ? `Выбрано учеников: ${selected.size}` : grantFor ? grantFor.email : ''}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setGrantFor(null)}>
              Отмена
            </button>
            <button
              className="btn btn-primary"
              disabled={busy || !grantCourse}
              onClick={() =>
                grantFor === 'bulk'
                  ? bulkGrant(grantCourse)
                  : grantFor && enroll(grantFor.id, grantCourse, 'grant').then(() => setGrantFor(null))
              }
            >
              {busy ? 'Выдаём…' : 'Выдать доступ'}
            </button>
          </>
        }
      >
        <div className="field">
          <label>Курс</label>
          <select className="select" value={grantCourse} onChange={(e) => setGrantCourse(e.target.value)}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <div className="hint">Ученик получит письмо с уведомлением о доступе.</div>
        </div>
      </AdminModal>

      {/* Change password modal */}
      <AdminModal
        open={!!pwFor}
        onClose={() => setPwFor(null)}
        title="Сменить пароль"
        subtitle={pwFor?.email}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setPwFor(null)}>
              Отмена
            </button>
            <button
              className="btn btn-primary"
              disabled={busy || pw.length < 6}
              onClick={async () => {
                if (!pwFor) return
                setBusy(true)
                try {
                  await api(`/api/admin/users/${pwFor.id}/password`, { password: pw })
                  toast.success('Пароль изменён')
                  setPwFor(null)
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
          <div className="hint">Сообщите новый пароль ученику вручную.</div>
        </div>
      </AdminModal>

      <CreateUserModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        courses={courses}
        onCreated={() => {
          setCreateOpen(false)
          router.refresh()
        }}
      />
    </>
  )
}

function CreateUserModal({
  open,
  onClose,
  courses,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  courses: Course[]
  onCreated: () => void
}) {
  const [fullName, setFullName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState(genPassword())
  const [phone, setPhone] = React.useState('')
  const [grant, setGrant] = React.useState(true)
  const [grantCourse, setGrantCourse] = React.useState(courses[0]?.id || '')
  const [sendWelcome, setSendWelcome] = React.useState(true)
  const [busy, setBusy] = React.useState(false)

  async function submit() {
    setBusy(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          password,
          phone: phone || undefined,
          grantCourseId: grant ? grantCourse : undefined,
          sendWelcome: grant && sendWelcome,
        }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Ошибка')
      toast.success('Ученик создан')
      setFullName('')
      setEmail('')
      setPassword(genPassword())
      setPhone('')
      onCreated()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Новый ученик"
      subtitle="Создаётся подтверждённый аккаунт"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Отмена
          </button>
          <button className="btn btn-primary" disabled={busy || !email || !fullName || password.length < 6} onClick={submit}>
            {busy ? 'Создаём…' : 'Создать ученика'}
          </button>
        </>
      }
    >
      <div className="field">
        <label>
          Имя и фамилия <span className="req">*</span>
        </label>
        <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Александр Петров" />
      </div>
      <div className="field">
        <label>
          Email <span className="req">*</span>
        </label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <div className="field">
        <label>Телефон</label>
        <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (704) 555-0142" />
      </div>
      <div className="field">
        <label>
          Пароль <span className="req">*</span>
        </label>
        <div className="row" style={{ gap: 8 }}>
          <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="btn btn-outline btn-sm" type="button" onClick={() => setPassword(genPassword())}>
            <RefreshCw size={14} />
            Сгенерировать
          </button>
        </div>
      </div>
      <div className="switch-row">
        <div className="sr-text">
          Сразу дать доступ к курсу
          <div className="sr-sub">создаст enrollment вручную</div>
        </div>
        <label className="switch">
          <input type="checkbox" checked={grant} onChange={(e) => setGrant(e.target.checked)} />
          <span className="track" />
        </label>
      </div>
      {grant && (
        <>
          <div className="field" style={{ marginTop: 14 }}>
            <select className="select" value={grantCourse} onChange={(e) => setGrantCourse(e.target.value)}>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="switch-row">
            <div className="sr-text">Отправить welcome-email с доступом</div>
            <label className="switch">
              <input type="checkbox" checked={sendWelcome} onChange={(e) => setSendWelcome(e.target.checked)} />
              <span className="track" />
            </label>
          </div>
        </>
      )}
    </AdminModal>
  )
}
