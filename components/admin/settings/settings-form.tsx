'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/page-header'

const FIELDS: Array<{ key: string; label: string; type?: string }> = [
  { key: 'site_title', label: 'Название сайта' },
  { key: 'contact_email', label: 'Контактный email' },
  { key: 'support_email', label: 'Email поддержки' },
  { key: 'refund_days', label: 'Дней на возврат', type: 'number' },
  { key: 'hero_badge_text', label: 'Текст бейджа на лендинге' },
  { key: 'social_instagram', label: 'Instagram URL' },
  { key: 'social_youtube', label: 'YouTube URL' },
  { key: 'social_facebook', label: 'Facebook URL' },
]

export function SettingsForm({ values }: { values: Record<string, unknown> }) {
  const [vals, setVals] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(FIELDS.map((f) => [f.key, String(values[f.key] ?? '')])),
  )
  const [saving, setSaving] = React.useState(false)

  async function save() {
    setSaving(true)
    for (const f of FIELDS) {
      const value = f.type === 'number' ? Number(vals[f.key]) : vals[f.key]
      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: f.key, value }),
      })
    }
    setSaving(false)
    toast.success('Настройки сохранены')
  }

  return (
    <>
      <PageHeader title="Настройки" subtitle="Общие настройки сайта">
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Сохраняем…' : 'Сохранить'}
        </button>
      </PageHeader>
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-head">
          <h3>Общие</h3>
        </div>
        <div className="card-body">
          {FIELDS.map((f) => (
            <div className="field" key={f.key}>
              <label>{f.label}</label>
              <input
                className="input"
                type={f.type || 'text'}
                value={vals[f.key]}
                onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <div className="hint">
            Featured-курс выбирается на странице настроек конкретного курса
            (переключатель «Featured»).
          </div>
        </div>
      </div>
    </>
  )
}
