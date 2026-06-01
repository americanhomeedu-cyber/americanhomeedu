import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserDetail } from '@/components/admin/users/user-detail'

export const metadata: Metadata = { title: 'Профиль ученика — Админка' }

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, notes, role, created_at, last_login_at')
    .eq('id', params.id)
    .single()
  if (!profile) notFound()

  const [enrRes, ordersRes, progressRes, sectionsRes, eventsRes, coursesRes] = await Promise.all([
    supabase
      .from('course_enrollments')
      .select('course_id, source, granted_at, revoked_at, courses(title)')
      .eq('user_id', params.id),
    supabase
      .from('orders')
      .select('id, amount_cents, currency, status, created_at, promo_code, courses(title)')
      .eq('user_id', params.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('course_progress')
      .select('section_id, completed, time_spent_seconds, updated_at')
      .eq('user_id', params.id),
    supabase
      .from('course_sections')
      .select('id, title, position, course_id, is_published')
      .order('position'),
    supabase
      .from('analytics_events')
      .select('event_type, page_url, created_at')
      .eq('user_id', params.id)
      .order('created_at', { ascending: false })
      .limit(40),
    supabase.from('courses').select('id, title').order('position'),
  ])

  const enrollments = (enrRes.data ?? [])
    .filter((e) => !e.revoked_at)
    .map((e) => ({
      courseId: e.course_id,
      title: e.courses?.title ?? 'курс',
      source: e.source,
      granted_at: e.granted_at,
    }))

  const orders = (ordersRes.data ?? []).map((o) => ({
    id: o.id,
    amount_cents: o.amount_cents,
    currency: o.currency,
    status: o.status,
    created_at: o.created_at,
    promo_code: o.promo_code,
    courseTitle: o.courses?.title ?? null,
  }))

  const progress = progressRes.data ?? []
  const sections = sectionsRes.data ?? []
  const events = eventsRes.data ?? []
  const courses = coursesRes.data ?? []

  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId))
  const relevantSections = sections.filter(
    (s) => s.is_published && enrolledCourseIds.has(s.course_id),
  )
  const doneSet = new Set(progress.filter((p) => p.completed).map((p) => p.section_id))
  const progressPct = relevantSections.length
    ? Math.round((relevantSections.filter((s) => doneSet.has(s.id)).length / relevantSections.length) * 100)
    : 0
  const timeSpent = progress.reduce((s, p) => s + (p.time_spent_seconds || 0), 0)
  const spent = orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.amount_cents, 0)

  return (
    <UserDetail
      profile={profile}
      enrollments={enrollments}
      orders={orders}
      sections={sections.filter((s) => enrolledCourseIds.has(s.course_id))}
      doneSectionIds={Array.from(doneSet)}
      events={events}
      courses={courses}
      stats={{ progressPct, timeSpent, ordersCount: orders.length, spent }}
    />
  )
}
