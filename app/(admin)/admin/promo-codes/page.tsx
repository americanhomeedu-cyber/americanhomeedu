import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PromoView } from '@/components/admin/marketing/promo-view'

export const metadata: Metadata = { title: 'Промокоды — Админка' }

export default async function AdminPromoPage() {
  const supabase = createClient()
  const { data: promos } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false })
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title')
    .order('position')
  return <PromoView promos={promos ?? []} courses={courses ?? []} />
}
