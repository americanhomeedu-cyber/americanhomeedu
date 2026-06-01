import type { Metadata } from 'next'
import { LegalPage } from '@/components/marketing/legal-page'

export const metadata: Metadata = { title: 'Условия использования — American Home Blueprint' }

export default function TermsPage() {
  return (
    <LegalPage title="Условия использования">
      {/* TODO(client): заменить заглушку реальным текстом условий. */}
      Здесь будут размещены условия использования сервиса и курса: правила доступа,
      лицензия на материалы, ограничения ответственности и порядок разрешения
      споров. Раздел готовится.
    </LegalPage>
  )
}
