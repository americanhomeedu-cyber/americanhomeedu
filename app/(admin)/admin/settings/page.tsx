import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/admin/settings/settings-form'

export const metadata: Metadata = { title: 'Настройки — Админка' }

export default async function AdminSettingsPage() {
  const supabase = createClient()
  const { data } = await supabase.from('site_settings').select('key, value')
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, is_featured, slug')
    .order('position')

  const values: Record<string, unknown> = {}
  ;(data ?? []).forEach((s) => {
    values[s.key] = s.value
  })

  const env = {
    gaId: process.env.NEXT_PUBLIC_GA_ID || '',
    pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || '',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '',
  }

  return <SettingsForm values={values} courses={courses ?? []} env={env} />
}
