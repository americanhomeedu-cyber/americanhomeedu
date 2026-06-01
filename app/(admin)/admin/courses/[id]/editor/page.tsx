import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { nanoid } from 'nanoid'
import { createClient } from '@/lib/supabase/server'
import { CourseEditor } from '@/components/course-editor/course-editor'
import type { Block } from '@/types/blocks'
import './editor.css'

export const metadata: Metadata = { title: 'Редактор курса — Админка' }

export default async function CourseEditorPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const { data: course } = await supabase
    .from('courses')
    .select('id, title')
    .eq('id', params.id)
    .single()
  if (!course) notFound()

  const { data: secs } = await supabase
    .from('course_sections')
    .select('*')
    .eq('course_id', course.id)
    .order('position')

  const sections = (secs ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    blocks: ((s.blocks as unknown as Block[]) ?? []).map((b) => ({
      ...b,
      id: b.id || nanoid(),
    })),
    is_published: s.is_published,
    position: s.position,
    estimated_minutes: s.estimated_minutes,
  }))

  return (
    <CourseEditor
      courseId={course.id}
      courseTitle={course.title}
      initialSections={sections}
    />
  )
}
