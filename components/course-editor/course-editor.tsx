'use client'

import * as React from 'react'
import Link from 'next/link'
import { nanoid } from 'nanoid'
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
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Trash2, Settings } from 'lucide-react'
import { BlockEditor } from './block-editor'
import type { Block, BlockType } from '@/types/blocks'

type Section = {
  id: string
  title: string
  blocks: Block[]
  is_published: boolean
  position: number
  estimated_minutes: number | null
}

const BLOCK_TYPES: { type: BlockType; label: string }[] = [
  { type: 'heading', label: 'Заголовок' },
  { type: 'text', label: 'Текст' },
  { type: 'image', label: 'Картинка' },
  { type: 'video', label: 'Видео' },
  { type: 'list', label: 'Список' },
  { type: 'callout', label: 'Выноска' },
  { type: 'link', label: 'Ссылка' },
  { type: 'button', label: 'Кнопка' },
  { type: 'file', label: 'Файл' },
  { type: 'divider', label: 'Разделитель' },
]

function blankBlock(type: BlockType): Block {
  const id = nanoid()
  switch (type) {
    case 'heading':
      return { id, type, level: 2, text: '' }
    case 'text':
      return { id, type, html: '<p></p>' }
    case 'list':
      return { id, type, ordered: false, items: [''] }
    case 'callout':
      return { id, type, variant: 'info', text: '' }
    case 'video':
      return { id, type, url: '' }
    case 'image':
      return { id, type, url: '' }
    case 'link':
      return { id, type, title: '', url: '' }
    case 'button':
      return { id, type, label: '', url: '' }
    case 'file':
      return { id, type, name: '' }
    case 'divider':
      return { id, type }
  }
}

function SectionRow({
  section,
  active,
  index,
  onSelect,
}: {
  section: Section
  active: boolean
  index: number
  onSelect: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  return (
    <div ref={setNodeRef} style={style}>
      <div className={`course-sec${active ? ' active' : ''}`} onClick={onSelect}>
        <span className="cs-grip" {...attributes} {...listeners} onClick={(e) => e.stopPropagation()}>
          <GripVertical size={14} />
        </span>
        <span className="cs-num">{index + 1}</span>
        <div className="cs-mid">
          <div className="cs-title">{section.title || 'Без названия'}</div>
          <div className="cs-meta">{section.blocks.length} блоков</div>
        </div>
        <span
          className="cs-dot"
          style={{ background: section.is_published ? 'var(--success)' : 'var(--ink-3)' }}
        />
      </div>
    </div>
  )
}

function BlockCard({
  block,
  onChange,
  onDelete,
}: {
  block: Block
  onChange: (b: Block) => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id! })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  const label = BLOCK_TYPES.find((b) => b.type === block.type)?.label ?? block.type
  return (
    <div ref={setNodeRef} style={style} className="card" data-block>
      <div className="card-body" style={{ padding: 14 }}>
        <div className="between" style={{ marginBottom: 10 }}>
          <div className="row" style={{ gap: 8 }}>
            <span {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--ink-3)', display: 'flex' }}>
              <GripVertical size={15} />
            </span>
            <span className="cell-sub" style={{ fontWeight: 600 }}>{label}</span>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onDelete}>
            <Trash2 size={14} />
          </button>
        </div>
        <BlockEditor block={block} onChange={onChange} />
      </div>
    </div>
  )
}

export function CourseEditor({
  courseId,
  courseTitle,
  initialSections,
}: {
  courseId: string
  courseTitle: string
  initialSections: Section[]
}) {
  const [sections, setSections] = React.useState<Section[]>(initialSections)
  const [activeId, setActiveId] = React.useState<string>(initialSections[0]?.id ?? '')
  const [saveState, setSaveState] = React.useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [addOpen, setAddOpen] = React.useState(false)

  const sectionsRef = React.useRef(sections)
  React.useEffect(() => {
    sectionsRef.current = sections
  }, [sections])
  const dirty = React.useRef<Set<string>>(new Set())
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const active = sections.find((s) => s.id === activeId)

  const flush = React.useCallback(async () => {
    const ids = Array.from(dirty.current)
    dirty.current.clear()
    if (!ids.length) return
    setSaveState('saving')
    await Promise.all(
      ids.map((id) => {
        const s = sectionsRef.current.find((x) => x.id === id)
        if (!s) return Promise.resolve()
        return fetch(`/api/admin/sections/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: s.title,
            blocks: s.blocks,
            is_published: s.is_published,
            estimated_minutes: s.estimated_minutes,
          }),
        })
      }),
    )
    setSaveState('saved')
  }, [])

  const scheduleSave = React.useCallback(
    (id: string) => {
      dirty.current.add(id)
      setSaveState('unsaved')
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(flush, 1500)
    },
    [flush],
  )

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        flush()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [flush])

  function patchSection(id: string, patch: Partial<Section>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
    scheduleSave(id)
  }

  async function addSection() {
    const res = await fetch(`/api/admin/courses/${courseId}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Новый раздел', position: sections.length }),
    })
    const data = await res.json()
    if (res.ok) {
      const sec: Section = { ...data, blocks: [] }
      setSections((p) => [...p, sec])
      setActiveId(sec.id)
    }
  }

  async function deleteSection(id: string) {
    if (!confirm('Удалить раздел?')) return
    await fetch(`/api/admin/sections/${id}`, { method: 'DELETE' })
    setSections((p) => p.filter((s) => s.id !== id))
    if (activeId === id) setActiveId(sections[0]?.id ?? '')
  }

  function addBlock(type: BlockType) {
    if (!active) return
    patchSection(active.id, { blocks: [...active.blocks, blankBlock(type)] })
    setAddOpen(false)
  }

  function updateBlock(blockId: string, nb: Block) {
    if (!active) return
    patchSection(active.id, {
      blocks: active.blocks.map((b) => (b.id === blockId ? nb : b)),
    })
  }

  function deleteBlock(blockId: string) {
    if (!active) return
    patchSection(active.id, { blocks: active.blocks.filter((b) => b.id !== blockId) })
  }

  function onSectionDragEnd(e: DragEndEvent) {
    const { active: a, over } = e
    if (!over || a.id === over.id) return
    const oldI = sections.findIndex((s) => s.id === a.id)
    const newI = sections.findIndex((s) => s.id === over.id)
    const next = arrayMove(sections, oldI, newI)
    setSections(next)
    fetch(`/api/admin/courses/${courseId}/sections/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: next.map((s) => s.id) }),
    })
  }

  function onBlockDragEnd(e: DragEndEvent) {
    if (!active) return
    const { active: a, over } = e
    if (!over || a.id === over.id) return
    const oldI = active.blocks.findIndex((b) => b.id === a.id)
    const newI = active.blocks.findIndex((b) => b.id === over.id)
    patchSection(active.id, { blocks: arrayMove(active.blocks, oldI, newI) })
  }

  const saveLabel =
    saveState === 'saving' ? 'Сохранение…' : saveState === 'unsaved' ? 'Не сохранено' : 'Сохранено ✓'

  return (
    <>
      <div className="page-head">
        <div>
          <div className="crumbs" style={{ marginBottom: 4 }}>
            <Link href="/admin/courses">Курсы</Link>
            <span className="sep">/</span>
            <span className="current">{courseTitle}</span>
          </div>
          <h1>Редактор курса</h1>
        </div>
        <div className="ph-actions">
          <span className="badge gray">
            <span className="bd-dot" />
            {saveLabel}
          </span>
          <Link className="btn btn-outline" href={`/admin/courses/${courseId}/settings`}>
            <Settings size={16} />
            Настройки
          </Link>
        </div>
      </div>

      <div className="course-shell">
        <aside className="course-left">
          <div className="between" style={{ marginBottom: 12 }}>
            <span className="cell-sub" style={{ fontWeight: 600 }}>Разделы</span>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={addSection}>
              <Plus size={15} />
            </button>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onSectionDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {sections.map((s, i) => (
                <SectionRow
                  key={s.id}
                  section={s}
                  index={i}
                  active={s.id === activeId}
                  onSelect={() => setActiveId(s.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
          {sections.length === 0 && (
            <div className="cell-muted" style={{ fontSize: 13, padding: 8 }}>
              Нет разделов — создайте первый.
            </div>
          )}
        </aside>

        <div className="course-center">
          {active ? (
            <>
              <div className="course-ed-head">
                <div style={{ flex: 1 }}>
                  <input
                    className="course-title"
                    value={active.title}
                    onChange={(e) => patchSection(active.id, { title: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="row" style={{ gap: 10 }}>
                  <label className="switch-row" style={{ padding: 0, border: 'none' }}>
                    <span className="sr-text" style={{ marginRight: 8 }}>Опубл.</span>
                    <span className="switch">
                      <input
                        type="checkbox"
                        checked={active.is_published}
                        onChange={(e) => patchSection(active.id, { is_published: e.target.checked })}
                      />
                      <span className="track" />
                    </span>
                  </label>
                  <button className="btn btn-danger-outline btn-sm" onClick={() => deleteSection(active.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="course-blocks">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onBlockDragEnd}>
                  <SortableContext
                    items={active.blocks.map((b) => b.id!)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {active.blocks.map((b) => (
                        <BlockCard
                          key={b.id}
                          block={b}
                          onChange={(nb) => updateBlock(b.id!, nb)}
                          onDelete={() => deleteBlock(b.id!)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <div style={{ position: 'relative', marginTop: 16 }}>
                  <button className="btn btn-outline" onClick={() => setAddOpen((o) => !o)}>
                    <Plus size={16} />
                    Добавить блок
                  </button>
                  {addOpen && (
                    <div
                      className="dd-menu"
                      style={{
                        opacity: 1,
                        transform: 'none',
                        pointerEvents: 'auto',
                        left: 0,
                        right: 'auto',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        minWidth: 280,
                      }}
                    >
                      {BLOCK_TYPES.map((bt) => (
                        <button key={bt.type} className="dd-item" onClick={() => addBlock(bt.type)}>
                          {bt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="empty" style={{ padding: 64 }}>
              <h3>Выберите раздел</h3>
              <p>Создайте раздел слева, чтобы начать наполнять курс.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
