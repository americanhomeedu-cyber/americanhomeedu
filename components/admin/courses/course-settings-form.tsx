'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/page-header'
import type { Database } from '@/types/database'

type Course = Database['public']['Tables']['courses']['Row']

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  )
}

export function CourseSettingsForm({
  course,
  embedded,
}: {
  course: Course
  embedded?: boolean
}) {
  const router = useRouter()
  const [f, setF] = React.useState({
    title: course.title,
    slug: course.slug,
    subtitle: course.subtitle || '',
    description: course.description || '',
    cover_image_url: course.cover_image_url || '',
    estimated_total_minutes: course.estimated_total_minutes?.toString() || '',
    price: (course.price_cents / 100).toString(),
    old_price: course.old_price_cents ? (course.old_price_cents / 100).toString() : '',
    currency: course.currency,
    is_published: course.is_published,
    is_featured: course.is_featured,
    position: course.position.toString(),
  })
  const [saving, setSaving] = React.useState(false)
  const [syncing, setSyncing] = React.useState(false)
  const set = (k: keyof typeof f, v: string | boolean) =>
    setF((p) => ({ ...p, [k]: v }))

  async function save() {
    setSaving(true)
    const res = await fetch(`/api/admin/courses/${course.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: f.title,
        slug: f.slug,
        subtitle: f.subtitle || null,
        description: f.description || null,
        cover_image_url: f.cover_image_url || null,
        estimated_total_minutes: f.estimated_total_minutes
          ? parseInt(f.estimated_total_minutes)
          : null,
        price_cents: Math.round(parseFloat(f.price || '0') * 100),
        old_price_cents: f.old_price ? Math.round(parseFloat(f.old_price) * 100) : null,
        currency: f.currency,
        is_published: f.is_published,
        is_featured: f.is_featured,
        position: parseInt(f.position || '0'),
      }),
    })
    const d = await res.json()
    setSaving(false)
    if (!res.ok) toast.error(d.error || 'Ошибка')
    else {
      toast.success('Сохранено')
      router.refresh()
    }
  }

  async function syncStripe() {
    setSyncing(true)
    const res = await fetch(`/api/admin/courses/${course.id}/sync`, { method: 'POST' })
    const d = await res.json()
    setSyncing(false)
    if (!res.ok) toast.error(d.error || 'Ошибка синхронизации')
    else {
      toast.success('Синхронизировано со Stripe')
      router.refresh()
    }
  }

  async function del() {
    if (!confirm(`Удалить курс «${course.title}»?`)) return
    const res = await fetch(`/api/admin/courses/${course.id}`, { method: 'DELETE' })
    const d = await res.json()
    if (!res.ok) toast.error(d.error || 'Ошибка')
    else {
      toast.success('Курс удалён')
      router.push('/admin/courses')
      router.refresh()
    }
  }

  const header = embedded ? (
    <div className="row" style={{ justifyContent: 'flex-end', marginBottom: 16 }}>
      <button className="btn btn-primary" onClick={save} disabled={saving}>
        {saving ? 'Сохраняем…' : 'Сохранить изменения'}
      </button>
    </div>
  ) : (
    <PageHeader title={course.title} subtitle={`/${course.slug}`}>
      <Link className="btn btn-outline" href={`/admin/courses/${course.id}/editor`}>
        Перейти к редактору
      </Link>
      <button className="btn btn-primary" onClick={save} disabled={saving}>
        {saving ? 'Сохраняем…' : 'Сохранить'}
      </button>
    </PageHeader>
  )

  return (
    <>
      {header}

      <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="card">
          <div className="card-head">
            <h3>Основная информация</h3>
          </div>
          <div className="card-body">
            <Field label="Название">
              <input className="input" value={f.title} onChange={(e) => set('title', e.target.value)} />
            </Field>
            <Field label="Slug">
              <input className="input" value={f.slug} onChange={(e) => set('slug', e.target.value)} />
            </Field>
            <Field label="Подзаголовок">
              <input className="input" value={f.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
            </Field>
            <Field label="Описание">
              <textarea className="textarea" value={f.description} onChange={(e) => set('description', e.target.value)} />
            </Field>
            <Field label="Обложка (URL)">
              <input
                className="input"
                value={f.cover_image_url}
                onChange={(e) => set('cover_image_url', e.target.value)}
                placeholder="https://..."
              />
            </Field>
            <Field label="Длительность (минут)">
              <input
                className="input"
                type="number"
                value={f.estimated_total_minutes}
                onChange={(e) => set('estimated_total_minutes', e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Цена и оплата</h3>
          </div>
          <div className="card-body">
            <Field label="Цена, $">
              <input className="input" type="number" value={f.price} onChange={(e) => set('price', e.target.value)} />
            </Field>
            <Field label="Старая цена, $ (зачёркнутая)">
              <input className="input" type="number" value={f.old_price} onChange={(e) => set('old_price', e.target.value)} />
            </Field>
            <Field label="Валюта">
              <input className="input" value={f.currency} onChange={(e) => set('currency', e.target.value)} />
            </Field>
            <div className="field">
              <label>Stripe Product / Price ID</label>
              <div className="copy-field">
                <span>{course.stripe_product_id || '— не синхронизировано'}</span>
              </div>
              <div className="copy-field" style={{ marginTop: 6 }}>
                <span>{course.stripe_price_id || '—'}</span>
              </div>
            </div>
            <button className="btn btn-outline" onClick={syncStripe} disabled={syncing}>
              {syncing ? 'Синхронизируем…' : 'Синхронизировать со Stripe'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Статус и видимость</h3>
          </div>
          <div className="card-body">
            <div className="switch-row">
              <div className="sr-text">
                Опубликован
                <div className="sr-sub">Виден на сайте и доступен к покупке</div>
              </div>
              <label className="switch">
                <input type="checkbox" checked={f.is_published} onChange={(e) => set('is_published', e.target.checked)} />
                <span className="track" />
              </label>
            </div>
            <div className="switch-row">
              <div className="sr-text">
                Featured
                <div className="sr-sub">Показывается на главном лендинге (только один курс)</div>
              </div>
              <label className="switch">
                <input type="checkbox" checked={f.is_featured} onChange={(e) => set('is_featured', e.target.checked)} />
                <span className="track" />
              </label>
            </div>
            <Field label="Позиция в списке">
              <input className="input" type="number" value={f.position} onChange={(e) => set('position', e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="card" style={{ borderColor: '#E3C9C9' }}>
          <div className="card-head">
            <h3 style={{ color: 'var(--error)' }}>Опасная зона</h3>
          </div>
          <div className="card-body">
            <button className="btn btn-danger-outline" onClick={del}>
              Удалить курс
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
