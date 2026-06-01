import { createPublicClient } from '@/lib/supabase/public'

/**
 * Site-wide settings stored in the `site_settings` table (key -> jsonb value).
 * Defaults mirror the current hardcoded landing copy, so an empty DB renders
 * exactly the same site — admins can then override any value from /admin/settings.
 */
export const SETTINGS_DEFAULTS: Record<string, string> = {
  site_title: 'American Home Blueprint',
  slogan: 'Как купить дом в Америке — пошаговая система',
  contact_email: 'hello@americanhomeedu.com',
  support_email: 'support@americanhomeedu.com',
  social_instagram: 'https://instagram.com/move.us.with.alla',
  social_youtube: 'https://youtube.com/@AllaRizayev',
  social_facebook: 'https://www.facebook.com/alla.rizayev',
  social_telegram: '',
  hero_badge_text: '🏡 Курс для русскоязычных в США',
  hero_title: '',
  hero_subtitle:
    'Пошаговая система от лицензированного риелтора с 14-летним опытом. На понятном русском языке.',
  hero_cta: '',
  about_name: 'Алла Ризаева',
  about_role: 'Licensed Real Estate Agent · North & South Carolina',
  about_bio: '',
  seo_title_template: '%s — American Home Blueprint',
  seo_description:
    'Пошаговый курс по покупке дома в США для русскоязычных иммигрантов.',
  timezone: 'America/New_York',
  language: 'ru',
}

export type SiteSettings = Record<string, string>

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createPublicClient()
  const { data } = await supabase.from('site_settings').select('key, value')
  const map: SiteSettings = { ...SETTINGS_DEFAULTS }
  ;(data ?? []).forEach((s) => {
    const v = s.value as unknown
    map[s.key] = typeof v === 'string' ? v : v == null ? '' : String(v)
  })
  return map
}
