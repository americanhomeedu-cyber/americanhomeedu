import type { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { StudentTopbar } from '@/components/student/student-topbar'
import './student.css'

export default async function StudentLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single()
    : { data: null }

  return (
    <div className="theme-student flex min-h-screen flex-col bg-cream text-ink">
      <StudentTopbar
        name={profile?.full_name ?? 'Профиль'}
        email={profile?.email ?? ''}
      />
      {children}
    </div>
  )
}
