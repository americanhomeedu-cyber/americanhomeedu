import type { Metadata } from 'next'
import { LegalPage, LegalHtml } from '@/components/marketing/legal-page'
import { getSiteSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Политика возврата — American Home Blueprint',
}
export const revalidate = 3600

export default async function RefundPage() {
  const s = await getSiteSettings()
  const email = s.contact_email || 'hello@americanhomeedu.com'

  if (s.legal_refund?.trim()) {
    return (
      <LegalPage title="Политика возврата">
        <LegalHtml html={s.legal_refund} />
      </LegalPage>
    )
  }

  return (
    <LegalPage title="Политика возврата">
      <p className="lead">
        Мы уверены в ценности курса и предоставляем <strong>30-дневную гарантию
        возврата средств</strong>. Если курс вам не подошёл — мы вернём оплату.
      </p>

      <h2>1. Срок</h2>
      <p>
        Запросить возврат можно в течение <strong>30 дней</strong> с даты покупки.
        После истечения этого срока возврат, как правило, не предоставляется.
      </p>

      <h2>2. Как запросить возврат</h2>
      <p>
        Напишите нам на <a href={`mailto:${email}`}>{email}</a> с адреса электронной
        почты, указанного при покупке. Укажите, что хотите оформить возврат — мы
        обработаем запрос. Объяснять причину необязательно, но ваш отзыв поможет нам
        стать лучше.
      </p>

      <h2>3. Сроки и способ возврата</h2>
      <p>
        Возврат осуществляется тем же способом, которым была произведена оплата,
        через платёжную систему Stripe. Зачисление средств обычно занимает{' '}
        <strong>5–10 рабочих дней</strong> в зависимости от вашего банка.
      </p>

      <h2>4. После возврата</h2>
      <p>
        После оформления возврата доступ к курсу прекращается. Дальнейшее
        использование материалов курса не допускается.
      </p>

      <h2>5. Контакты</h2>
      <p>
        Вопросы по возвратам: <a href={`mailto:${email}`}>{email}</a>.
      </p>
    </LegalPage>
  )
}
