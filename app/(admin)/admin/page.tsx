import type { Metadata } from 'next'
import Link from 'next/link'
import {
  CreditCard,
  UserPlus,
  Activity,
  Target,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Star,
  BookOpen,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/admin/page-header'
import { StatCard } from '@/components/admin/stat-card'
import { RevenueChart } from '@/components/admin/dashboard/revenue-chart'
import { DonutChart } from '@/components/admin/dashboard/donut-chart'
import { PeriodSwitcher } from '@/components/admin/dashboard/period-switcher'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Главная — Админка' }

const COURSE_COLORS = ['#2D4A3E', '#1E3A5F', '#9A7B3F', '#5B3A6B', '#2A6B5E', '#B45309']
const SOURCE_COLORS = ['#C9A96E', '#2D4A3E', '#B33A3A', '#4A7C59', '#9CA3AF', '#2563EB']
const DAY = 86_400_000

function periodDays(p: string): number | null {
  if (p === 'today') return 1
  if (p === '7') return 7
  if (p === '90') return 90
  if (p === 'all') return null
  return 30
}

function deltaProps(curr: number, prev: number, hasPrev: boolean) {
  if (!hasPrev || prev <= 0) return {}
  const d = ((curr - prev) / prev) * 100
  return {
    delta: `${d >= 0 ? '+' : ''}${d.toFixed(1)}%`,
    deltaUp: d >= 0,
    deltaNote: 'к пред. периоду',
  }
}

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: { course?: string; period?: string }
}) {
  const supabase = createClient()

  const period = searchParams.period || '30'
  const days = periodDays(period)
  const now = Date.now()
  const start = days ? now - days * DAY : 0
  const prevStart = days ? now - 2 * days * DAY : 0
  const hasPrev = days != null
  const startISO = new Date(start).toISOString()

  // ---- course context ----
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, slug, currency, is_featured, price_cents, is_published')
    .order('position')
  const courseColor = (id: string) =>
    COURSE_COLORS[(courses ?? []).findIndex((c) => c.id === id) % COURSE_COLORS.length] ||
    COURSE_COLORS[0]
  const featured = courses?.find((c) => c.is_featured) ?? courses?.[0] ?? null
  const param = searchParams.course
  const isAll = param === 'all'
  const courseId = isAll ? null : param || featured?.id || null
  const currentCourse = courseId ? courses?.find((c) => c.id === courseId) : null
  const currency = currentCourse?.currency || featured?.currency || 'usd'
  const courseLabel = isAll ? 'Все курсы' : currentCourse?.title ?? 'курс'

  // ---- parallel data pulls (all DB-backed) ----
  const [
    ordersRes,
    enrRes,
    profilesRes,
    progressRes,
    eventsRes,
    sectionsRes,
    testimonialsRes,
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('amount_cents, created_at, status, course_id, customer_name, customer_email')
      .order('created_at', { ascending: false }),
    supabase
      .from('course_enrollments')
      .select('granted_at, course_id, user_id')
      .is('revoked_at', null),
    supabase.from('profiles').select('id, full_name, created_at, role'),
    supabase.from('course_progress').select('user_id, section_id, completed, updated_at'),
    supabase
      .from('analytics_events')
      .select('event_type, utm_source, session_id, created_at, course_id')
      .gte('created_at', days ? startISO : '1970-01-01'),
    supabase.from('course_sections').select('id, course_id, is_published'),
    supabase.from('testimonials').select('id, course_id, is_published'),
  ])

  const allOrders = ordersRes.data ?? []
  const enrollments = enrRes.data ?? []
  const profiles = profilesRes.data ?? []
  const progress = progressRes.data ?? []
  const events = eventsRes.data ?? []
  const sections = sectionsRes.data ?? []
  const testimonials = testimonialsRes.data ?? []

  const inCourse = <T extends { course_id: string | null }>(rows: T[]) =>
    courseId ? rows.filter((r) => r.course_id === courseId) : rows
  const inPeriod = (iso: string) => (days ? iso >= startISO : true)

  // section ids for the active course (to scope progress)
  const courseSectionIds = new Set(
    (courseId ? sections.filter((s) => s.course_id === courseId) : sections).map((s) => s.id),
  )
  const publishedSectionCount =
    (courseId ? sections.filter((s) => s.course_id === courseId) : sections).filter(
      (s) => s.is_published,
    ).length || 1

  // ---- 1. Revenue ----
  const completed = inCourse(allOrders).filter((o) => o.status === 'completed')
  const revCurr = completed
    .filter((o) => inPeriod(o.created_at))
    .reduce((s, o) => s + o.amount_cents, 0)
  const revPrev = hasPrev
    ? completed
        .filter((o) => o.created_at >= new Date(prevStart).toISOString() && o.created_at < startISO)
        .reduce((s, o) => s + o.amount_cents, 0)
    : 0

  // ---- 2. New students (enrollments in period) ----
  const enrScoped = inCourse(enrollments)
  const newCurr = enrScoped.filter((e) => inPeriod(e.granted_at)).length
  const newPrev = hasPrev
    ? enrScoped.filter(
        (e) => e.granted_at >= new Date(prevStart).toISOString() && e.granted_at < startISO,
      ).length
    : 0

  // ---- 3. Active this week (distinct users touching progress in last 7d) ----
  const weekAgo = new Date(now - 7 * DAY).toISOString()
  const twoWeeksAgo = new Date(now - 14 * DAY).toISOString()
  const scopedProgress = courseId
    ? progress.filter((p) => courseSectionIds.has(p.section_id))
    : progress
  const activeCurr = new Set(
    scopedProgress.filter((p) => p.updated_at >= weekAgo).map((p) => p.user_id),
  ).size
  const activePrev = new Set(
    scopedProgress
      .filter((p) => p.updated_at >= twoWeeksAgo && p.updated_at < weekAgo)
      .map((p) => p.user_id),
  ).size

  // ---- 4. Conversion (purchases / unique visitors) ----
  const pageViews = inCourse(events).filter((e) => e.event_type === 'page_view')
  const visitors = new Set(pageViews.map((e) => e.session_id).filter(Boolean)).size
  const purchasesInPeriod = completed.filter((o) => inPeriod(o.created_at)).length
  const conversion = visitors > 0 ? (purchasesInPeriod / visitors) * 100 : null

  // ---- revenue chart series ----
  const series: { date: string; value: number }[] = []
  if (days && days <= 1) {
    // hourly today
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0)
    for (let h = 0; h < 24; h++) series.push({ date: `${h}:00`, value: 0 })
    completed
      .filter((o) => new Date(o.created_at) >= startOfToday)
      .forEach((o) => {
        const h = new Date(o.created_at).getHours()
        series[h].value += Math.round(o.amount_cents / 100)
      })
  } else {
    const n = days ?? 30
    const byDay: Record<string, number> = {}
    for (let i = n - 1; i >= 0; i--) byDay[new Date(now - i * DAY).toISOString().slice(0, 10)] = 0
    completed.forEach((o) => {
      const d = o.created_at.slice(0, 10)
      if (d in byDay) byDay[d] += o.amount_cents
    })
    Object.entries(byDay).forEach(([date, cents]) =>
      series.push({ date, value: Math.round(cents / 100) }),
    )
  }

  // ---- traffic sources (donut) ----
  const sourceMap = new Map<string, number>()
  pageViews.forEach((e) => {
    const k = e.utm_source || 'Direct'
    sourceMap.set(k, (sourceMap.get(k) || 0) + 1)
  })
  const sources = Array.from(sourceMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value], i) => ({ name, value, color: SOURCE_COLORS[i % SOURCE_COLORS.length] }))

  // ---- funnel ----
  const regInPeriod = profiles.filter((p) => p.role === 'student' && inPeriod(p.created_at)).length
  const checkoutStarts = new Set(
    inCourse(events)
      .filter((e) => e.event_type === 'checkout_start')
      .map((e) => e.session_id)
      .filter(Boolean),
  ).size
  const funnelSteps = [
    { label: 'Посетители', value: visitors, color: '#2D4A3E' },
    { label: 'Регистрации', value: regInPeriod, color: '#3D5A4E' },
    { label: 'Начали checkout', value: checkoutStarts, color: '#C9A96E' },
    { label: 'Купили', value: purchasesInPeriod, color: '#4A7C59' },
  ]
  const funnelBase = funnelSteps.find((s) => s.value > 0)?.value || 1
  const hasFunnel = funnelSteps.some((s) => s.value > 0)

  // ---- recent purchases (latest 5 completed, course-scoped) ----
  const recent = completed.slice(0, 5)

  // ---- most active students ----
  const completedByUser = new Map<string, number>()
  scopedProgress
    .filter((p) => p.completed)
    .forEach((p) => completedByUser.set(p.user_id, (completedByUser.get(p.user_id) || 0) + 1))
  const profName = new Map(profiles.map((p) => [p.id, p.full_name || '—']))
  const activeStudents = Array.from(completedByUser.entries())
    .map(([uid, done]) => ({
      name: profName.get(uid) || '—',
      pct: Math.min(100, Math.round((done / publishedSectionCount) * 100)),
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5)

  // ---- by-course breakdown (all mode) ----
  const byCourse = (courses ?? [])
    .map((c) => ({
      ...c,
      students: enrollments.filter((e) => e.course_id === c.id).length,
      revenue: allOrders
        .filter((o) => o.course_id === c.id && o.status === 'completed')
        .reduce((s, o) => s + o.amount_cents, 0),
    }))
    .sort((a, b) => b.revenue - a.revenue)
  const maxCourseRev = Math.max(1, ...byCourse.map((c) => c.revenue))

  // ---- attention ----
  const pendingOrders = inCourse(allOrders).filter((o) => o.status === 'pending').length
  const draftReviews = inCourse(testimonials).filter((t) => !t.is_published).length
  const draftSections = (courseId ? sections.filter((s) => s.course_id === courseId) : sections).filter(
    (s) => !s.is_published,
  ).length
  const attention = [
    pendingOrders > 0 && {
      icon: AlertCircle,
      label: `${pendingOrders} ${pendingOrders === 1 ? 'заказ ожидает' : 'заказов ожидают'} обработки`,
      href: '/admin/orders',
    },
    draftReviews > 0 && {
      icon: Star,
      label: `${draftReviews} ${draftReviews === 1 ? 'отзыв' : 'отзывов'} на модерации`,
      href: '/admin/testimonials',
    },
    draftSections > 0 && {
      icon: BookOpen,
      label: `${draftSections} ${draftSections === 1 ? 'секция' : 'секций'} в статусе Draft`,
      href: '/admin/courses',
    },
  ].filter(Boolean) as { icon: typeof Star; label: string; href: string }[]

  // ---- greeting ----
  const { data: { user } } = await supabase.auth.getUser()
  let firstName = 'Алла'
  if (user) {
    const { data: me } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    const fn = me?.full_name || ''
    if (fn && !fn.includes('@')) firstName = fn.split(/\s+/)[0]
  }
  const hour = new Date().getHours()
  const greeting = hour < 5 ? 'Доброй ночи' : hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер'
  const today = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })

  const periodWord =
    period === 'today' ? 'сегодня' : period === 'all' ? 'за всё время' : `за ${days} дн.`

  return (
    <>
      <PageHeader
        title={`${greeting}, ${firstName} 👋`}
        subtitle={`${isAll ? 'Сводка по всем курсам' : `Курс: ${courseLabel}`} · ${today}`}
      >
        <PeriodSwitcher value={period} />
      </PageHeader>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard
          label="Выручка"
          value={formatPrice(revCurr, currency)}
          icon={CreditCard}
          iconBg="var(--accent-soft)"
          iconColor="#9A7B3F"
          {...deltaProps(revCurr, revPrev, hasPrev)}
        />
        <StatCard
          label="Новые ученики"
          value={newCurr}
          icon={UserPlus}
          iconBg="var(--success-soft)"
          iconColor="var(--success)"
          {...deltaProps(newCurr, newPrev, hasPrev)}
        />
        <StatCard
          label="Активны за неделю"
          value={activeCurr}
          icon={Activity}
          iconBg="var(--info-soft)"
          iconColor="var(--info)"
          {...deltaProps(activeCurr, activePrev, true)}
        />
        <StatCard
          label="Конверсия"
          value={conversion == null ? '—' : `${conversion.toFixed(1)}%`}
          icon={Target}
          iconBg="var(--success-soft)"
          iconColor="var(--success)"
        />
      </div>

      {isAll && byCourse.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-head">
            <h3>По курсам</h3>
            <span className="ch-sub">выручка и ученики</span>
          </div>
          <div className="card-body">
            {byCourse.map((c) => (
              <div className="bc-row" key={c.id}>
                <span className="bc-tile" style={{ background: courseColor(c.id) }}>
                  {c.title[0]}
                </span>
                <div className="bc-mid">
                  <div className="row" style={{ justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ fontWeight: 600 }}>
                      {c.title}
                      {!c.is_published && (
                        <span className="badge gray" style={{ marginLeft: 8 }}>
                          Draft
                        </span>
                      )}
                    </span>
                    <span className="cell-muted" style={{ fontSize: 12.5 }}>
                      {c.students} учеников · {formatPrice(c.revenue, c.currency)}
                    </span>
                  </div>
                  <div className="bc-bar">
                    <div
                      style={{
                        width: `${Math.max(3, (c.revenue / maxCourseRev) * 100)}%`,
                        background: courseColor(c.id),
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dash-grid">
        <div className="card span2">
          <div className="card-head">
            <h3>Выручка</h3>
            <span className="ch-sub">{periodWord}</span>
          </div>
          <div className="card-body">
            <RevenueChart data={series} />
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <h3>Откуда приходят</h3>
          </div>
          <div className="card-body">
            {sources.length === 0 ? (
              <div style={{ padding: '28px 8px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
                Нет данных о трафике за период.
                <br />
                Появятся после подключения аналитики.
              </div>
            ) : (
              <DonutChart
                data={sources}
                centerValue={visitors.toLocaleString('ru-RU')}
                centerLabel="визитов"
              />
            )}
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-head">
          <h3>Воронка конверсии</h3>
          <span className="ch-sub">{periodWord}</span>
        </div>
        <div className="card-body">
          {!hasFunnel ? (
            <div style={{ padding: '20px 8px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              Недостаточно данных для воронки за выбранный период.
            </div>
          ) : (
            <div className="funnel">
              {funnelSteps.map((s, i) => {
                const pct = (s.value / funnelBase) * 100
                const drop =
                  i > 0 && funnelSteps[i - 1].value > 0
                    ? Math.round((1 - s.value / funnelSteps[i - 1].value) * 100)
                    : null
                return (
                  <div className="funnel-row" key={s.label}>
                    {drop != null && drop > 0 && (
                      <div className="funnel-drop">↓ отсеялось {drop}%</div>
                    )}
                    <div
                      className="funnel-bar"
                      style={{ width: `${Math.max(pct, 22)}%`, background: s.color }}
                    >
                      <span className="fn-label">{s.label}</span>
                      <span className="fn-val">{s.value.toLocaleString('ru-RU')}</span>
                      <span className="fn-pct">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid-2 mt-4">
        <div className="card">
          <div className="card-head">
            <h3>Последние покупки</h3>
            <Link href="/admin/orders" className="ch-sub" style={{ color: 'var(--primary)' }}>
              Все →
            </Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recent.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
                Пока нет покупок
              </div>
            ) : (
              <table className="tbl">
                <tbody>
                  {recent.map((o, i) => (
                    <tr key={i}>
                      <td>
                        <div className="cell-user">
                          <span className="ava s32">
                            {(o.customer_name || o.customer_email || '?')[0].toUpperCase()}
                          </span>
                          <div>
                            <div className="cu-name">{o.customer_name || '—'}</div>
                            <div className="cu-sub">{o.customer_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="cell-strong" style={{ textAlign: 'right' }}>
                        {formatPrice(o.amount_cents, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Самые активные ученики</h3>
          </div>
          <div className="card-body" style={{ padding: activeStudents.length ? 20 : 0 }}>
            {activeStudents.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
                Пока нет активности учеников
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                {activeStudents.map((s, i) => (
                  <div className="row" key={i} style={{ gap: 10 }}>
                    <span className="ava s32 alt2">
                      {s.name
                        .split(/\s+/)
                        .map((w) => w[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </span>
                    <span style={{ flex: 1, minWidth: 0, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.name}
                    </span>
                    <div className="cell-prog" style={{ minWidth: 120, flex: 'none' }}>
                      <div className="prog gold">
                        <div className="bar" style={{ width: `${s.pct}%` }} />
                      </div>
                      <span className="pct">{s.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {attention.length > 0 && (
        <div className="attention mt-4">
          <h4>
            <Sparkles size={16} style={{ color: '#9A7B3F' }} />
            Требует внимания
          </h4>
          {attention.map((a, i) => {
            const Icon = a.icon
            return (
              <Link className="attention-item" href={a.href} key={i}>
                <Icon size={16} />
                {a.label}
                <ChevronRight size={16} className="ai-arrow" />
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
