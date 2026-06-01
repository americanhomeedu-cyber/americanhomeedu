'use client'

import * as React from 'react'
import Link from 'next/link'
import { nanoid } from 'nanoid'
import DOMPurify from 'isomorphic-dompurify'
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
import {
  GripVertical,
  Plus,
  Trash2,
  Copy,
  Eye,
  Check,
  Pencil,
  MoreHorizontal,
  Pause,
  Search,
  Heading,
  Type,
  List,
  Info,
  Image as ImageIcon,
  Video,
  FileText,
  Link as LinkIcon,
  MousePointerClick,
  Minus,
  ArrowLeft,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { BlockEditor } from './block-editor'
import { AdminModal } from '@/components/admin/modal'
import { Sheet } from '@/components/admin/sheet'
import type { Block, BlockType } from '@/types/blocks'

type Section = {
  id: string
  title: string
  description: string | null
  blocks: Block[]
  is_published: boolean
  position: number
  estimated_minutes: number | null
}

const BLOCK_TYPES: { type: BlockType; label: string; icon: LucideIcon; group: string; desc: string }[] = [
  { type: 'heading', label: 'Заголовок', icon: Heading, group: 'Текст', desc: 'Крупный заголовок секции' },
  { type: 'text', label: 'Параграф', icon: Type, group: 'Текст', desc: 'Обычный текст с форматированием' },
  { type: 'list', label: 'Список', icon: List, group: 'Текст', desc: 'Маркированный или нумерованный' },
  { type: 'callout', label: 'Callout', icon: Info, group: 'Текст', desc: 'Выделенный блок с подсказкой' },
  { type: 'image', label: 'Изображение', icon: ImageIcon, group: 'Медиа', desc: 'Картинка с подписью' },
  { type: 'video', label: 'Видео', icon: Video, group: 'Медиа', desc: 'YouTube / Vimeo' },
  { type: 'file', label: 'Файл', icon: FileText, group: 'Медиа', desc: 'PDF или документ' },
  { type: 'link', label: 'Ссылка', icon: LinkIcon, group: 'Действия', desc: 'Ссылка или карточка' },
  { type: 'button', label: 'Кнопка', icon: MousePointerClick, group: 'Действия', desc: 'Кнопка действия' },
  { type: 'divider', label: 'Разделитель', icon: Minus, group: 'Структура', desc: 'Горизонтальная линия' },
]

function blankBlock(type: BlockType): Block {
  const id = nanoid()
  switch (type) {
    case 'heading':
      return { id, type, level: 2, text: 'Новый заголовок' }
    case 'text':
      return { id, type, html: '<p>Текст параграфа…</p>' }
    case 'list':
      return { id, type, ordered: false, items: ['Первый пункт', 'Второй пункт'] }
    case 'callout':
      return { id, type, variant: 'tip', text: 'Полезный совет' }
    case 'video':
      return { id, type, url: '' }
    case 'image':
      return { id, type, url: '' }
    case 'link':
      return { id, type, title: '', url: '' }
    case 'button':
      return { id, type, label: 'Кнопка', url: '#' }
    case 'file':
      return { id, type, name: '' }
    case 'divider':
      return { id, type }
  }
}

const pad2 = (n: number) => String(n).padStart(2, '0')

/* ---------------- Section row ---------------- */
function SectionRow({
  section,
  index,
  active,
  onSelect,
  menuOpen,
  onMenuToggle,
  onRename,
  onDup,
  onPub,
  onDelete,
}: {
  section: Section
  index: number
  active: boolean
  onSelect: () => void
  menuOpen: boolean
  onMenuToggle: (e: React.MouseEvent) => void
  onRename: () => void
  onDup: () => void
  onPub: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}>
      <div className={`course-sec${active ? ' active' : ''}`} onClick={onSelect}>
        <span className="cs-grip" {...attributes} {...listeners} onClick={(e) => e.stopPropagation()}>
          <GripVertical size={15} />
        </span>
        <span className="cs-num">{pad2(index + 1)}</span>
        <div className="cs-mid">
          <div className="cs-title">{section.title || 'Без названия'}</div>
          <div className="cs-meta">
            {section.blocks.length} блоков
            {section.estimated_minutes ? ` · ${section.estimated_minutes} мин` : ''}
          </div>
        </div>
        <span className="cs-dot" style={{ background: section.is_published ? 'var(--success)' : 'var(--ink-3)' }} />
        <div className={`dd${menuOpen ? ' open' : ''}`} onClick={(e) => e.stopPropagation()}>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onMenuToggle}>
            <MoreHorizontal size={15} />
          </button>
          <div className="dd-menu">
            <button className="dd-item" onClick={onRename}>
              <Pencil size={15} />
              Переименовать
            </button>
            <button className="dd-item" onClick={onDup}>
              <Copy size={15} />
              Дублировать
            </button>
            <button className="dd-item" onClick={onPub}>
              {section.is_published ? <Pause size={15} /> : <Check size={15} />}
              {section.is_published ? 'Скрыть' : 'Опубликовать'}
            </button>
            <div className="dd-sep" />
            <button className="dd-item danger" onClick={onDelete}>
              <Trash2 size={15} />
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Block (with left controls) ---------------- */
function SortableBlock({
  block,
  onChange,
  onDup,
  onDelete,
}: {
  block: Block
  onChange: (b: Block) => void
  onDup: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id! })
  return (
    <div ref={setNodeRef} className="blk" style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}>
      <div className="blk-controls">
        <span className="blk-grip" {...attributes} {...listeners} title="Перетащить">
          <GripVertical size={15} />
        </span>
        <button className="blk-ctrl" onClick={onDup} title="Дублировать">
          <Copy size={14} />
        </button>
        <button className="blk-ctrl danger" onClick={onDelete} title="Удалить">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="blk-body">
        <BlockEditor block={block} onChange={onChange} />
      </div>
    </div>
  )
}

function AddZone({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="blk-add-zone" onClick={onAdd}>
      <button className="blk-add-btn">
        <Plus size={14} />
        Добавить блок
      </button>
    </div>
  )
}

/* ---------------- Add-block command palette ---------------- */
function AddBlockModal({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (t: BlockType) => void }) {
  const [q, setQ] = React.useState('')
  React.useEffect(() => {
    if (open) setQ('')
  }, [open])
  if (!open) return null
  const groups = ['Текст', 'Медиа', 'Действия', 'Структура']
  return (
    <div className="overlay show" onClick={onClose}>
      <div className="cmdk" onClick={(e) => e.stopPropagation()}>
        <div className="cmdk-input">
          <Search size={18} />
          <input autoFocus placeholder="Поиск типа блока…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="cmdk-list">
          {groups.map((g) => {
            const items = BLOCK_TYPES.filter((b) => b.group === g && b.label.toLowerCase().includes(q.toLowerCase()))
            if (!items.length) return null
            return (
              <React.Fragment key={g}>
                <div className="dd-label">{g}</div>
                {items.map((b) => {
                  const Icon = b.icon
                  return (
                    <div key={b.type} className="cmdk-item" onClick={() => onPick(b.type)}>
                      <Icon size={16} />
                      <div>
                        <div>{b.label}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{b.desc}</div>
                      </div>
                    </div>
                  )
                })}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ---------------- Preview block (read-only, inline styled) ---------------- */
function PreviewBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading': {
      const size = block.level === 1 ? 26 : block.level === 2 ? 21 : 17
      return <div style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: size, margin: '18px 0 8px' }}>{block.text}</div>
    }
    case 'text':
      return <div style={{ marginBottom: 12, lineHeight: 1.6, color: 'var(--ink-2)' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.html) }} />
    case 'list': {
      const items = block.items.map((it, i) => <li key={i}>{it}</li>)
      return block.ordered ? (
        <ol style={{ paddingLeft: 20, lineHeight: 1.8, color: 'var(--ink-2)' }}>{items}</ol>
      ) : (
        <ul style={{ paddingLeft: 20, lineHeight: 1.8, color: 'var(--ink-2)' }}>{items}</ul>
      )
    }
    case 'callout':
      return <div style={{ background: 'var(--beige)', borderRadius: 8, padding: '12px 14px', margin: '12px 0' }}>{block.text}</div>
    case 'video':
      return <div style={{ aspectRatio: '16 / 9', background: '#1A1A1A', borderRadius: 8, margin: '12px 0', display: 'grid', placeItems: 'center', color: '#fff' }}>▶ Видео</div>
    case 'image':
      // eslint-disable-next-line @next/next/no-img-element
      return block.url ? <img src={block.url} alt="" style={{ width: '100%', borderRadius: 8, margin: '12px 0' }} /> : null
    case 'button':
      return (
        <div style={{ margin: '8px 0' }}>
          <span className="btn btn-primary btn-sm">{block.label}</span>
        </div>
      )
    case 'link':
      return <div style={{ margin: '8px 0', color: 'var(--primary)', fontWeight: 600 }}>{block.title || block.url}</div>
    case 'file':
      return <div style={{ margin: '8px 0', fontSize: 13.5 }}>📎 {block.name || 'Файл'}</div>
    case 'divider':
      return <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
    default:
      return null
  }
}

/* ================= Main editor ================= */
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
  const [addPos, setAddPos] = React.useState<number | null>(null)
  const [menuSec, setMenuSec] = React.useState<string | null>(null)
  const [renameSec, setRenameSec] = React.useState<Section | null>(null)
  const [renameVal, setRenameVal] = React.useState('')
  const [previewOpen, setPreviewOpen] = React.useState(false)

  const sectionsRef = React.useRef(sections)
  React.useEffect(() => {
    sectionsRef.current = sections
  }, [sections])
  const dirty = React.useRef<Set<string>>(new Set())
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const active = sections.find((s) => s.id === activeId)

  React.useEffect(() => {
    if (!menuSec) return
    const close = () => setMenuSec(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuSec])

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
            description: s.description,
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
      timer.current = setTimeout(flush, 1200)
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
      body: JSON.stringify({ title: 'Новая секция', position: sections.length }),
    })
    const data = await res.json()
    if (res.ok) {
      const sec: Section = { ...data, description: data.description ?? null, blocks: [] }
      setSections((p) => [...p, sec])
      setActiveId(sec.id)
    }
  }

  async function duplicateSection(sec: Section) {
    const res = await fetch(`/api/admin/courses/${courseId}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: `${sec.title} (копия)`, position: sections.length }),
    })
    const data = await res.json()
    if (res.ok) {
      await fetch(`/api/admin/sections/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: sec.blocks, is_published: false, description: sec.description }),
      })
      const sectionCopy: Section = { ...data, blocks: sec.blocks, description: sec.description, is_published: false }
      setSections((p) => [...p, sectionCopy])
    }
  }

  async function deleteSection(id: string) {
    if (!confirm('Удалить секцию со всеми блоками?')) return
    await fetch(`/api/admin/sections/${id}`, { method: 'DELETE' })
    setSections((p) => p.filter((s) => s.id !== id))
    if (activeId === id) setActiveId(sections.find((s) => s.id !== id)?.id ?? '')
  }

  function insertBlock(type: BlockType, pos: number) {
    if (!active) return
    const next = [...active.blocks]
    next.splice(pos, 0, blankBlock(type))
    patchSection(active.id, { blocks: next })
    setAddPos(null)
  }

  function duplicateBlock(blockId: string) {
    if (!active) return
    const idx = active.blocks.findIndex((b) => b.id === blockId)
    if (idx < 0) return
    const clone = { ...active.blocks[idx], id: nanoid() }
    const next = [...active.blocks]
    next.splice(idx + 1, 0, clone)
    patchSection(active.id, { blocks: next })
  }

  function updateBlock(blockId: string, nb: Block) {
    if (!active) return
    patchSection(active.id, { blocks: active.blocks.map((b) => (b.id === blockId ? nb : b)) })
  }

  function deleteBlock(blockId: string) {
    if (!active) return
    patchSection(active.id, { blocks: active.blocks.filter((b) => b.id !== blockId) })
  }

  function onSectionDragEnd(e: DragEndEvent) {
    const { active: a, over } = e
    if (!over || a.id === over.id) return
    const next = arrayMove(sections, sections.findIndex((s) => s.id === a.id), sections.findIndex((s) => s.id === over.id))
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
    patchSection(active.id, {
      blocks: arrayMove(active.blocks, active.blocks.findIndex((b) => b.id === a.id), active.blocks.findIndex((b) => b.id === over.id)),
    })
  }

  return (
    <>
      <Link href={`/admin/courses/${courseId}`} className="row" style={{ gap: 6, color: 'var(--ink-2)', fontSize: 13, marginBottom: 16 }}>
        <ArrowLeft size={15} />
        К курсу «{courseTitle}»
      </Link>

      <div className="course-shell">
        {/* ---- left: sections ---- */}
        <aside className="course-left">
          <div className="between" style={{ marginBottom: 12 }}>
            <h3 style={{ fontSize: 14 }}>Секции курса</h3>
            <button className="btn btn-ghost btn-sm" onClick={addSection}>
              <Plus size={15} />
              Секция
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
                  menuOpen={menuSec === s.id}
                  onMenuToggle={(e) => {
                    e.stopPropagation()
                    setMenuSec(menuSec === s.id ? null : s.id)
                  }}
                  onRename={() => {
                    setMenuSec(null)
                    setRenameSec(s)
                    setRenameVal(s.title)
                  }}
                  onDup={() => {
                    setMenuSec(null)
                    duplicateSection(s)
                  }}
                  onPub={() => {
                    setMenuSec(null)
                    patchSection(s.id, { is_published: !s.is_published })
                  }}
                  onDelete={() => {
                    setMenuSec(null)
                    deleteSection(s.id)
                  }}
                />
              ))}
            </SortableContext>
          </DndContext>
          {sections.length === 0 && (
            <div className="cell-muted" style={{ fontSize: 13, padding: 8 }}>Нет секций — создайте первую.</div>
          )}
          <Link href={`/course/${courseId}`} target="_blank" className="sb-tosite" style={{ marginTop: 14 }}>
            <Eye size={15} />
            Просмотр курса
          </Link>
        </aside>

        {/* ---- center: editor ---- */}
        <div className="course-center">
          {active ? (
            <>
              <div className="course-ed-head">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <input
                    className="course-title"
                    value={active.title}
                    onChange={(e) => patchSection(active.id, { title: e.target.value })}
                    style={{ border: 'none', background: 'transparent', width: '100%' }}
                  />
                  <input
                    className="course-desc"
                    placeholder="Описание (для админа)"
                    value={active.description || ''}
                    onChange={(e) => patchSection(active.id, { description: e.target.value })}
                  />
                </div>
                <div className="row" style={{ gap: 12, flex: 'none' }}>
                  <span
                    className="row"
                    style={{ gap: 5, fontSize: 12.5, fontWeight: 600, color: saveState === 'saved' ? 'var(--success)' : 'var(--ink-3)' }}
                  >
                    {saveState === 'saving' ? (
                      <span className="spin" style={{ width: 13, height: 13, borderColor: 'var(--ink-3)', borderRightColor: 'transparent' }} />
                    ) : saveState === 'unsaved' ? null : (
                      <Check size={14} />
                    )}
                    {saveState === 'saving' ? 'Сохранение…' : saveState === 'unsaved' ? 'Не сохранено' : 'Сохранено'}
                  </span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={active.is_published}
                      onChange={(e) => patchSection(active.id, { is_published: e.target.checked })}
                    />
                    <span className="track" />
                  </label>
                  <button className="btn btn-outline btn-sm" onClick={() => setPreviewOpen(true)}>
                    <Eye size={15} />
                    Превью
                  </button>
                </div>
              </div>

              <div className="course-blocks">
                {active.blocks.length === 0 ? (
                  <div className="empty" style={{ padding: '48px 24px' }}>
                    <div className="em-ic">
                      <Type size={28} />
                    </div>
                    <h3>Секция пустая</h3>
                    <p>Добавьте первый блок, чтобы наполнить секцию.</p>
                    <button className="btn btn-primary" onClick={() => setAddPos(0)}>
                      <Plus size={16} />
                      Добавить блок
                    </button>
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onBlockDragEnd}>
                    <SortableContext items={active.blocks.map((b) => b.id!)} strategy={verticalListSortingStrategy}>
                      <AddZone onAdd={() => setAddPos(0)} />
                      {active.blocks.map((b, i) => (
                        <React.Fragment key={b.id}>
                          <SortableBlock
                            block={b}
                            onChange={(nb) => updateBlock(b.id!, nb)}
                            onDup={() => duplicateBlock(b.id!)}
                            onDelete={() => deleteBlock(b.id!)}
                          />
                          <AddZone onAdd={() => setAddPos(i + 1)} />
                        </React.Fragment>
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </>
          ) : (
            <div className="empty" style={{ padding: 64 }}>
              <div className="em-ic">
                <Heading size={28} />
              </div>
              <h3>Выберите секцию</h3>
              <p>Выберите секцию слева или создайте новую, чтобы начать.</p>
            </div>
          )}
        </div>
      </div>

      <AddBlockModal open={addPos !== null} onClose={() => setAddPos(null)} onPick={(t) => insertBlock(t, addPos ?? 0)} />

      <AdminModal
        open={!!renameSec}
        onClose={() => setRenameSec(null)}
        title="Переименовать секцию"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setRenameSec(null)}>
              Отмена
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (renameSec) patchSection(renameSec.id, { title: renameVal })
                setRenameSec(null)
              }}
            >
              Сохранить
            </button>
          </>
        }
      >
        <div className="field" style={{ margin: 0 }}>
          <label>Название</label>
          <input className="input" value={renameVal} onChange={(e) => setRenameVal(e.target.value)} autoFocus />
        </div>
      </AdminModal>

      <Sheet open={previewOpen} onClose={() => setPreviewOpen(false)} title={`Превью · ${active?.title ?? ''}`}>
        {active && (
          <>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, marginBottom: 16 }}>{active.title}</h2>
            {active.blocks.length === 0 ? (
              <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>В секции пока нет блоков.</div>
            ) : (
              active.blocks.map((b) => <PreviewBlock key={b.id} block={b} />)
            )}
          </>
        )}
      </Sheet>
    </>
  )
}
