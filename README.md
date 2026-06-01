# American Home Blueprint with Alla

Онлайн-школа с курсом «Как купить дом в Америке». Multi-course архитектура с
самого начала: на лендинге показывается один featured-курс, а БД и админка
поддерживают несколько курсов.

Полное техническое задание — в [`CLAUDE.md`](CLAUDE.md). Дизайн-токены —
в [`DESIGN_TOKENS.md`](DESIGN_TOKENS.md).

## Стек

Next.js 14.2 (App Router) · React 18.3 · TypeScript · Tailwind 3.4 ·
Supabase (PostgreSQL + Auth + Storage) · Stripe Checkout · Resend ·
React Query · React Hook Form + Zod · dnd-kit · TipTap · Recharts ·
framer-motion · lucide-react.

## Быстрый старт

```bash
pnpm install
cp .env.local.example .env.local   # заполнить ключи (Supabase / Stripe / Resend)
pnpm dev                            # http://localhost:3000
```

Скрипты: `pnpm dev` · `pnpm build` · `pnpm start` · `pnpm lint`.

## Структура

```
app/            # роуты (App Router); зоны: (marketing) (auth) (student) (admin)
components/ui/  # базовые компоненты в стиле дизайна
lib/            # утилиты, supabase-клиенты, валидации, константы
supabase/       # SQL-миграции (применяются к проекту Supabase)
emails/         # React Email шаблоны (транзакционные письма)
public/images/  # фото эксперта (Алла)
```

## База данных

Проект Supabase: `snmkzxdhbnkamyrmapvy`. Схема (courses, enrollments, orders,
RLS, триггеры, storage buckets) задаётся миграциями в `supabase/migrations/` и
применяется к проекту. Подробности — раздел 6 в `CLAUDE.md`.

## Деплой

Хостинг — Vercel. Переменные окружения настраиваются в Vercel Project Settings.
Stripe webhook и верификация домена Resend — на проде (этап 14).

## Дизайн

Три визуальные зоны (marketing / student / admin) на общем брендовом ядре
(cream · green · gold), Playfair Display + Manrope/Inter. См.
[`DESIGN_TOKENS.md`](DESIGN_TOKENS.md).
