import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/require-admin'

const Schema = z.object({ order: z.array(z.string().uuid()) })

export async function POST(req: Request) {
  const { supabase, user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })
  let b
  try {
    b = Schema.parse(await req.json())
  } catch {
    return Response.json({ error: 'Некорректные данные' }, { status: 400 })
  }
  await Promise.all(
    b.order.map((id, i) => supabase.from('courses').update({ position: i }).eq('id', id)),
  )
  return Response.json({ ok: true })
}
