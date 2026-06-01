import { render } from '@react-email/render'
import { getResend } from './client'
import { getSiteSettings } from '@/lib/settings'
import { PurchaseConfirmation } from '@/emails/purchase-confirmation'
import { AdminNewSale } from '@/emails/admin-new-sale'
import { ManualAccessGranted } from '@/emails/manual-access-granted'

async function fromAddress() {
  const s = await getSiteSettings()
  return s.email_from || process.env.RESEND_FROM_EMAIL || 'hello@americanhomeedu.com'
}

export async function sendPurchaseConfirmationEmail(opts: {
  to: string
  name: string
  courseTitle: string
  dashboardUrl: string
}) {
  const html = await render(PurchaseConfirmation(opts))
  await getResend().emails.send({
    from: await fromAddress(),
    to: opts.to,
    subject: `Доступ к курсу «${opts.courseTitle}» открыт`,
    html,
  })
}

export async function sendAdminNewSaleEmail(opts: {
  customerName?: string | null
  customerEmail: string
  courseTitle: string
  amount: string
}) {
  const s = await getSiteSettings()
  // Respect the «Уведомлять о покупках» toggle from Settings → Email.
  if (s.notify_purchase === 'false') return
  const to = s.admin_notify_email || process.env.ADMIN_EMAIL
  if (!to) return
  const html = await render(AdminNewSale(opts))
  await getResend().emails.send({
    from: await fromAddress(),
    to,
    subject: `💰 Новая покупка: ${opts.courseTitle}`,
    html,
  })
}

export async function sendManualAccessEmail(opts: {
  to: string
  name: string
  courseTitle: string
  dashboardUrl: string
}) {
  const html = await render(ManualAccessGranted(opts))
  await getResend().emails.send({
    from: await fromAddress(),
    to: opts.to,
    subject: `Вам открыт доступ к курсу «${opts.courseTitle}»`,
    html,
  })
}
