'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Star, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/page-header'
import { AdminModal } from '@/components/admin/modal'

type T = {
  id: string
  name: string
  city: string | null
  rating: number
  text: string
  tag: string | null
  is_published: boolean
}

export function TestimonialsView({
  items,
  courseId,
}: {
  items: T[]
  courseId: string
}) {
  const router = useRouter()
  const [edit, setEdit] = React.useState<Partial<T> | null>(null)
  const [busy, setBusy] = React.useState(false)

  async function save() {
    if (!edit) return
    setBusy(true)
    const isNew = !edit.id
    const url = isNew ? '/api/admin/testimonials' : `/api/admin/testimonials/${edit.id}`
    const body = isNew
      ? {
          course_id: courseId,
          name: edit.name,
          city: edit.city,
          rating: edit.rating || 5,
          text: edit.text,
          tag: edit.tag,
          is_published: edit.is_published ?? true,
        }
      : {
          name: edit.name,
          city: edit.city || null,
          rating: edit.rating,
          text: edit.text,
          tag: edit.tag || null,
        }
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
    if (!confirm('Удалить отзыв?')) return
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Удалено')
      router.refresh()
    } else toast.error('Ошибка')
  }

  async function togglePub(t: T) {
    const res = await fetch(`/api/admin/testimonials/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !t.is_published }),
    })
    if (res.ok) router.refresh()
  }

  return (
    <>
      <PageHeader title="Отзывы" subtitle={`${items.length} отзывов`}>
        <button className="btn btn-primary" onClick={() => setEdit({ rating: 5, is_published: true })}>
          <Plus size={16} />
          Добавить отзыв
        </button>
      </PageHeader>
      <div className="grid-3">
        {items.map((t) => (
          <div className="card" key={t.id}>
            <div className="card-body">
              <div className="between">
                <div className="row" style={{ gap: 3, color: 'var(--accent)' }}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <div className="row" style={{ gap: 4 }}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setEdit(t)}>
                    <Pencil size={14} />
                  </button>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => del(t.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 14, margin: '12px 0', color: 'var(--ink)' }}>«{t.text}»</p>
              <div className="between">
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{t.name}</div>
                  <div className="cell-sub">
                    {t.city || ''}
                    {t.tag ? ` · ${t.tag}` : ''}
                  </div>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={t.is_published} onChange={() => togglePub(t)} />
                  <span className="track" />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {edit && (
        <AdminModal
          open
          onClose={() => setEdit(null)}
          title={edit.id ? 'Редактировать отзыв' : 'Новый отзыв'}
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
            <label>Имя</label>
            <input className="input" value={edit.name || ''} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Город</label>
            <input className="input" value={edit.city || ''} onChange={(e) => setEdit({ ...edit, city: e.target.value })} />
          </div>
          <div className="field">
            <label>Оценка (1–5)</label>
            <input
              className="input"
              type="number"
              min={1}
              max={5}
              value={edit.rating ?? 5}
              onChange={(e) => setEdit({ ...edit, rating: parseInt(e.target.value) || 5 })}
            />
          </div>
          <div className="field">
            <label>Тег</label>
            <input className="input" value={edit.tag || ''} onChange={(e) => setEdit({ ...edit, tag: e.target.value })} />
          </div>
          <div className="field">
            <label>Текст</label>
            <textarea className="textarea" value={edit.text || ''} onChange={(e) => setEdit({ ...edit, text: e.target.value })} />
          </div>
        </AdminModal>
      )}
    </>
  )
}
