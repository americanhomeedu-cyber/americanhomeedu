'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Star, Pencil, Trash2, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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

const TAGS = ['First-time buyer', 'Relocation', 'Investor', 'Refinance', 'Other']

function Stars({ n, size = 14 }: { n: number; size?: number }) {
  return (
    <div className="row" style={{ gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < n ? '#C9A96E' : 'none'}
          style={{ color: i < n ? '#C9A96E' : 'var(--border)' }}
          strokeWidth={i < n ? 0 : 2}
        />
      ))}
    </div>
  )
}

function SortableCard({
  t,
  dragEnabled,
  onEdit,
  onDelete,
  onToggle,
}: {
  t: T
  dragEnabled: boolean
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: t.id,
    disabled: !dragEnabled,
  })
  return (
    <div
      ref={setNodeRef}
      className="card"
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="card-body">
        <div className="between">
          <div className="row" style={{ gap: 6 }}>
            {dragEnabled && (
              <button
                className="blk-grip"
                style={{ cursor: 'grab' }}
                {...attributes}
                {...listeners}
                aria-label="Перетащить"
              >
                <GripVertical size={15} />
              </button>
            )}
            <Stars n={t.rating} />
          </div>
          <div className="row" style={{ gap: 4 }}>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={onEdit}>
              <Pencil size={14} />
            </button>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={onDelete}>
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
          <div className="row" style={{ gap: 8 }}>
            <span className={`badge ${t.is_published ? 'green' : 'gray'}`}>
              {t.is_published ? 'Опубликован' : 'Черновик'}
            </span>
            <label className="switch">
              <input type="checkbox" checked={t.is_published} onChange={onToggle} />
              <span className="track" />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TestimonialsView({ items, courseId }: { items: T[]; courseId: string }) {
  const router = useRouter()
  const [list, setList] = React.useState(items)
  const [filter, setFilter] = React.useState<'all' | 'published' | 'draft'>('all')
  const [edit, setEdit] = React.useState<Partial<T> | null>(null)
  const [busy, setBusy] = React.useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  React.useEffect(() => setList(items), [items])

  const filtered = list.filter((t) =>
    filter === 'all' ? true : filter === 'published' ? t.is_published : !t.is_published,
  )
  const dragEnabled = filter === 'all'

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = list.findIndex((t) => t.id === active.id)
    const newIdx = list.findIndex((t) => t.id === over.id)
    const next = arrayMove(list, oldIdx, newIdx)
    setList(next)
    await fetch('/api/admin/testimonials/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: next.map((t) => t.id) }),
    })
    toast.success('Порядок сохранён')
  }

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
      : { name: edit.name, city: edit.city || null, rating: edit.rating, text: edit.text, tag: edit.tag || null }
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
    setList((l) => l.map((x) => (x.id === t.id ? { ...x, is_published: !x.is_published } : x)))
    await fetch(`/api/admin/testimonials/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !t.is_published }),
    })
    router.refresh()
  }

  return (
    <>
      <PageHeader title="Отзывы" subtitle="Отзывы клиентов для отображения на лендинге">
        <button className="btn btn-primary" onClick={() => setEdit({ rating: 5, is_published: true })}>
          <Plus size={16} />
          Добавить отзыв
        </button>
      </PageHeader>

      <div className="chips" style={{ marginBottom: 20 }}>
        {(
          [
            ['all', 'Все'],
            ['published', 'Опубликованные'],
            ['draft', 'Черновики'],
          ] as const
        ).map(([k, l]) => (
          <button key={k} className={`chip filter-tab${filter === k ? ' active' : ''}`} onClick={() => setFilter(k)}>
            {l}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="em-ic">
            <Star size={28} />
          </div>
          <h3>Нет отзывов</h3>
          <p>Добавьте первый отзыв для лендинга.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={filtered.map((t) => t.id)} strategy={rectSortingStrategy}>
            <div className="grid-3">
              {filtered.map((t) => (
                <SortableCard
                  key={t.id}
                  t={t}
                  dragEnabled={dragEnabled}
                  onEdit={() => setEdit(t)}
                  onDelete={() => del(t.id)}
                  onToggle={() => togglePub(t)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {edit && (
        <AdminModal
          open
          lg
          onClose={() => setEdit(null)}
          title={edit.id ? 'Редактировать отзыв' : 'Новый отзыв'}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setEdit(null)}>
                Отмена
              </button>
              <button className="btn btn-primary" onClick={save} disabled={busy || !edit.name || !edit.text}>
                {busy ? 'Сохраняем…' : 'Сохранить'}
              </button>
            </>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <div className="field">
                <label>Имя <span className="req">*</span></label>
                <input className="input" value={edit.name || ''} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Город</label>
                <input className="input" value={edit.city || ''} onChange={(e) => setEdit({ ...edit, city: e.target.value })} />
              </div>
              <div className="field">
                <label>Оценка</label>
                <div className="row" style={{ gap: 4 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setEdit({ ...edit, rating: i + 1 })}
                      style={{ background: 'none', border: 'none', padding: 2 }}
                    >
                      <Star
                        size={22}
                        fill={i < (edit.rating ?? 5) ? '#C9A96E' : 'none'}
                        style={{ color: i < (edit.rating ?? 5) ? '#C9A96E' : 'var(--border)' }}
                        strokeWidth={i < (edit.rating ?? 5) ? 0 : 2}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Тег</label>
                <select className="select" value={edit.tag || ''} onChange={(e) => setEdit({ ...edit, tag: e.target.value })}>
                  <option value="">— без тега —</option>
                  {TAGS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Текст <span className="req">*</span></label>
                <textarea
                  className="textarea"
                  maxLength={500}
                  value={edit.text || ''}
                  onChange={(e) => setEdit({ ...edit, text: e.target.value })}
                />
                <div className="hint">{(edit.text || '').length} / 500</div>
              </div>
              <div className="switch-row">
                <div className="sr-text">Опубликовать</div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={edit.is_published ?? true}
                    onChange={(e) => setEdit({ ...edit, is_published: e.target.checked })}
                  />
                  <span className="track" />
                </label>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-3)' }}>
                Превью
              </label>
              <div className="card card-pad" style={{ marginTop: 10 }}>
                <Stars n={edit.rating ?? 5} />
                <p style={{ fontSize: 14, margin: '12px 0', color: 'var(--ink)' }}>
                  «{edit.text || 'Текст отзыва появится здесь…'}»
                </p>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{edit.name || 'Имя клиента'}</div>
                <div className="cell-sub">
                  {edit.city || 'Город'}
                  {edit.tag ? ` · ${edit.tag}` : ''}
                </div>
              </div>
            </div>
          </div>
        </AdminModal>
      )}
    </>
  )
}
