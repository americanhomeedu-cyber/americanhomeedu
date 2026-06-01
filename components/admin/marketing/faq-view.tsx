'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, GripVertical, ChevronDown, HelpCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PageHeader } from '@/components/admin/page-header'
import { AdminModal } from '@/components/admin/modal'

type F = {
  id: string
  question: string
  answer: string
  is_published: boolean
  position: number
}

function SortableFaq({
  f,
  index,
  open,
  onToggleOpen,
  onEdit,
  onDelete,
  onTogglePub,
}: {
  f: F
  index: number
  open: boolean
  onToggleOpen: () => void
  onEdit: () => void
  onDelete: () => void
  onTogglePub: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: f.id })
  return (
    <div
      ref={setNodeRef}
      className="card card-pad"
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="between">
        <div className="row" style={{ gap: 12, minWidth: 0 }}>
          <button className="blk-grip" style={{ cursor: 'grab' }} {...attributes} {...listeners} aria-label="Перетащить">
            <GripVertical size={15} />
          </button>
          <span style={{ fontFamily: 'var(--serif)', fontWeight: 700, color: '#9A7B3F', flex: 'none' }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <button
            onClick={onToggleOpen}
            style={{ fontWeight: 600, fontSize: 14, background: 'none', border: 'none', textAlign: 'left', minWidth: 0 }}
          >
            {f.question}
          </button>
        </div>
        <div className="row" style={{ gap: 6, flex: 'none' }}>
          <span className={`badge ${f.is_published ? 'green' : 'gray'}`}>
            {f.is_published ? 'Опубликован' : 'Черновик'}
          </span>
          <label className="switch">
            <input type="checkbox" checked={f.is_published} onChange={onTogglePub} />
            <span className="track" />
          </label>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onEdit}>
            <Pencil size={14} />
          </button>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onDelete}>
            <Trash2 size={14} />
          </button>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onToggleOpen}>
            <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
          </button>
        </div>
      </div>
      <div style={{ maxHeight: open ? 400 : 0, overflow: 'hidden', transition: 'max-height .25s' }}>
        <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 12, paddingLeft: 39 }}>{f.answer}</div>
      </div>
    </div>
  )
}

export function FaqView({ items, courseId }: { items: F[]; courseId: string }) {
  const router = useRouter()
  const [list, setList] = React.useState(items)
  const [open, setOpen] = React.useState<string | null>(null)
  const [edit, setEdit] = React.useState<Partial<F> | null>(null)
  const [busy, setBusy] = React.useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  React.useEffect(() => setList(items), [items])

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const next = arrayMove(
      list,
      list.findIndex((f) => f.id === active.id),
      list.findIndex((f) => f.id === over.id),
    )
    setList(next)
    await fetch('/api/admin/faq/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: next.map((f) => f.id) }),
    })
    toast.success('Порядок сохранён')
  }

  async function save() {
    if (!edit) return
    setBusy(true)
    const isNew = !edit.id
    const url = isNew ? '/api/admin/faq' : `/api/admin/faq/${edit.id}`
    const body = isNew
      ? { course_id: courseId, question: edit.question, answer: edit.answer, position: list.length, is_published: edit.is_published ?? true }
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
    setList((l) => l.map((x) => (x.id === f.id ? { ...x, is_published: !x.is_published } : x)))
    await fetch(`/api/admin/faq/${f.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !f.is_published }),
    })
    router.refresh()
  }

  return (
    <>
      <PageHeader title="FAQ" subtitle="Часто задаваемые вопросы для лендинга">
        <button className="btn btn-primary" onClick={() => setEdit({ is_published: true })}>
          <Plus size={16} />
          Добавить вопрос
        </button>
      </PageHeader>

      {list.length === 0 ? (
        <div className="empty">
          <div className="em-ic">
            <HelpCircle size={28} />
          </div>
          <h3>Нет вопросов</h3>
          <p>Добавьте первый вопрос для лендинга.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={list.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            <div style={{ display: 'grid', gap: 10, maxWidth: 820 }}>
              {list.map((f, i) => (
                <SortableFaq
                  key={f.id}
                  f={f}
                  index={i}
                  open={open === f.id}
                  onToggleOpen={() => setOpen(open === f.id ? null : f.id)}
                  onEdit={() => setEdit(f)}
                  onDelete={() => del(f.id)}
                  onTogglePub={() => togglePub(f)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

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
              <button className="btn btn-primary" onClick={save} disabled={busy || !edit.question}>
                {busy ? 'Сохраняем…' : 'Сохранить'}
              </button>
            </>
          }
        >
          <div className="field">
            <label>Вопрос <span className="req">*</span></label>
            <input
              className="input"
              maxLength={200}
              value={edit.question || ''}
              onChange={(e) => setEdit({ ...edit, question: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Ответ</label>
            <textarea className="textarea" value={edit.answer || ''} onChange={(e) => setEdit({ ...edit, answer: e.target.value })} />
          </div>
          {!edit.id && (
            <div className="switch-row">
              <div className="sr-text">Опубликовать сразу</div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={edit.is_published ?? true}
                  onChange={(e) => setEdit({ ...edit, is_published: e.target.checked })}
                />
                <span className="track" />
              </label>
            </div>
          )}
        </AdminModal>
      )}
    </>
  )
}
