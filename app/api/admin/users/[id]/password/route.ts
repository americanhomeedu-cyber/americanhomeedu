import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createServiceClient } from '@/lib/supabase/service'

const Schema = z.object({ password: z.string().min(6, 'Минимум 6 символов') })

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })

  let body: z.infer<typeof Schema>
  try {
    body = Schema.parse(await req.json())
  } catch {
    return Response.json({ error: 'Минимум 6 символов' }, { status: 400 })
  }

  const service = createServiceClient()
  const { error } = await service.auth.admin.updateUserById(params.id, {
    password: body.password,
  })
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ ok: true })
}
