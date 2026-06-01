'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Download, Search, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { PageHeader } from '@/components/admin/page-header'
import { AdminModal } from '@/components/admin/modal'

type Enr = { courseId: string; title: string }
type User = {
  id: string
  full_name: string | null
  email: string
  role: string
  created_at: string
  courses: Enr[]
}
type Course = { id: string; title: string }

export function UsersView({ users, courses }: { users: User[]; courses: Course[] }) {
  const router = useRouter()
  const [q, setQ] = React.useState('')
  const [grantFor, setGrantFor] = React.useState<User | null>(null)
  const [grantCourse, setGrantCourse] = React.useState(courses[0]?.id || '')
  const [busy, setBusy] = React.useState(false)

  const filtered = users.filter(
    (u) =>
      (u.full_name || '').toLowerCase().includes(q.toLowerCase()) ||
      u.email.toLowerCase().includes(q.toLowerCase()),
  )

  async function enroll(userId: string, courseId: string, action: 'grant' | 'revoke') {
    setBusy(true)
    const res = await fetch('/api/admin/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, courseId, action }),
    })
    const d = await res.json()
    setBusy(false)
    if (!res.ok) toast.error(d.error || 'Ошибка')
    else {
      toast.success(action === 'grant' ? 'Доступ выдан' : 'Доступ отозван')
      setGrantFor(null)
      router.refresh()
    }
  }

  function exportCsv() {
    const rows = [
      ['Имя', 'Email', 'Роль', 'Курсы', 'Регистрация'],
      ...users.map((u) => [
        u.full_name || '',
        u.email,
        u.role,
        u.courses.map((c) => c.title).join('; '),
        u.created_at,
      ]),
    ]
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'users.csv'
    a.click()
  }

  return (
    <>
      <PageHeader title="Ученики" subtitle={`Всего: ${users.length}`}>
        <button className="btn btn-outline" onClick={exportCsv}>
          <Download size={16} />
          Экспорт CSV
        </button>
      </PageHeader>
      <div className="table-wrap">
        <div className="toolbar">
          <div className="input-wrap" style={{ maxWidth: 300 }}>
            <Search size={16} />
            <input
              className="input has-icon"
              placeholder="Поиск по имени или email"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Ученик</th>
              <th>Курсы</th>
              <th>Регистрация</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="cell-user">
                    <span className="ava s32">{(u.full_name || u.email)[0].toUpperCase()}</span>
                    <div>
                      <div className="cu-name">
                        {u.full_name || '—'}
                        {u.role === 'admin' && (
                          <span className="badge gold" style={{ marginLeft: 8 }}>
                            admin
                          </span>
                        )}
                      </div>
                      <div className="cu-sub">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="chips">
                    {u.courses.length === 0 ? (
                      <span className="cell-muted">—</span>
                    ) : (
                      u.courses.map((c) => (
                        <span className="chip" key={c.courseId}>
                          {c.title}
                          <button onClick={() => enroll(u.id, c.courseId, 'revoke')} title="Отозвать">
                            <X size={12} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td className="cell-muted">
                  {format(new Date(u.created_at), 'd MMM yyyy', { locale: ru })}
                </td>
                <td>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setGrantFor(u)
                      setGrantCourse(courses[0]?.id || '')
                    }}
                  >
                    <Plus size={14} />
                    Доступ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {grantFor && (
        <AdminModal
          open
          onClose={() => setGrantFor(null)}
          title="Выдать доступ к курсу"
          subtitle={grantFor.email}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setGrantFor(null)}>
                Отмена
              </button>
              <button
                className="btn btn-primary"
                onClick={() => enroll(grantFor.id, grantCourse, 'grant')}
                disabled={busy || !grantCourse}
              >
                {busy ? 'Выдаём…' : 'Выдать доступ'}
              </button>
            </>
          }
        >
          <div className="field">
            <label>Курс</label>
            <select
              className="select"
              value={grantCourse}
              onChange={(e) => setGrantCourse(e.target.value)}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="hint">Ученик получит письмо с уведомлением о доступе.</div>
        </AdminModal>
      )}
    </>
  )
}
