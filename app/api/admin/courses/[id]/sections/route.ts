import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/require-admin'

const create = z.object({
  title: z.string().default('Новый раздел'),
  position: z.number().int().default(0),
})

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { supabase, user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })
  let b
  try {
    b = create.parse(await req.json())
  } catch {
    b = { title: 'Новый раздел', position: 0 }
  }
  const { data, error } = await supabase
    .from('course_sections')
    .insert({ course_id: params.id, title: b.title, position: b.position, blocks: [] })
    .select('*')
    .single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}
