import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/require-admin'

const create = z.object({
  code: z.string().trim().min(1),
  applies_to: z.enum(['specific', 'all']).default('specific'),
  course_id: z.string().uuid().nullable().optional(),
  discount_type: z.enum(['percent', 'fixed']),
  discount_value: z.number().int().positive(),
  max_uses: z.number().int().positive().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
})

export async function POST(req: Request) {
  const { supabase, user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })
  let b
  try {
    b = create.parse(await req.json())
  } catch {
    return Response.json({ error: 'Некорректные данные' }, { status: 400 })
  }
  const { error } = await supabase.from('promo_codes').insert({
    code: b.code.toUpperCase(),
    applies_to: b.applies_to,
    course_id: b.applies_to === 'all' ? null : (b.course_id ?? null),
    discount_type: b.discount_type,
    discount_value: b.discount_value,
    max_uses: b.max_uses ?? null,
    expires_at: b.expires_at || null,
    is_active: b.is_active,
  })
  if (error) {
    return Response.json(
      { error: error.message.includes('duplicate') ? 'Такой код уже есть' : error.message },
      { status: 400 },
    )
  }
  return Response.json({ ok: true })
}
