import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CourseSettingsForm } from '@/components/admin/courses/course-settings-form'

export default async function CourseSettingsPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.id)
    .single()
  if (!course) notFound()
  return <CourseSettingsForm course={course} />
}
