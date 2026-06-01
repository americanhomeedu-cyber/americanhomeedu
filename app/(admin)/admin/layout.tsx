import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CourseProvider } from '@/lib/contexts/course-context'
import { AdminShell } from '@/components/admin/admin-shell'
import '../admin.css'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const [coursesRes, pendingRes, reviewsRes, sectionsRes] = await Promise.all([
    supabase
      .from('courses')
      .select('id, title, slug, price_cents, currency, is_published, is_featured, cover_image_url')
      .order('position'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('testimonials').select('id', { count: 'exact', head: true }).eq('is_published', false),
    supabase.from('course_sections').select('id', { count: 'exact', head: true }).eq('is_published', false),
  ])

  const notif = {
    pendingOrders: pendingRes.count ?? 0,
    draftReviews: reviewsRes.count ?? 0,
    draftSections: sectionsRes.count ?? 0,
  }

  return (
    <div className="theme-admin">
      <CourseProvider courses={coursesRes.data ?? []}>
        <AdminShell
          adminName={profile?.full_name ?? 'Администратор'}
          adminEmail={user.email}
          notif={notif}
        >
          {children}
        </AdminShell>
      </CourseProvider>
    </div>
  )
}
