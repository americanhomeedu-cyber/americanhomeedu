import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { OrdersView } from '@/components/admin/orders/orders-view'

export const metadata: Metadata = { title: 'Заказы — Админка' }

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { course?: string }
}) {
  const supabase = createClient()
  const { data: courses } = await supabase.from('courses').select('id, is_featured')
  const featured = courses?.find((c) => c.is_featured) ?? courses?.[0] ?? null
  const param = searchParams.course
  const isAll = param === 'all'
  const courseId = isAll ? null : param || featured?.id || null

  let q = supabase
    .from('orders')
    .select(
      'id, amount_cents, currency, status, customer_name, customer_email, created_at, courses(title)',
    )
    .order('created_at', { ascending: false })
  if (courseId) q = q.eq('course_id', courseId)
  const { data } = await q

  const orders = (data ?? []).map((o) => ({
    id: o.id,
    amount_cents: o.amount_cents,
    currency: o.currency,
    status: o.status,
    customer_name: o.customer_name,
    customer_email: o.customer_email,
    created_at: o.created_at,
    courseTitle: o.courses?.title ?? null,
  }))

  return <OrdersView orders={orders} />
}
