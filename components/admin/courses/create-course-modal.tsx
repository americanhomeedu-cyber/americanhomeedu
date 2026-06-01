'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AdminModal } from '@/components/admin/modal'

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

export function CreateCourseModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [title, setTitle] = React.useState('')
  const [slug, setSlug] = React.useState('')
  const [slugEdited, setSlugEdited] = React.useState(false)
  const [desc, setDesc] = React.useState('')
  const [price, setPrice] = React.useState('397')
  const [publish, setPublish] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const effSlug = slugEdited ? slug : slugify(title)

  async function submit() {
    setSaving(true)
    const res = await fetch('/api/admin/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        slug: effSlug,
        description: desc,
        price_cents: Math.round(parseFloat(price || '0') * 100),
        is_published: publish,
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      toast.error(data.error || 'Не удалось создать курс')
      return
    }
    toast.success('Курс создан')
    onClose()
    router.push(`/admin/courses/${data.id}/settings`)
    router.refresh()
  }

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title="Создать курс"
      subtitle="Заполните основное — детали настроите потом"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Отмена
          </button>
          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={saving || title.trim().length < 2}
          >
            {saving ? 'Создаём…' : 'Создать курс'}
          </button>
        </>
      }
    >
      <div className="field">
        <label>
          Название <span className="req">*</span>
        </label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Как купить дом в Америке"
        />
      </div>
      <div className="field">
        <label>Slug</label>
        <input
          className="input"
          value={effSlug}
          onChange={(e) => {
            setSlug(e.target.value)
            setSlugEdited(true)
          }}
          placeholder="american-home-blueprint"
        />
        <div className="hint">URL-идентификатор курса (латиница, цифры, дефис)</div>
      </div>
      <div className="field">
        <label>Описание</label>
        <textarea
          className="textarea"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>
      <div className="field">
        <label>
          Цена, $ <span className="req">*</span>
        </label>
        <input
          className="input"
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      <div className="switch-row">
        <div className="sr-text">Опубликовать сразу</div>
        <label className="switch">
          <input
            type="checkbox"
            checked={publish}
            onChange={(e) => setPublish(e.target.checked)}
          />
          <span className="track" />
        </label>
      </div>
    </AdminModal>
  )
}
