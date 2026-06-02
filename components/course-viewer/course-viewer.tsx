'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Book,
  ChevronLeft,
  ChevronRight,
  Check,
  Circle,
  CircleCheck,
  Play,
} from 'lucide-react'
import { toast } from 'sonner'
import { BlockView } from './block-view'
import type { Block } from '@/types/blocks'

type Section = {
  id: string
  title: string
  estimated_minutes: number | null
  blocks: Block[]
}

export function CourseViewer({
  courseId,
  courseTitle,
  sections,
  currentId,
  doneIds,
}: {
  courseId: string
  courseTitle: string
  sections: Section[]
  currentId: string
  doneIds: string[]
}) {
  const [sideOpen, setSideOpen] = React.useState(false)
  const [done, setDone] = React.useState<Set<string>>(new Set(doneIds))
  const [saving, setSaving] = React.useState(false)

  const idx = sections.findIndex((s) => s.id === currentId)
  const sec = sections[idx]
  const pct = sections.length ? Math.round((done.size / sections.length) * 100) : 0
  const isDone = done.has(currentId)

  async function toggleComplete() {
    setSaving(true)
    const next = !isDone
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionId: currentId, completed: next }),
    })
    setSaving(false)
    if (!res.ok) {
      toast.error('Не удалось сохранить прогресс')
      return
    }
    setDone((prev) => {
      const s = new Set(prev)
      if (next) s.add(currentId)
      else s.delete(currentId)
      return s
    })
    if (next) toast.success('Раздел отмечен пройденным')
    else toast.info('Отметка снята')
    // No router.refresh() — local `done` state already reflects the change;
    // refreshing would re-pick the "next incomplete" section and jump away.
  }

  if (!sec) return null
  const last = idx === sections.length - 1

  return (
    <div className={`cv${sideOpen ? ' side-open' : ''}`}>
      <div className="cv-scrim" onClick={() => setSideOpen(false)} />
      <aside className="cv-side">
        <Link className="cv-back" href="/dashboard">
          <ChevronLeft size={15} />
          Все курсы
        </Link>
        <h3>{courseTitle}</h3>
        <div className="cv-prog">
          <div className="prog-bar">
            <div className={`fill${pct === 100 ? ' gold' : ''}`} style={{ width: `${pct}%` }} />
          </div>
          <div className="lbl">{pct}% пройдено</div>
        </div>
        <div className="cv-secs">
          {sections.map((s, i) => {
            const d = done.has(s.id)
            const active = s.id === currentId
            return (
              <Link
                key={s.id}
                href={`/course/${courseId}?s=${s.id}`}
                onClick={() => setSideOpen(false)}
                className={`cv-sec${active ? ' active' : ''}${d ? ' done' : ''}`}
              >
                <span className="ind">
                  {d ? <CircleCheck size={18} /> : active ? <Play size={18} /> : <Circle size={18} />}
                </span>
                <div>
                  <div className="st">
                    {i + 1}. {s.title}
                  </div>
                  <div className="sm">{s.estimated_minutes ?? '—'} мин</div>
                </div>
              </Link>
            )
          })}
        </div>
      </aside>

      <main className="cv-main">
        <div className="cv-inner">
          <button
            className="btn btn-outline btn-sm cv-burger"
            style={{ marginBottom: 16 }}
            onClick={() => setSideOpen(true)}
          >
            <Book size={16} />
            Разделы курса
          </button>
          <div className="cv-crumbs">
            {courseTitle} &nbsp;›&nbsp; <b>Раздел {idx + 1}</b>
          </div>
          <h1 className="cv-h1">{sec.title}</h1>
          <div className="cv-meta">
            Раздел {idx + 1} из {sections.length}
            {sec.estimated_minutes ? ` · ~${sec.estimated_minutes} минут` : ''}
          </div>
          <article>
            {sec.blocks.map((b, i) => (
              <BlockView key={b.id || i} block={b} />
            ))}
          </article>
          <div className="sec-complete">
            <button
              className={`complete-btn${isDone ? ' done' : ''}`}
              onClick={toggleComplete}
              disabled={saving}
            >
              {isDone ? (
                <>
                  <Check size={19} />
                  Раздел пройден
                </>
              ) : (
                <>
                  <Circle size={19} />
                  Отметить раздел пройденным
                </>
              )}
            </button>
          </div>
          <div className="sec-nav">
            {idx > 0 ? (
              <Link className="btn btn-outline" href={`/course/${courseId}?s=${sections[idx - 1].id}`}>
                <ChevronLeft size={17} />
                Предыдущий
              </Link>
            ) : (
              <span />
            )}
            {!last ? (
              <Link className="btn btn-primary right" href={`/course/${courseId}?s=${sections[idx + 1].id}`}>
                Следующий раздел <ChevronRight size={17} />
              </Link>
            ) : isDone ? (
              <Link className="btn btn-primary right" href="/dashboard">
                Завершить курс 🎉
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
