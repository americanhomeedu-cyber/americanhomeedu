'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { ExternalLink, Copy, Info } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'

type Course = { id: string; title: string; is_featured: boolean; slug: string }
type Env = { gaId: string; pixelId: string; supabaseUrl: string; siteUrl: string }

const SECTIONS = [
  ['general', 'Общие'],
  ['landing', 'Лендинг'],
  ['texts', 'Тексты лендинга'],
  ['email', 'Email'],
  ['payments', 'Платежи'],
  ['integrations', 'Интеграции'],
  ['seo', 'SEO'],
  ['legal', 'Юридическое'],
  ['security', 'Безопасность'],
] as const
type SectionKey = (typeof SECTIONS)[number][0]

const TEMPLATES = ['welcome.tsx', 'purchase-confirmation.tsx', 'admin-new-sale.tsx', 'manual-access-granted.tsx']
const bool = (v: unknown) => v === true || v === 'true'

/* ---- field components (defined OUTSIDE the form to keep input focus) ---- */
function TextField({
  label,
  value,
  onChange,
  hint,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
  type?: string
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <div className="hint">{hint}</div>}
    </div>
  )
}
function AreaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="field">
      <label>{label}</label>
      <textarea className="textarea" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
function SwitchRow({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string
  sub?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="switch-row">
      <div className="sr-text">
        {label}
        {sub && <div className="sr-sub">{sub}</div>}
      </div>
      <label className="switch">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="track" />
      </label>
    </div>
  )
}
function ReadField({
  label,
  value,
  mono,
  hint,
  onCopy,
}: {
  label: string
  value: string
  mono?: boolean
  hint?: string
  onCopy: (v: string) => void
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="copy-field" style={{ fontFamily: mono ? 'var(--mono)' : 'inherit' }}>
        <span>{value || '— не задано'}</span>
        {value && (
          <button onClick={() => onCopy(value)}>
            <Copy size={14} />
          </button>
        )}
      </div>
      {hint && <div className="hint">{hint}</div>}
    </div>
  )
}

export function SettingsForm({
  values,
  courses,
  env,
}: {
  values: Record<string, unknown>
  courses: Course[]
  env: Env
}) {
  const [active, setActive] = React.useState<SectionKey>('general')
  const [vals, setVals] = React.useState<Record<string, unknown>>({ ...values })
  const [savingKey, setSavingKey] = React.useState<string | null>(null)
  const [featuredId, setFeaturedId] = React.useState(courses.find((c) => c.is_featured)?.id || '')

  const set = (k: string, v: unknown) => setVals((p) => ({ ...p, [k]: v }))
  const txt = (k: string) => String(vals[k] ?? '')
  const copy = (t: string) => {
    navigator.clipboard?.writeText(t)
    toast.info('Скопировано')
  }

  async function saveKeys(section: string, keys: string[]) {
    setSavingKey(section)
    try {
      await Promise.all(
        keys.map((k) =>
          fetch('/api/admin/settings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: k, value: vals[k] ?? '' }),
          }).then((r) => {
            if (!r.ok) throw new Error('Ошибка сохранения')
          }),
        ),
      )
      toast.success('Сохранено')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSavingKey(null)
    }
  }

  async function changeFeatured(id: string) {
    setFeaturedId(id)
    const res = await fetch(`/api/admin/courses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_featured: true }),
    })
    if (res.ok) toast.success('Featured-курс обновлён')
    else toast.error('Ошибка')
  }

  const saveBtn = (section: string, keys: string[]) => (
    <button className="btn btn-primary" onClick={() => saveKeys(section, keys)} disabled={savingKey === section}>
      {savingKey === section ? 'Сохраняем…' : 'Сохранить изменения'}
    </button>
  )

  return (
    <>
      <PageHeader title="Настройки" subtitle="Глобальные параметры сайта" />

      <div className="settings-layout">
        <nav className="settings-nav">
          {SECTIONS.map(([k, l]) => (
            <button key={k} className={active === k ? 'active' : ''} onClick={() => setActive(k)}>
              {l}
            </button>
          ))}
        </nav>

        <div className="settings-content">
          {active === 'general' && (
            <>
              <div className="card">
                <div className="card-head">
                  <h3>Основная информация</h3>
                </div>
                <div className="card-body">
                  <TextField label="Название сайта" value={txt('site_title')} onChange={(v) => set('site_title', v)} />
                  <TextField label="Слоган" value={txt('slogan')} onChange={(v) => set('slogan', v)} />
                  <TextField label="Контактный email" type="email" value={txt('contact_email')} onChange={(v) => set('contact_email', v)} />
                  <TextField label="Email поддержки" type="email" value={txt('support_email')} onChange={(v) => set('support_email', v)} />
                  {saveBtn('general', ['site_title', 'slogan', 'contact_email', 'support_email'])}
                </div>
              </div>
              <div className="card">
                <div className="card-head">
                  <h3>Социальные сети</h3>
                </div>
                <div className="card-body">
                  <TextField label="Instagram" value={txt('social_instagram')} onChange={(v) => set('social_instagram', v)} />
                  <TextField label="YouTube" value={txt('social_youtube')} onChange={(v) => set('social_youtube', v)} />
                  <TextField label="Facebook" value={txt('social_facebook')} onChange={(v) => set('social_facebook', v)} />
                  <TextField label="Telegram" value={txt('social_telegram')} onChange={(v) => set('social_telegram', v)} />
                  {saveBtn('social', ['social_instagram', 'social_youtube', 'social_facebook', 'social_telegram'])}
                </div>
              </div>
            </>
          )}

          {active === 'landing' && (
            <div className="card">
              <div className="card-head">
                <h3>Курс на главной</h3>
              </div>
              <div className="card-body">
                <div className="field">
                  <label>Featured-курс (показывается на лендинге)</label>
                  <select className="select" value={featuredId} onChange={(e) => changeFeatured(e.target.value)}>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <a className="btn btn-outline" href="/" target="_blank" rel="noreferrer">
                  <ExternalLink size={15} />
                  Открыть лендинг
                </a>
                <div className="attention" style={{ background: 'var(--info-soft)', borderColor: '#CBDCF7', marginTop: 16 }}>
                  <div className="row" style={{ gap: 8, fontSize: 13, color: 'var(--ink-2)' }}>
                    <Info size={16} style={{ color: 'var(--info)', flex: 'none' }} />
                    Цена и доступ настраиваются в Курсы → [курс] → Настройки.
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === 'texts' && (
            <>
              <div className="card">
                <div className="card-head">
                  <h3>Hero-секция</h3>
                </div>
                <div className="card-body">
                  <TextField label="Текст бейджа" value={txt('hero_badge_text')} onChange={(v) => set('hero_badge_text', v)} />
                  <TextField label="Заголовок" value={txt('hero_title')} onChange={(v) => set('hero_title', v)} />
                  <TextField label="Подзаголовок" value={txt('hero_subtitle')} onChange={(v) => set('hero_subtitle', v)} />
                  <TextField label="Текст кнопки" value={txt('hero_cta')} onChange={(v) => set('hero_cta', v)} />
                  {saveBtn('hero', ['hero_badge_text', 'hero_title', 'hero_subtitle', 'hero_cta'])}
                </div>
              </div>
              <div className="card">
                <div className="card-head">
                  <h3>Об авторе</h3>
                </div>
                <div className="card-body">
                  <TextField label="Имя" value={txt('about_name')} onChange={(v) => set('about_name', v)} />
                  <TextField label="Должность / регалии" value={txt('about_role')} onChange={(v) => set('about_role', v)} />
                  <AreaField label="Биография" value={txt('about_bio')} onChange={(v) => set('about_bio', v)} />
                  {saveBtn('about', ['about_name', 'about_role', 'about_bio'])}
                </div>
              </div>
            </>
          )}

          {active === 'email' && (
            <>
              <div className="card">
                <div className="card-head">
                  <h3>Адреса</h3>
                </div>
                <div className="card-body">
                  <TextField label="From (отправитель)" value={txt('email_from')} onChange={(v) => set('email_from', v)} hint="На верифицированном домене Resend" />
                  <TextField label="Reply-to" value={txt('email_reply_to')} onChange={(v) => set('email_reply_to', v)} />
                  <TextField label="Email для уведомлений администратора" value={txt('admin_notify_email')} onChange={(v) => set('admin_notify_email', v)} />
                  <SwitchRow label="Уведомлять о регистрациях" checked={bool(vals['notify_registration'])} onChange={(v) => set('notify_registration', v)} />
                  <SwitchRow label="Уведомлять о покупках" checked={bool(vals['notify_purchase'])} onChange={(v) => set('notify_purchase', v)} />
                  <SwitchRow label="Еженедельный дайджест" checked={bool(vals['weekly_digest'])} onChange={(v) => set('weekly_digest', v)} />
                  <div style={{ marginTop: 16 }}>
                    {saveBtn('email', ['email_from', 'email_reply_to', 'admin_notify_email', 'notify_registration', 'notify_purchase', 'weekly_digest'])}
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-head">
                  <h3>Шаблоны писем</h3>
                  <span className="ch-sub">React Email · emails/</span>
                </div>
                <div className="card-body" style={{ display: 'grid', gap: 4 }}>
                  {TEMPLATES.map((t) => (
                    <div className="row" key={t} style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-2)' }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5 }}>{t}</span>
                      <span className="badge green">активен</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {active === 'payments' && (
            <>
              <div className="card">
                <div className="card-head">
                  <h3>Stripe</h3>
                </div>
                <div className="card-body">
                  <ReadField label="Webhook URL" value={`${env.siteUrl}/api/stripe/webhook`} mono onCopy={copy} />
                  <div className="attention" style={{ background: 'var(--warning-soft)', borderColor: '#EAD9B8' }}>
                    <div className="row" style={{ gap: 8, fontSize: 13, color: 'var(--ink-2)' }}>
                      <Info size={16} style={{ color: 'var(--warning)', flex: 'none' }} />
                      Секретные ключи Stripe хранятся в переменных окружения (.env), а не в базе — это безопаснее.
                    </div>
                  </div>
                  <a className="btn btn-outline mt-4" href="https://dashboard.stripe.com" target="_blank" rel="noreferrer">
                    <ExternalLink size={15} />
                    Stripe Dashboard
                  </a>
                </div>
              </div>
              <div className="card">
                <div className="card-head">
                  <h3>Методы оплаты</h3>
                </div>
                <div className="card-body">
                  <SwitchRow label="Банковские карты" checked={bool(vals['pay_card'])} onChange={(v) => set('pay_card', v)} />
                  <SwitchRow label="Apple Pay" checked={bool(vals['pay_apple'])} onChange={(v) => set('pay_apple', v)} />
                  <SwitchRow label="Google Pay" checked={bool(vals['pay_google'])} onChange={(v) => set('pay_google', v)} />
                  <SwitchRow label="Stripe Link" checked={bool(vals['pay_link'])} onChange={(v) => set('pay_link', v)} />
                  <div style={{ marginTop: 16 }}>{saveBtn('pay', ['pay_card', 'pay_apple', 'pay_google', 'pay_link'])}</div>
                </div>
              </div>
            </>
          )}

          {active === 'integrations' && (
            <div className="card">
              <div className="card-head">
                <h3>Интеграции</h3>
                <span className="ch-sub">значения из переменных окружения</span>
              </div>
              <div className="card-body">
                <ReadField label="Google Analytics (GA4 ID)" value={env.gaId} mono hint="NEXT_PUBLIC_GA_ID" onCopy={copy} />
                <ReadField label="Meta Pixel ID" value={env.pixelId} mono hint="NEXT_PUBLIC_META_PIXEL_ID" onCopy={copy} />
                <ReadField label="Supabase Project URL" value={env.supabaseUrl} mono hint="NEXT_PUBLIC_SUPABASE_URL" onCopy={copy} />
              </div>
            </div>
          )}

          {active === 'seo' && (
            <div className="card">
              <div className="card-head">
                <h3>Мета-теги</h3>
              </div>
              <div className="card-body">
                <TextField label="Шаблон Title" value={txt('seo_title_template')} onChange={(v) => set('seo_title_template', v)} hint="Напр.: %s — American Home Blueprint" />
                <AreaField label="Description по умолчанию" value={txt('seo_description')} onChange={(v) => set('seo_description', v)} />
                {saveBtn('seo', ['seo_title_template', 'seo_description'])}
                <div className="hint" style={{ marginTop: 14 }}>
                  robots.txt и sitemap.xml генерируются автоматически из маршрутов.
                </div>
              </div>
            </div>
          )}

          {active === 'legal' && (
            <>
              <div className="card">
                <div className="card-head">
                  <h3>Юридические документы</h3>
                </div>
                <div className="card-body">
                  <AreaField label="Политика конфиденциальности" value={txt('legal_privacy')} onChange={(v) => set('legal_privacy', v)} />
                  <AreaField label="Условия использования" value={txt('legal_terms')} onChange={(v) => set('legal_terms', v)} />
                  <AreaField label="Политика возврата" value={txt('legal_refund')} onChange={(v) => set('legal_refund', v)} />
                  {saveBtn('legal', ['legal_privacy', 'legal_terms', 'legal_refund'])}
                </div>
              </div>
              <div className="card">
                <div className="card-head">
                  <h3>Cookie-баннер</h3>
                </div>
                <div className="card-body">
                  <SwitchRow label="Показывать cookie-баннер" checked={bool(vals['cookie_enabled'])} onChange={(v) => set('cookie_enabled', v)} />
                  <AreaField label="Текст баннера" value={txt('cookie_banner_text')} onChange={(v) => set('cookie_banner_text', v)} />
                  {saveBtn('cookie', ['cookie_enabled', 'cookie_banner_text'])}
                </div>
              </div>
            </>
          )}

          {active === 'security' && (
            <>
              <div className="card">
                <div className="card-head">
                  <h3>Защита</h3>
                </div>
                <div className="card-body">
                  <div className="attention" style={{ background: 'var(--success-soft)', borderColor: '#CBE3D2' }}>
                    <div className="row" style={{ gap: 8, fontSize: 13, color: 'var(--ink-2)' }}>
                      <Info size={16} style={{ color: 'var(--success)', flex: 'none' }} />
                      Rate limiting на входе и подтверждении кода включён в коде. RLS активен на всех таблицах.
                    </div>
                  </div>
                  <SwitchRow label="Требовать 2FA для админов" sub="резерв на будущее" checked={bool(vals['require_2fa'])} onChange={(v) => set('require_2fa', v)} />
                  <div style={{ marginTop: 12 }}>{saveBtn('security', ['require_2fa'])}</div>
                </div>
              </div>
              <div className="card">
                <div className="card-head">
                  <h3>Логи безопасности</h3>
                </div>
                <div className="card-body">
                  <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>
                    Журнал событий безопасности появится после подключения аудита.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
