import { requireAdmin } from '@/lib/auth/require-admin'
import { updateCourseSchema } from '@/lib/validations/course'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { supabase, user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })

  let body
  try {
    body = updateCourseSchema.parse(await req.json())
  } catch {
    return Response.json({ error: 'Некорректные данные' }, { status: 400 })
  }

  // Only one course may be featured — clear the others first.
  if (body.is_featured === true) {
    await supabase
      .from('courses')
      .update({ is_featured: false })
      .eq('is_featured', true)
      .neq('id', params.id)
  }

  const { error } = await supabase.from('courses').update(body).eq('id', params.id)
  if (error) {
    const msg = error.message.includes('duplicate')
      ? 'Курс с таким slug уже существует'
      : error.message
    return Response.json({ error: msg }, { status: 400 })
  }
  return Response.json({ ok: true })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { supabase, user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })

  const { error } = await supabase.from('courses').delete().eq('id', params.id)
  if (error) {
    return Response.json(
      { error: 'Нельзя удалить курс с заказами. Сначала архивируйте его.' },
      { status: 400 },
    )
  }
  return Response.json({ ok: true })
}
