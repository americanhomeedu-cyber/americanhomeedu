import type { Metadata } from 'next'
import { LegalPage } from '@/components/marketing/legal-page'

export const metadata: Metadata = { title: 'Политика конфиденциальности — American Home Blueprint' }

export default function PrivacyPage() {
  return (
    <LegalPage title="Политика конфиденциальности">
      {/* TODO(client): заменить заглушку реальным текстом политики. */}
      Здесь будет размещён полный текст политики конфиденциальности: какие данные
      мы собираем, как используем и защищаем их, права пользователя и контакты для
      обращений. Раздел готовится.
    </LegalPage>
  )
}
