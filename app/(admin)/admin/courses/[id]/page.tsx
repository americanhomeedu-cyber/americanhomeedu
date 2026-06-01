import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CourseDetail } from '@/components/admin/courses/course-detail'

const COURSE_COLORS = ['#2D4A3E', '#1E3A5F', '#9A7B3F', '#5B3A6B', '#2A6B5E', '#B45309']

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: course } = await supabase.from('courses').select('*').eq('id', params.id).single()
  if (!course) notFound()

  const [sectionsRes, enrRes, testimonialsRes, faqRes, ordersRes, idsRes] = await Promise.all([
    supabase
      .from('course_sections')
      .select('id, title, position, is_published, estimated_minutes')
      .eq('course_id', params.id)
      .order('position'),
    supabase
      .from('course_enrollments')
      .select('user_id, granted_at, source, profiles!course_enrollments_user_id_fkey(full_name, email)')
      .eq('course_id', params.id)
      .is('revoked_at', null)
      .order('granted_at', { ascending: false }),
    supabase
      .from('testimonials')
      .select('id, name, city, rating, text, is_published, position')
      .eq('course_id', params.id)
      .order('position'),
    supabase
      .from('faq_items')
      .select('id, question, is_published, position')
      .eq('course_id', params.id)
      .order('position'),
    supabase
      .from('orders')
      .select('id, amount_cents, currency, status, created_at, customer_name, customer_email')
      .eq('course_id', params.id)
      .order('created_at', { ascending: false }),
    supabase.from('courses').select('id').order('position'),
  ])

  const colorIdx = (idsRes.data ?? []).findIndex((c) => c.id === params.id)
  const color = COURSE_COLORS[(colorIdx < 0 ? 0 : colorIdx) % COURSE_COLORS.length]

  const students = (enrRes.data ?? []).map((e) => ({
    userId: e.user_id,
    name: e.profiles?.full_name ?? null,
    email: e.profiles?.email ?? '',
    granted_at: e.granted_at,
    source: e.source,
  }))

  return (
    <CourseDetail
      course={course}
      color={color}
      sections={sectionsRes.data ?? []}
      students={students}
      testimonials={testimonialsRes.data ?? []}
      faqs={faqRes.data ?? []}
      orders={ordersRes.data ?? []}
    />
  )
}
