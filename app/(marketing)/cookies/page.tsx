import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, LegalHtml } from '@/components/marketing/legal-page'
import { getSiteSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Политика использования cookie — American Home Blueprint',
}
export const revalidate = 3600

export default async function CookiesPage() {
  const s = await getSiteSettings()
  const email = s.contact_email || 'hello@americanhomeedu.com'

  if (s.legal_cookies?.trim()) {
    return (
      <LegalPage title="Политика использования cookie">
        <LegalHtml html={s.legal_cookies} />
      </LegalPage>
    )
  }

  return (
    <LegalPage title="Политика использования cookie">
      <p className="lead">
        Эта страница объясняет, что такое файлы cookie, какие из них использует наш
        сайт и как вы можете управлять ими.
      </p>

      <h2>1. Что такое cookie</h2>
      <p>
        Cookie — это небольшие текстовые файлы, которые сайт сохраняет в вашем
        браузере. Они помогают сайту работать корректно, запоминать вход и собирать
        обезличенную статистику.
      </p>

      <h2>2. Какие cookie мы используем</h2>
      <ul>
        <li>
          <strong>Необходимые.</strong> Обеспечивают вход в аккаунт, безопасность и
          базовую работу сайта. Без них сервис не функционирует, поэтому они не
          требуют согласия.
        </li>
        <li>
          <strong>Аналитические.</strong> Google Analytics — помогают понять, как
          посетители используют сайт (обезличенно), чтобы мы могли его улучшать.
        </li>
        <li>
          <strong>Маркетинговые.</strong> Meta Pixel — оценка эффективности рекламы.
          Подключаются только при наличии вашего согласия.
        </li>
      </ul>

      <h2>3. Управление cookie</h2>
      <p>
        Вы можете в любой момент удалить или заблокировать cookie в настройках своего
        браузера. Обратите внимание: отключение необходимых cookie может нарушить
        работу личного кабинета и доступа к курсу.
      </p>

      <h2>4. Согласие</h2>
      <p>
        При первом посещении мы показываем уведомление об использовании cookie.
        Нажимая «Принять», вы соглашаетесь с использованием аналитических и
        маркетинговых cookie в соответствии с этой политикой и нашей{' '}
        <Link href="/privacy">Политикой конфиденциальности</Link>.
      </p>

      <h2>5. Контакты</h2>
      <p>
        Вопросы об использовании cookie: <a href={`mailto:${email}`}>{email}</a>.
      </p>
    </LegalPage>
  )
}
