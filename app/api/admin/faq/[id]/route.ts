import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'

const update = z.object({
  question: z.string().optional(),
  answer: z.string().optional(),
  position: z.number().int().optional(),
  is_published: z.boolean().optional(),
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
  const { error } = await supabase.from('faq_items').update(b).eq('id', params.id)
  if (error) return Response.json({ error: error.message }, { status: 400 })
  revalidatePath('/', 'layout')
  return Response.json({ ok: true })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { supabase, user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })
  const { error } = await supabase.from('faq_items').delete().eq('id', params.id)
  if (error) return Response.json({ error: error.message }, { status: 400 })
  revalidatePath('/', 'layout')
  return Response.json({ ok: true })
}
