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

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, slug, price_cents, currency, is_published, is_featured, cover_image_url')
    .order('position')

  return (
    <div className="theme-admin">
      <CourseProvider courses={courses ?? []}>
        <AdminShell
          adminName={profile?.full_name ?? 'Администратор'}
          adminEmail={user.email}
        >
          {children}
        </AdminShell>
      </CourseProvider>
    </div>
  )
}
