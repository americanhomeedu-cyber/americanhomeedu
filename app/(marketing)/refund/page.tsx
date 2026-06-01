import type { Metadata } from 'next'
import { LegalPage } from '@/components/marketing/legal-page'

export const metadata: Metadata = { title: 'Политика возврата — American Home Blueprint' }

export default function RefundPage() {
  return (
    <LegalPage title="Политика возврата">
      {/* TODO(client): уточнить условия возврата. */}
      Мы предоставляем 30-дневную гарантию возврата средств. Если курс вам не
      подошёл, напишите нам в течение 30 дней с момента покупки — и мы вернём
      оплату. Полные условия раздела готовятся.
    </LegalPage>
  )
}
