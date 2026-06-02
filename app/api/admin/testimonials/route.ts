import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'

const create = z.object({
  course_id: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(1),
  city: z.string().optional(),
  rating: z.number().int().min(1).max(5).default(5),
  text: z.string().trim().min(1),
  tag: z.string().optional(),
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
    .from('testimonials')
    .insert({
      course_id: b.course_id ?? null,
      name: b.name,
      city: b.city || null,
      rating: b.rating,
      text: b.text,
      tag: b.tag || null,
      is_published: b.is_published,
    })
    .select('id')
    .single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  revalidatePath('/', 'layout')
  return Response.json({ id: data.id })
}
