import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/require-admin'

const update = z.object({ is_active: z.boolean().optional() })

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { supabase, user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })
  let b
  try {
    b = update.parse(await req.json())
  } catch {
    return Response.json({ error: 'Некорректные данные' }, { status: 400 })
  }
  const { error } = await supabase.from('promo_codes').update(b).eq('id', params.id)
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ ok: true })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { supabase, user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })
  const { error } = await supabase.from('promo_codes').delete().eq('id', params.id)
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ ok: true })
}
