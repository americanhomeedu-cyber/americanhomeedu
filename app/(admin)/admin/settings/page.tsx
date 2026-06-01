import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/admin/settings/settings-form'

export const metadata: Metadata = { title: 'Настройки — Админка' }

export default async function AdminSettingsPage() {
  const supabase = createClient()
  const { data } = await supabase.from('site_settings').select('key, value')
  const values: Record<string, unknown> = {}
  ;(data ?? []).forEach((s) => {
    values[s.key] = s.value
  })
  return <SettingsForm values={values} />
}
