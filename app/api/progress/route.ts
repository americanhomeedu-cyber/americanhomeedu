import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const Schema = z.object({
  sectionId: z.string().uuid(),
  completed: z.boolean(),
})

export async function POST(req: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  let body: z.infer<typeof Schema>
  try {
    body = Schema.parse(await req.json())
  } catch {
    return Response.json({ error: 'Некорректный запрос' }, { status: 400 })
  }

  const { error } = await supabase.from('course_progress').upsert(
    {
      user_id: user.id,
      section_id: body.sectionId,
      completed: body.completed,
      completed_at: body.completed ? new Date().toISOString() : null,
    },
    { onConflict: 'user_id,section_id' },
  )
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
