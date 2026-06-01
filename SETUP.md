# Ручная настройка и тесты

Этот файл — единый чек-лист того, что нужно сделать **вручную** (ключи, настройки
дашбордов, проверки). Код всех этапов пишется без этого; настройка и тесты —
когда сайт будет готов целиком. Пополняется по мере этапов.

---

## 1. Переменные окружения (`.env.local`)

Уже заполнено: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Заполнить:

```
SUPABASE_SERVICE_ROLE_KEY=   # Supabase → Settings → API → service_role (секрет!)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...     # из `stripe listen` (локально) или из webhook-эндпоинта (прод)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=hello@<ваш-домен>     # домен должен быть верифицирован в Resend
ADMIN_EMAIL=alla@<ваш-домен>            # куда слать уведомления о покупках
```

## 2. Supabase Auth (дашборд проекта `snmkzxdhbnkamyrmapvy`)

- **Authentication → Sign In / Providers → Email**: `Confirm email = ON`.
- **Authentication → URL Configuration**: Site URL `http://localhost:3000` (+ прод-домен);
  Redirect URLs добавить `http://localhost:3000/auth/callback` (+ прод).
- **Authentication → Emails → Templates → «Confirm signup»**: тело письма на код
  `{{ .Token }}` (брендовый HTML — см. отчёт по этапу 3 в истории).
- **Authentication → Emails → SMTP**: подключить Resend (host `smtp.resend.com`,
  port 465, user `resend`, password = `RESEND_API_KEY`, sender с верифицированного домена).

## 3. Stripe

- Создать аккаунт Stripe, взять test-ключи (`sk_test_`, `pk_test_`).
- **Локальный webhook:** `stripe listen --forward-to localhost:3000/api/stripe/webhook`
  → скопировать `whsec_...` в `STRIPE_WEBHOOK_SECRET`.
- **Прод webhook:** добавить эндпоинт `https://<домен>/api/stripe/webhook`, событие
  `checkout.session.completed`, скопировать signing secret.
- Тест-карта: `4242 4242 4242 4242`, любая будущая дата/CVC.

## 4. Resend

- Создать аккаунт, верифицировать домен (DNS-записи), взять `RESEND_API_KEY`.

## 5. Что протестировать (когда ключи на месте)

- [ ] Регистрация → приходит письмо с 6-значным кодом → ввод кода → кабинет.
- [ ] Вход / восстановление пароля.
- [ ] Покупка тест-картой → доступ выдаётся И через webhook, И через success-страницу.
- [ ] Повторная обработка той же сессии **не** создаёт дубль заказа (идемпотентность).
- [ ] После оплаты success-страница ждёт enrollment и ведёт в кабинет (не в «пустой»).
- [ ] Письмо о покупке (клиенту) + уведомление о продаже (админу) приходят.

## 6. Деплой (этап 14)

- Vercel: проект, env-переменные, домен.
- Прод: Stripe webhook на прод-URL, Resend домен, Supabase URL config с прод-доменом.
