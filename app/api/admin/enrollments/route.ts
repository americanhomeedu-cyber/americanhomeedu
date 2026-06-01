import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createServiceClient } from '@/lib/supabase/service'
import { sendManualAccessEmail } from '@/lib/resend/send'
import { siteUrl } from '@/lib/utils'

const Schema = z.object({
  userId: z.string().uuid(),
  courseId: z.string().uuid(),
  action: z.enum(['grant', 'revoke']),
})

export async function POST(req: Request) {
  const { user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })

  let body: z.infer<typeof Schema>
  try {
    body = Schema.parse(await req.json())
  } catch {
    return Response.json({ error: 'Некорректные данные' }, { status: 400 })
  }

  const service = createServiceClient()

  if (body.action === 'revoke') {
    const { error } = await service
      .from('course_enrollments')
      .update({ revoked_at: new Date().toISOString(), revoke_reason: 'admin' })
      .eq('user_id', body.userId)
      .eq('course_id', body.courseId)
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ ok: true })
  }

  // grant (re-grant if previously revoked)
  const { error } = await service.from('course_enrollments').upsert(
    {
      user_id: body.userId,
      course_id: body.courseId,
      source: 'manual',
      granted_by: user.id,
      revoked_at: null,
      revoke_reason: null,
    },
    { onConflict: 'user_id,course_id' },
  )
  if (error) return Response.json({ error: error.message }, { status: 400 })

  // Notify the student (best-effort).
  const { data: profile } = await service
    .from('profiles')
    .select('email, full_name')
    .eq('id', body.userId)
    .single()
  const { data: course } = await service
    .from('courses')
    .select('title')
    .eq('id', body.courseId)
    .single()
  if (profile?.email) {
    try {
      await sendManualAccessEmail({
        to: profile.email,
        name: profile.full_name || 'друг',
        courseTitle: course?.title || 'курс',
        dashboardUrl: `${siteUrl()}/dashboard`,
      })
    } catch (e) {
      console.error('[enrollments] email failed:', e)
    }
  }
  return Response.json({ ok: true })
}
