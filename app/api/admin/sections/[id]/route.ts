import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/require-admin'
import type { Json, TablesUpdate } from '@/types/database'

const update = z.object({
  title: z.string().optional(),
  description: z.string().nullable().optional(),
  blocks: z.array(z.any()).optional(),
  is_published: z.boolean().optional(),
  position: z.number().int().optional(),
  estimated_minutes: z.number().int().nullable().optional(),
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
  const patch: TablesUpdate<'course_sections'> = {}
  if (b.title !== undefined) patch.title = b.title
  if (b.description !== undefined) patch.description = b.description
  if (b.blocks !== undefined) patch.blocks = b.blocks as unknown as Json
  if (b.is_published !== undefined) patch.is_published = b.is_published
  if (b.position !== undefined) patch.position = b.position
  if (b.estimated_minutes !== undefined) patch.estimated_minutes = b.estimated_minutes
  const { error } = await supabase.from('course_sections').update(patch).eq('id', params.id)
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ ok: true })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { supabase, user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })
  const { error } = await supabase.from('course_sections').delete().eq('id', params.id)
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ ok: true })
}
