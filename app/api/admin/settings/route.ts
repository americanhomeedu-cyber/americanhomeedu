import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'

const Schema = z.object({
  key: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean()]),
})

export async function PATCH(req: Request) {
  const { supabase, user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })
  let b
  try {
    b = Schema.parse(await req.json())
  } catch {
    return Response.json({ error: 'Некорректные данные' }, { status: 400 })
  }
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key: b.key, value: b.value }, { onConflict: 'key' })
  if (error) return Response.json({ error: error.message }, { status: 400 })
  // Settings feed the landing (hero/footer/SEO) and the legal pages — refresh them.
  revalidatePath('/', 'layout')
  return Response.json({ ok: true })
}
