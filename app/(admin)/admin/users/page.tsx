import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { UsersView } from '@/components/admin/users/users-view'

export const metadata: Metadata = { title: 'Ученики — Админка' }

export default async function AdminUsersPage() {
  const supabase = createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, created_at')
    .order('created_at', { ascending: false })
  const { data: enr } = await supabase
    .from('course_enrollments')
    .select('user_id, course_id, courses(title)')
    .is('revoked_at', null)
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title')
    .order('position')

  const byUser: Record<string, { courseId: string; title: string }[]> = {}
  ;(enr ?? []).forEach((e) => {
    if (!e.courses) return
    ;(byUser[e.user_id] = byUser[e.user_id] || []).push({
      courseId: e.course_id,
      title: e.courses.title,
    })
  })

  const users = (profiles ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    email: p.email,
    role: p.role,
    created_at: p.created_at,
    courses: byUser[p.id] || [],
  }))

  return <UsersView users={users} courses={courses ?? []} />
}
