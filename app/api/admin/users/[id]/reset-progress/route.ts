import { requireAdmin } from '@/lib/auth/require-admin'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })

  const service = createServiceClient()
  const { error } = await service
    .from('course_progress')
    .delete()
    .eq('user_id', params.id)
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ ok: true })
}
