import { requireAdmin } from '@/lib/auth/require-admin'
import { createCourseSchema } from '@/lib/validations/course'

export async function POST(req: Request) {
  const { supabase, user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })

  let body
  try {
    body = createCourseSchema.parse(await req.json())
  } catch {
    return Response.json({ error: 'Некорректные данные' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('courses')
    .insert({
      title: body.title,
      slug: body.slug,
      description: body.description || null,
      price_cents: body.price_cents,
      is_published: body.is_published,
    })
    .select('id')
    .single()

  if (error) {
    const msg = error.message.includes('duplicate')
      ? 'Курс с таким slug уже существует'
      : error.message
    return Response.json({ error: msg }, { status: 400 })
  }
  return Response.json({ id: data.id })
}
