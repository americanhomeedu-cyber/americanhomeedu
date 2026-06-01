import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createServiceClient } from '@/lib/supabase/service'
import type { TablesUpdate } from '@/types/database'

const Schema = z.object({
  full_name: z.string().trim().min(1).optional(),
  phone: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  role: z.enum(['student', 'admin']).optional(),
})

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })

  let body: z.infer<typeof Schema>
  try {
    body = Schema.parse(await req.json())
  } catch {
    return Response.json({ error: 'Некорректные данные' }, { status: 400 })
  }

  const patch: TablesUpdate<'profiles'> = {}
  if (body.full_name !== undefined) patch.full_name = body.full_name
  if (body.phone !== undefined) patch.phone = body.phone
  if (body.notes !== undefined) patch.notes = body.notes
  if (body.role !== undefined) patch.role = body.role

  const service = createServiceClient()
  const { error } = await service.from('profiles').update(patch).eq('id', params.id)
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })
  if (params.id === user.id) {
    return Response.json({ error: 'Нельзя удалить собственный аккаунт' }, { status: 400 })
  }

  const service = createServiceClient()
  // Deleting the auth user cascades to the profile (FK on delete cascade).
  const { error } = await service.auth.admin.deleteUser(params.id)
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ ok: true })
}
