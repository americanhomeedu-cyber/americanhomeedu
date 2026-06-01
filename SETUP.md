# Запуск, настройка, тесты и деплой

Весь код проекта написан. Ниже — всё, что нужно сделать **вручную** (ключи,
настройки дашбордов, тесты, деплой). Код собирается без этого (`pnpm build`
проходит); внешние сервисы подключаются ключами в свой момент.

- **БД (Supabase):** `snmkzxdhbnkamyrmapvy` — схема уже применена (7 миграций).
- **Код (GitHub):** `americanhomeedu-cyber/americanhomeedu` — ветка `main`.

---

## 1. Локальный запуск

```bash
pnpm install
# .env.local уже создан с Supabase URL + anon-ключом
pnpm dev          # http://localhost:3000
```

Заполнить в `.env.local` по мере необходимости:

```
SUPABASE_SERVICE_ROLE_KEY=     # Supabase → Settings → API → service_role (СЕКРЕТ)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=hello@<домен>      # домен верифицирован в Resend
ADMIN_EMAIL=alla@<домен>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GA_ID=G-XXXX             # опционально
NEXT_PUBLIC_META_PIXEL_ID=          # опционально
```

> `SUPABASE_SERVICE_ROLE_KEY` нужен для: выдачи доступа после оплаты (Stripe
> fulfill), ручной выдачи доступа админом. Без него эти операции не сработают.

## 2. Создать первого администратора

Зарегистрируйтесь на сайте (`/register`), затем в Supabase SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'ваш-email';
```

После этого `/admin` станет доступен.

## 3. Supabase Auth (дашборд)

- **Authentication → Providers → Email**: `Confirm email = ON`.
- **Authentication → URL Configuration**: Site URL `http://localhost:3000`
  (+ прод-домен); Redirect URLs: `http://localhost:3000/auth/callback` (+ прод).
- **Authentication → Emails → Templates → «Confirm signup»**: тело письма с
  6-значным кодом `{{ .Token }}` (брендовый HTML есть в истории — отчёт этапа 3).
- **Authentication → Emails → SMTP**: подключить Resend (host `smtp.resend.com`,
  port 465, user `resend`, password = `RESEND_API_KEY`, sender с домена).

## 4. Stripe

- Test-ключи `sk_test_` / `pk_test_`.
- Локально: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
  → `whsec_...` в `STRIPE_WEBHOOK_SECRET`.
- Прод: webhook-эндпоинт `https://<домен>/api/stripe/webhook`, событие
  `checkout.session.completed`.
- Карта для тестов: `4242 4242 4242 4242`.

## 5. Resend

- Аккаунт, верификация домена (DNS), `RESEND_API_KEY`.

## 6. Что протестировать

- [ ] Регистрация → письмо с кодом → ввод кода → кабинет (`/dashboard`).
- [ ] Вход; восстановление пароля (ссылка → `/auth/callback` → новый пароль).
- [ ] Покупка тест-картой из блока в кабинете → доступ выдаётся через **webhook
      И** через success-страницу; повтор той же сессии **не** даёт дубль заказа.
- [ ] Письмо о покупке клиенту + уведомление о продаже админу.
- [ ] Кабинет: курс с прогрессом; `/course/[id]` требует enrollment; отметка
      разделов пройденными.
- [ ] Админка: Course Switcher, адаптивный сайдбар; CRUD курсов; редактор
      (секции/блоки DnD, автосейв, загрузка картинки); ученики (выдать/отозвать
      доступ); заказы (возврат); промокоды; отзывы/FAQ; настройки.
- [ ] Адаптив: 375 / 768 / 1024 / 1440.

## 7. Деплой на Vercel

1. Импортировать репозиторий в Vercel.
2. Env-переменные (все из п.1) в Project Settings → Environment Variables;
   `NEXT_PUBLIC_SITE_URL` = прод-домен.
3. Подключить домен.
4. Прод: Stripe webhook на прод-URL; Supabase URL Configuration с прод-доменом;
   Resend домен.
5. Проверить `securityheaders.com` и Lighthouse (цель 90+).

## 8. Известные TODO / отложенный polish

- Строгий CSP (сейчас базовые security-заголовки) — этап тонкой настройки.
- Редактор: панель превью (mobile/tablet/desktop), доп. шорткаты, правая колонка
  настроек блока — отложенный polish (ядро редактирования работает).
- Приватная отдача файлов курса через signed URLs (сейчас загрузка в публичный
  `course-images`).
- Реальные цифры/отзывы на лендинге (сейчас placeholder из дизайна).
- Stripe Coupons sync для промокодов (сейчас промокоды в БД + Stripe
  `allow_promotion_codes` в checkout).
- Security advisor: `is_admin()` как RPC и листинг публичных бакетов — низкий
  риск, можно ужесточить (private-схема для хелперов).
