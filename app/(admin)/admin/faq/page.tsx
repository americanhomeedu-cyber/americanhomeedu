import type { Metadata } from 'next'
import { HelpCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { FaqView } from '@/components/admin/marketing/faq-view'
import { EmptyState } from '@/components/admin/empty-state'

export const metadata: Metadata = { title: 'FAQ — Админка' }

export default async function AdminFaqPage({
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
        icon={HelpCircle}
        title="Выберите курс"
        text="FAQ привязан к курсу. Выберите его в переключателе курсов сверху."
      />
    )
  }
  const courseId = param || featured?.id
  if (!courseId) {
    return <EmptyState icon={HelpCircle} title="Нет курсов" text="Сначала создайте курс." />
  }

  const { data } = await supabase
    .from('faq_items')
    .select('*')
    .or(`course_id.eq.${courseId},course_id.is.null`)
    .order('position')

  return <FaqView items={data ?? []} courseId={courseId} />
}
