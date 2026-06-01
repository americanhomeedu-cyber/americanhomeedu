import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getResend } from '@/lib/resend/client'
import { getSiteSettings } from '@/lib/settings'

const Schema = z.object({ to: z.string().email().optional() })

export async function POST(req: Request) {
  const { user } = await requireAdmin()
  if (!user) return new Response('Forbidden', { status: 403 })

  let to = user.email
  try {
    const b = Schema.parse(await req.json())
    if (b.to) to = b.to
  } catch {
    /* ignore — fall back to the admin's own email */
  }
  if (!to) return Response.json({ error: 'Не указан адрес получателя' }, { status: 400 })

  const settings = await getSiteSettings()
  try {
    await getResend().emails.send({
      from: settings.email_from || process.env.RESEND_FROM_EMAIL || 'hello@americanhomeedu.com',
      to,
      subject: 'Тестовое письмо — American Home Blueprint',
      html: `<div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:28px;color:#1a1a1a">
        <h2 style="font-family:Georgia,serif;color:#2D4A3E">Тест прошёл успешно ✅</h2>
        <p style="color:#4b5563;line-height:1.6">Если вы видите это письмо — отправка почты через Resend настроена корректно.</p>
      </div>`,
    })
    return Response.json({ ok: true, to })
  } catch (e) {
    return Response.json({ error: (e as Error).message || 'Ошибка отправки' }, { status: 400 })
  }
}
