'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/page-header'
import { AdminModal } from '@/components/admin/modal'

type F = {
  id: string
  question: string
  answer: string
  is_published: boolean
  position: number
}

export function FaqView({ items, courseId }: { items: F[]; courseId: string }) {
  const router = useRouter()
  const [edit, setEdit] = React.useState<Partial<F> | null>(null)
  const [busy, setBusy] = React.useState(false)

  async function save() {
    if (!edit) return
    setBusy(true)
    const isNew = !edit.id
    const url = isNew ? '/api/admin/faq' : `/api/admin/faq/${edit.id}`
    const body = isNew
      ? {
          course_id: courseId,
          question: edit.question,
          answer: edit.answer,
          position: items.length,
          is_published: true,
        }
      : { question: edit.question, answer: edit.answer }
    const res = await fetch(url, {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const d = await res.json()
    setBusy(false)
    if (!res.ok) toast.error(d.error || 'Ошибка')
    else {
      toast.success('Сохранено')
      setEdit(null)
      router.refresh()
    }
  }

  async function del(id: string) {
    if (!confirm('Удалить вопрос?')) return
    const res = await fetch(`/api/admin/faq/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Удалено')
      router.refresh()
    } else toast.error('Ошибка')
  }

  async function togglePub(f: F) {
    const res = await fetch(`/api/admin/faq/${f.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !f.is_published }),
    })
    if (res.ok) router.refresh()
  }

  return (
    <>
      <PageHeader title="FAQ" subtitle={`${items.length} вопросов`}>
        <button className="btn btn-primary" onClick={() => setEdit({})}>
          <Plus size={16} />
          Добавить вопрос
        </button>
      </PageHeader>
      <div className="card">
        <div className="card-body">
          {items.length === 0 && (
            <div style={{ color: 'var(--ink-3)', fontSize: 13, padding: 8 }}>
              Пока нет вопросов
            </div>
          )}
          {items.map((f, i) => (
            <div
              key={f.id}
              style={{ padding: '14px 0', borderTop: i ? '1px solid var(--border-2)' : 'none' }}
            >
              <div className="between">
                <div style={{ fontWeight: 600, fontSize: 14 }}>{f.question}</div>
                <div className="row" style={{ gap: 4 }}>
                  <label className="switch">
                    <input type="checkbox" checked={f.is_published} onChange={() => togglePub(f)} />
                    <span className="track" />
                  </label>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setEdit(f)}>
                    <Pencil size={14} />
                  </button>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => del(f.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 6 }}>{f.answer}</div>
            </div>
          ))}
        </div>
      </div>

      {edit && (
        <AdminModal
          open
          onClose={() => setEdit(null)}
          title={edit.id ? 'Редактировать вопрос' : 'Новый вопрос'}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setEdit(null)}>
                Отмена
              </button>
              <button className="btn btn-primary" onClick={save} disabled={busy}>
                {busy ? 'Сохраняем…' : 'Сохранить'}
              </button>
            </>
          }
        >
          <div className="field">
            <label>Вопрос</label>
            <input
              className="input"
              value={edit.question || ''}
              onChange={(e) => setEdit({ ...edit, question: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Ответ</label>
            <textarea
              className="textarea"
              value={edit.answer || ''}
              onChange={(e) => setEdit({ ...edit, answer: e.target.value })}
            />
          </div>
        </AdminModal>
      )}
    </>
  )
}
