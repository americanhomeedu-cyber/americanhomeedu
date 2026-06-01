import type { Metadata } from 'next'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { TestimonialsView } from '@/components/admin/marketing/testimonials-view'
import { EmptyState } from '@/components/admin/empty-state'

export const metadata: Metadata = { title: 'Отзывы — Админка' }

export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: { course?: string }
}) {
  const supabase = createClient()
  const { data: courses } = await supabase.from('courses').select('id, is_featured')
  const featured = courses?.find((c) => c.is_featured) ?? courses?.[0] ?? null
  const param = searchParams.course

  if (param === 'all') {
    return (
      <EmptyState
        icon={Star}
        title="Выберите курс"
        text="Отзывы привязаны к курсу. Выберите его в переключателе курсов сверху."
      />
    )
  }
  const courseId = param || featured?.id
  if (!courseId) {
    return <EmptyState icon={Star} title="Нет курсов" text="Сначала создайте курс." />
  }

  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .or(`course_id.eq.${courseId},course_id.is.null`)
    .order('position')

  return <TestimonialsView items={data ?? []} courseId={courseId} />
}
