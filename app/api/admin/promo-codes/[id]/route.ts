import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/require-admin'

const update = z.object({
  code: z.string().trim().min(1).optional(),
  applies_to: z.enum(['specific', 'all']).optional(),
  course_id: z.string().uuid().nullable().optional(),
  discount_type: z.enum(['percent', 'fixed']).optional(),
  discount_value: z.number().int().positive().optional(),
  max_uses: z.number().int().positive().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
})

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { supabase, user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })
  let b
  try {
    b = update.parse(await req.json())
  } catch {
    return Response.json({ error: 'Некорректные данные' }, { status: 400 })
  }
  const patch = { ...b }
  if (patch.code) patch.code = patch.code.toUpperCase()
  if (patch.applies_to === 'all') patch.course_id = null
  const { error } = await supabase.from('promo_codes').update(patch).eq('id', params.id)
  if (error) {
    return Response.json(
      { error: error.message.includes('duplicate') ? 'Такой код уже есть' : error.message },
      { status: 400 },
    )
  }
  return Response.json({ ok: true })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { supabase, user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })
  const { error } = await supabase.from('promo_codes').delete().eq('id', params.id)
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ ok: true })
}
