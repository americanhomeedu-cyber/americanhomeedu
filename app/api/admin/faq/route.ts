import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'

const create = z.object({
  course_id: z.string().uuid().nullable().optional(),
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
  position: z.number().int().default(0),
  is_published: z.boolean().default(true),
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
  const { data, error } = await supabase
    .from('faq_items')
    .insert({
      course_id: b.course_id ?? null,
      question: b.question,
      answer: b.answer,
      position: b.position,
      is_published: b.is_published,
    })
    .select('id')
    .single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  revalidatePath('/', 'layout')
  return Response.json({ id: data.id })
}
