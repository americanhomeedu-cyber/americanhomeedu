'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Settings, BookOpen, Star, StarOff, Copy, Trash2, DollarSign, Users, GripVertical } from 'lucide-react'
import { RowMenu } from '@/components/admin/row-menu'
import { toast } from 'sonner'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PageHeader } from '@/components/admin/page-header'
import { StatCard } from '@/components/admin/stat-card'
import { formatPrice } from '@/lib/utils'
import { CreateCourseModal } from './create-course-modal'

type Row = {
  id: string
  title: string
  slug: string
  price_cents: number
  old_price_cents: number | null
  currency: string
  is_published: boolean
  is_featured: boolean
  students: number
  revenue: number
}

function CourseRow({ c }: { c: Row }) {
  const router = useRouter()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: c.id })

  async function patch(body: Record<string, unknown>, okMsg: string) {
    const res = await fetch(`/api/admin/courses/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const d = await res.json()
    if (!res.ok) toast.error(d.error || 'Ошибка')
    else {
      toast.success(okMsg)
      router.refresh()
    }
  }

  async function duplicate() {
    const rand = Math.random().toString(36).slice(2, 6)
    const res = await fetch('/api/admin/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `${c.title} (копия)`,
        slug: `${c.slug}-copy-${rand}`,
        price_cents: c.price_cents,
        is_published: false,
      }),
    })
    const d = await res.json()
    if (!res.ok) toast.error(d.error || 'Ошибка')
    else {
      toast.success('Курс дублирован')
      router.refresh()
    }
  }

  async function del() {
    if (!confirm(`Удалить курс «${c.title}»?`)) return
    const res = await fetch(`/api/admin/courses/${c.id}`, { method: 'DELETE' })
    const d = await res.json()
    if (!res.ok) toast.error(d.error || 'Ошибка')
    else {
      toast.success('Курс удалён')
      router.refresh()
    }
  }

  return (
    <tr
      ref={setNodeRef}
      className="clickable"
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      onClick={() => router.push(`/admin/courses/${c.id}`)}
    >
      <td style={{ width: 32 }} onClick={(e) => e.stopPropagation()}>
        <span className="cs-grip" style={{ cursor: 'grab', opacity: 1, color: 'var(--ink-3)' }} {...attributes} {...listeners}>
          <GripVertical size={15} />
        </span>
      </td>
      <td>
        <div className="cell-user">
          <span className="ava s40 alt2">{c.title[0]}</span>
          <div>
            <div className="cu-name">{c.title}</div>
            <div className="cu-sub">/{c.slug}</div>
          </div>
        </div>
      </td>
      <td className="cell-strong">
        {formatPrice(c.price_cents, c.currency)}
        {c.old_price_cents ? (
          <span className="cell-sub" style={{ textDecoration: 'line-through', marginLeft: 6 }}>
            {formatPrice(c.old_price_cents, c.currency)}
          </span>
        ) : null}
      </td>
      <td className="tnum">{c.students}</td>
      <td className="cell-strong">{formatPrice(c.revenue, c.currency)}</td>
      <td>
        <div className="row" style={{ gap: 6 }}>
          <span className={`badge ${c.is_published ? 'green' : 'gray'}`}>
            <span className="bd-dot" />
            {c.is_published ? 'Published' : 'Draft'}
          </span>
          {c.is_featured && <span className="badge gold">Featured</span>}
        </div>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <RowMenu
          items={[
            { label: 'Настройки', icon: Settings, onClick: () => router.push(`/admin/courses/${c.id}/settings`) },
            { label: 'Редактор', icon: BookOpen, onClick: () => router.push(`/admin/courses/${c.id}/editor`) },
            { label: 'Дублировать', icon: Copy, onClick: duplicate },
            c.is_featured
              ? { label: 'Снять featured', icon: StarOff, onClick: () => patch({ is_featured: false }, 'Снят с featured') }
              : { label: 'Сделать featured', icon: Star, onClick: () => patch({ is_featured: true }, 'Курс назначен featured') },
            { sep: true },
            { label: 'Удалить', icon: Trash2, danger: true, onClick: del },
          ]}
        />
      </td>
    </tr>
  )
}

export function CoursesView({ courses }: { courses: Row[] }) {
  const [showCreate, setShowCreate] = React.useState(false)
  const [list, setList] = React.useState(courses)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  React.useEffect(() => setList(courses), [courses])

  const totalRevenue = list.reduce((s, c) => s + c.revenue, 0)
  const totalStudents = list.reduce((s, c) => s + c.students, 0)
  const publishedCount = list.filter((c) => c.is_published).length
  const currency = list[0]?.currency || 'usd'

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const next = arrayMove(
      list,
      list.findIndex((c) => c.id === active.id),
      list.findIndex((c) => c.id === over.id),
    )
    setList(next)
    await fetch('/api/admin/courses/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: next.map((c) => c.id) }),
    })
    toast.success('Порядок сохранён')
  }

  return (
    <>
      <PageHeader title="Курсы" subtitle="Все продукты, которые вы продаёте через сайт">
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          Создать курс
        </button>
      </PageHeader>

      <div className="stat-grid" style={{ marginBottom: 24, gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <StatCard label="Всего курсов" value={`${list.length} · ${publishedCount} опубл.`} icon={BookOpen} />
        <StatCard
          label="Общая выручка"
          value={formatPrice(totalRevenue, currency)}
          icon={DollarSign}
          iconBg="var(--accent-soft)"
          iconColor="#9A7B3F"
        />
        <StatCard label="Всего учеников" value={totalStudents} icon={Users} />
      </div>

      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th />
              <th>Курс</th>
              <th>Цена</th>
              <th>Учеников</th>
              <th>Выручка</th>
              <th>Статус</th>
              <th />
            </tr>
          </thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={list.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {list.map((c) => (
                  <CourseRow key={c.id} c={c} />
                ))}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>

      <CreateCourseModal open={showCreate} onClose={() => setShowCreate(false)} />
    </>
  )
}
