import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/student/profile-form'
import { StudentFooter } from '@/components/student/student-footer'

export const metadata: Metadata = { title: 'Профиль — American Home Blueprint' }

export default async function ProfilePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/profile')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone')
    .eq('id', user.id)
    .single()
  if (!profile) redirect('/login')

  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select('granted_at, courses(id, title, cover_image_url)')
    .eq('user_id', user.id)
    .is('revoked_at', null)
    .order('granted_at', { ascending: false })

  const courses = (enrollments ?? [])
    .filter((e) => e.courses)
    .map((e) => ({
      id: e.courses!.id,
      title: e.courses!.title,
      cover_image_url: e.courses!.cover_image_url,
      granted_at: e.granted_at,
    }))

  return (
    <>
      <main className="s-main">
        <ProfileForm
          profile={{
            id: profile.id,
            full_name: profile.full_name || '',
            email: profile.email,
            phone: profile.phone || '',
          }}
          courses={courses}
        />
      </main>
      <StudentFooter />
    </>
  )
}
