import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { UsersView } from '@/components/admin/users/users-view'

export const metadata: Metadata = { title: 'Ученики — Админка' }

export default async function AdminUsersPage() {
  const supabase = createClient()

  const [profilesRes, enrRes, coursesRes, ordersRes, progressRes, sectionsRes] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, email, role, created_at, last_login_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('course_enrollments')
        .select('user_id, course_id, courses(title)')
        .is('revoked_at', null),
      supabase.from('courses').select('id, title').order('position'),
      supabase.from('orders').select('user_id, amount_cents, status').eq('status', 'completed'),
      supabase.from('course_progress').select('user_id, completed'),
      supabase.from('course_sections').select('id, is_published').eq('is_published', true),
    ])

  const profiles = profilesRes.data ?? []
  const enr = enrRes.data ?? []
  const orders = ordersRes.data ?? []
  const progress = progressRes.data ?? []
  const totalSections = (sectionsRes.data ?? []).length || 1

  const coursesByUser: Record<string, { courseId: string; title: string }[]> = {}
  enr.forEach((e) => {
    if (!e.courses) return
    ;(coursesByUser[e.user_id] = coursesByUser[e.user_id] || []).push({
      courseId: e.course_id,
      title: e.courses.title,
    })
  })

  const spentByUser: Record<string, number> = {}
  orders.forEach((o) => {
    if (!o.user_id) return
    spentByUser[o.user_id] = (spentByUser[o.user_id] || 0) + o.amount_cents
  })

  const doneByUser: Record<string, number> = {}
  progress.forEach((p) => {
    if (p.completed) doneByUser[p.user_id] = (doneByUser[p.user_id] || 0) + 1
  })

  const users = profiles.map((p) => ({
    id: p.id,
    full_name: p.full_name,
    email: p.email,
    role: p.role,
    created_at: p.created_at,
    last_login_at: p.last_login_at,
    courses: coursesByUser[p.id] || [],
    spent: spentByUser[p.id] || 0,
    progress: Math.min(100, Math.round(((doneByUser[p.id] || 0) / totalSections) * 100)),
    hasAccess: (coursesByUser[p.id] || []).length > 0,
  }))

  return <UsersView users={users} courses={coursesRes.data ?? []} />
}
