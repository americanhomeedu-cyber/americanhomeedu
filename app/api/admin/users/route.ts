import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createServiceClient } from '@/lib/supabase/service'
import { sendManualAccessEmail } from '@/lib/resend/send'
import { siteUrl } from '@/lib/utils'

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Минимум 6 символов'),
  fullName: z.string().trim().min(1),
  phone: z.string().optional(),
  role: z.enum(['student', 'admin']).default('student'),
  notes: z.string().optional(),
  grantCourseId: z.string().uuid().optional(),
  sendWelcome: z.boolean().optional(),
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
  // Create the auth user (already confirmed — admin is vouching for them).
  const { data: created, error: createErr } = await service.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: { full_name: body.fullName, phone: body.phone ?? null },
  })
  if (createErr || !created.user) {
    return Response.json(
      { error: createErr?.message || 'Не удалось создать пользователя' },
      { status: 400 },
    )
  }
  const uid = created.user.id

  // Trigger creates the profile; patch the extra fields.
  await service
    .from('profiles')
    .update({ full_name: body.fullName, phone: body.phone ?? null, role: body.role, notes: body.notes ?? null })
    .eq('id', uid)

  // Optional immediate enrollment + notification.
  if (body.grantCourseId) {
    await service.from('course_enrollments').upsert(
      {
        user_id: uid,
        course_id: body.grantCourseId,
        source: 'manual',
        granted_by: user.id,
        revoked_at: null,
      },
      { onConflict: 'user_id,course_id' },
    )
    if (body.sendWelcome) {
      const { data: course } = await service
        .from('courses')
        .select('title')
        .eq('id', body.grantCourseId)
        .single()
      try {
        await sendManualAccessEmail({
          to: body.email,
          name: body.fullName,
          courseTitle: course?.title || 'курс',
          dashboardUrl: `${siteUrl()}/dashboard`,
        })
      } catch (e) {
        console.error('[users] welcome email failed:', e)
      }
    }
  }

  return Response.json({ ok: true, id: uid })
}
