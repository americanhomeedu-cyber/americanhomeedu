import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CoursesView } from '@/components/admin/courses/courses-view'

export const metadata: Metadata = { title: 'Курсы — Админка' }

export default async function AdminCoursesPage() {
  const supabase = createClient()
  const { data: courses } = await supabase.from('courses').select('*').order('position')
  const { data: enr } = await supabase
    .from('course_enrollments')
    .select('course_id')
    .is('revoked_at', null)
  const { data: orders } = await supabase
    .from('orders')
    .select('course_id, amount_cents')
    .eq('status', 'completed')

  const students: Record<string, number> = {}
  ;(enr ?? []).forEach((e) => {
    students[e.course_id] = (students[e.course_id] || 0) + 1
  })
  const revenue: Record<string, number> = {}
  ;(orders ?? []).forEach((o) => {
    revenue[o.course_id] = (revenue[o.course_id] || 0) + o.amount_cents
  })

  const rows = (courses ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    price_cents: c.price_cents,
    old_price_cents: c.old_price_cents,
    currency: c.currency,
    is_published: c.is_published,
    is_featured: c.is_featured,
    students: students[c.id] || 0,
    revenue: revenue[c.id] || 0,
  }))

  return <CoursesView courses={rows} />
}
