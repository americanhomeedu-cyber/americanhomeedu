import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AnalyticsView } from '@/components/admin/analytics/analytics-view'

export const metadata: Metadata = { title: 'Аналитика — Админка' }

const DAY = 86_400_000

function periodDays(p: string): number | null {
  if (p === '7') return 7
  if (p === '90') return 90
  if (p === 'all') return null
  return 30
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { course?: string; period?: string }
}) {
  const supabase = createClient()
  const period = searchParams.period || '30'
  const days = periodDays(period)
  const now = Date.now()
  const startISO = days ? new Date(now - days * DAY).toISOString() : '1970-01-01'

  const { data: courses } = await supabase.from('courses').select('id, is_featured, title').order('position')
  const featured = courses?.find((c) => c.is_featured) ?? courses?.[0] ?? null
  const param = searchParams.course
  const isAll = param === 'all'
  const courseId = isAll ? null : param || featured?.id || null
  const courseLabel = isAll ? 'Все курсы' : courses?.find((c) => c.id === courseId)?.title ?? 'курс'

  const [eventsRes, ordersRes, profilesRes, progressRes, sectionsRes] = await Promise.all([
    (() => {
      let q = supabase
        .from('analytics_events')
        .select('event_type, utm_source, utm_medium, session_id, page_url, created_at, course_id')
        .gte('created_at', startISO)
      if (courseId) q = q.eq('course_id', courseId)
      return q
    })(),
    (() => {
      let q = supabase
        .from('orders')
        .select('amount_cents, created_at, status, course_id')
        .eq('status', 'completed')
        .gte('created_at', startISO)
      if (courseId) q = q.eq('course_id', courseId)
      return q
    })(),
    supabase.from('profiles').select('created_at, role').gte('created_at', startISO),
    supabase.from('course_progress').select('section_id, completed'),
    supabase.from('course_sections').select('id, title, course_id, is_published'),
  ])

  const events = eventsRes.data ?? []
  const orders = ordersRes.data ?? []
  const profiles = profilesRes.data ?? []
  const progress = progressRes.data ?? []
  const sections = sectionsRes.data ?? []

  const pv = events.filter((e) => e.event_type === 'page_view')
  const distinct = (arr: (string | null)[]) => new Set(arr.filter(Boolean)).size

  const visitors = distinct(pv.map((e) => e.session_id))
  const pageViews = pv.length
  const registrations = profiles.filter((p) => p.role === 'student').length
  const purchases = orders.length
  const revenue = orders.reduce((s, o) => s + o.amount_cents, 0)
  const conversion = visitors > 0 ? (purchases / visitors) * 100 : null

  const stats = { visitors, pageViews, registrations, purchases, conversion, revenue }

  // ---- timeline (visitors / registrations / purchases per day) ----
  const n = days ?? 30
  const dayKey = (d: number) => new Date(d).toISOString().slice(0, 10)
  const vByDay: Record<string, Set<string>> = {}
  const rByDay: Record<string, number> = {}
  const bByDay: Record<string, number> = {}
  for (let i = n - 1; i >= 0; i--) {
    const k = dayKey(now - i * DAY)
    vByDay[k] = new Set()
    rByDay[k] = 0
    bByDay[k] = 0
  }
  pv.forEach((e) => {
    const k = e.created_at.slice(0, 10)
    if (k in vByDay && e.session_id) vByDay[k].add(e.session_id)
  })
  profiles.forEach((p) => {
    const k = p.created_at.slice(0, 10)
    if (k in rByDay) rByDay[k] += 1
  })
  orders.forEach((o) => {
    const k = o.created_at.slice(0, 10)
    if (k in bByDay) bByDay[k] += 1
  })
  const timeline = Object.keys(vByDay).map((k) => ({
    label: k.slice(5),
    visitors: vByDay[k].size,
    regs: rByDay[k],
    buys: bByDay[k],
  }))

  // ---- hour-of-week heatmap (7x24) from page views ----
  const heat: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
  pv.forEach((e) => {
    const d = new Date(e.created_at)
    const day = (d.getDay() + 6) % 7 // Mon=0
    heat[day][d.getHours()] += 1
  })
  const heatMax = Math.max(1, ...heat.flat())

  // ---- traffic sources / mediums ----
  const groupCount = (key: 'utm_source' | 'utm_medium', fallback: string) => {
    const m = new Map<string, number>()
    pv.forEach((e) => {
      const v = e[key] || fallback
      m.set(v, (m.get(v) || 0) + 1)
    })
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }))
  }
  const sources = groupCount('utm_source', 'Direct')
  const mediums = groupCount('utm_medium', 'none')
  const sourcesTotal = sources.reduce((s, x) => s + x.value, 0) || 1
  const sourceRows = sources.slice(0, 8).map((s) => ({
    name: s.name,
    visits: s.value,
    pct: (s.value / sourcesTotal) * 100,
  }))

  // ---- conversion funnel (event-type based, purchases fall back to orders) ----
  const evCount = (t: string) => events.filter((e) => e.event_type === t).length
  const sessOf = (t: string) => distinct(events.filter((e) => e.event_type === t).map((e) => e.session_id))
  const funnel = [
    { label: 'Визиты', value: visitors },
    { label: 'Клик «Купить»', value: sessOf('cta_click') },
    { label: 'Регистрация начата', value: sessOf('register_start') || evCount('register_start') },
    { label: 'Регистрация завершена', value: registrations },
    { label: 'Checkout начат', value: sessOf('checkout_start') || evCount('checkout_start') },
    { label: 'Куплено', value: purchases },
  ]

  // ---- top pages ----
  const pageMap = new Map<string, number>()
  pv.forEach((e) => {
    const u = e.page_url || '/'
    pageMap.set(u, (pageMap.get(u) || 0) + 1)
  })
  const topPages = Array.from(pageMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([url, views]) => ({ url, views }))

  // ---- course content activity (completed per section) ----
  const doneBySection = new Map<string, number>()
  progress.filter((p) => p.completed).forEach((p) => doneBySection.set(p.section_id, (doneBySection.get(p.section_id) || 0) + 1))
  const scopedSections = (courseId ? sections.filter((s) => s.course_id === courseId) : sections).filter(
    (s) => s.is_published,
  )
  const courseActivity = scopedSections
    .map((s) => ({ title: s.title, done: doneBySection.get(s.id) || 0 }))
    .sort((a, b) => b.done - a.done)
    .slice(0, 8)

  // ---- weekly revenue cohorts (LTV proxy) ----
  const weekMap = new Map<string, number>()
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now - i * 7 * DAY)
    weekMap.set(`${d.getDate()}.${d.getMonth() + 1}`, 0)
  }
  const weekKeys = Array.from(weekMap.keys())
  orders.forEach((o) => {
    const weeksAgo = Math.floor((now - new Date(o.created_at).getTime()) / (7 * DAY))
    if (weeksAgo >= 0 && weeksAgo < 8) {
      const key = weekKeys[7 - weeksAgo]
      weekMap.set(key, (weekMap.get(key) || 0) + o.amount_cents)
    }
  })
  const weeks = Array.from(weekMap.entries()).map(([label, cents]) => ({ label, value: Math.round(cents / 100) }))

  return (
    <AnalyticsView
      courseLabel={courseLabel}
      period={period}
      hasEvents={events.length > 0}
      stats={stats}
      timeline={timeline}
      heat={heat}
      heatMax={heatMax}
      sources={sources}
      mediums={mediums}
      sourceRows={sourceRows}
      funnel={funnel}
      topPages={topPages}
      courseActivity={courseActivity}
      weeks={weeks}
    />
  )
}
