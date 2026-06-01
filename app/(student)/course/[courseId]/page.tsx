import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Book } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CourseViewer } from '@/components/course-viewer/course-viewer'
import type { Block } from '@/types/blocks'

export const metadata: Metadata = { title: 'Курс — American Home Blueprint' }

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: { courseId: string }
  searchParams: { s?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect=/course/${params.courseId}`)

  // Admins can preview any course (incl. draft sections); students need an
  // active enrollment.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  const isAdmin = profile?.role === 'admin'

  if (!isAdmin) {
    const { data: enr } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', params.courseId)
      .is('revoked_at', null)
      .maybeSingle()
    if (!enr) redirect('/dashboard')
  }

  const { data: course } = await supabase
    .from('courses')
    .select('id, title')
    .eq('id', params.courseId)
    .single()
  if (!course) redirect('/dashboard')

  // Students see only published sections; admins preview everything.
  let secQuery = supabase
    .from('course_sections')
    .select('id, title, position, estimated_minutes, blocks')
    .eq('course_id', course.id)
  if (!isAdmin) secQuery = secQuery.eq('is_published', true)
  const { data: secs } = await secQuery.order('position')

  const published = (secs ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    estimated_minutes: s.estimated_minutes,
    blocks: (s.blocks as unknown as Block[]) ?? [],
  }))

  if (!published.length) {
    return (
      <main className="s-main">
        <div className="empty">
          <div className="em-ic">
            <Book size={34} />
          </div>
          <h2>Курс скоро будет доступен</h2>
          <p>Мы готовим материалы курса. Загляните чуть позже.</p>
          <Link className="btn btn-primary" href="/dashboard">
            ← Вернуться в кабинет
          </Link>
        </div>
      </main>
    )
  }

  const { data: prog } = await supabase
    .from('course_progress')
    .select('section_id')
    .eq('user_id', user.id)
    .eq('completed', true)
    .in(
      'section_id',
      published.map((s) => s.id),
    )
  const doneIds = (prog ?? []).map((p) => p.section_id)
  const currentId =
    searchParams.s && published.find((s) => s.id === searchParams.s)
      ? searchParams.s
      : (published.find((s) => !doneIds.includes(s.id)) ?? published[0]).id

  return (
    <CourseViewer
      courseId={course.id}
      courseTitle={course.title}
      sections={published}
      currentId={currentId}
      doneIds={doneIds}
    />
  )
}
