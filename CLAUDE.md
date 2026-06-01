# CLAUDE.md — American Home Blueprint with Alla
## Полное техническое задание для Claude Code

> **Файл-инструкция для Claude Code.** Положи его в корень проекта `D:\americanhomeedu\CLAUDE.md`. Claude Code будет автоматически читать его как контекст в каждой сессии.

---

## 🎨 0. ПЕРВЫЙ ШАГ — ЗАГРУЗИТЬ ДИЗАЙН (КРИТИЧЕСКИ ВАЖНО)

**Перед любой работой над кодом** выполни:

```
Fetch this design file, read its readme, and implement the relevant aspects of the design.
https://api.anthropic.com/v1/design/h/bluIoEQ531zqVklwfCx-cQ?open_file=admin%2Findex.html
Implement: admin/index.html
```

Этот дизайн-файл содержит **эталонный стиль для всего проекта**: и для главной страницы (лендинга), и для админки (клиентской и администраторской части). Изучи его внимательно и повторяй 1:1.

**Что важно извлечь из дизайна:**
- Цветовая палитра (точные HEX/HSL значения)
- Типографика (шрифты, размеры, веса, line-height)
- Spacing (отступы, padding/margin patterns)
- Радиусы скругления
- Тени и эффекты
- UI-паттерны: кнопки, инпуты, карточки, таблицы, навигация
- Состояния (hover, active, disabled, focus)
- Адаптивность (брейкпоинты)
- Анимации и переходы

**Правило приоритета:** если что-то в этом ТЗ конфликтует с дизайн-файлом — **дизайн-файл имеет приоритет**. Этот документ описывает архитектуру и функциональность; дизайн-файл описывает внешний вид.

После загрузки дизайна:
1. Извлеки токены дизайна в `tailwind.config.ts` и `app/globals.css`
2. Создай документ `DESIGN_TOKENS.md` с описанием всех извлечённых токенов
3. Создай базовые компоненты в `components/ui/` в стиле дизайна
4. Все последующие компоненты строй из этих базовых

---

## 📌 1. КАК ЧИТАТЬ ЭТОТ ДОКУМЕНТ

Документ читается строго сверху вниз. Каждый раздел дополняет предыдущий. Перед началом любого этапа — перечитай разделы 1–10.

**Правила работы:**
1. **Дизайн** берётся из Claude Design URL (раздел 0). При конфликте — приоритет у дизайна.
2. Не отступай от технологического стека из раздела 4 без явного разрешения.
3. Все тексты UI — на **русском языке**. Идентификаторы, переменные, комментарии — на английском.
4. **Multi-course архитектура** заложена с самого начала. На лендинге показывается один featured курс, но БД и админка поддерживают несколько курсов.
5. Если нет конкретики — используй placeholder с комментарием `// TODO(client): описание`.
6. После каждого этапа делай git commit (Conventional Commits: `feat(scope): описание`).
7. После каждого этапа выводи отчёт: что сделано, какие файлы, что нужно настроить вручную, и спрашивай разрешение на следующий этап.
8. Никогда не коммить `.env.local`, секреты, `node_modules`.
9. Все ключи и секреты — только через переменные окружения.

---

## 🎯 2. БИЗНЕС-КОНТЕКСТ

### 2.1 Проект
- **Название:** American Home Blueprint with Alla
- **Домен:** americanhomeblueprint.com (уточнить у клиента)
- **Тип:** онлайн-школа с курсами
- **Модель:** одноразовая покупка курса, lifetime access
- **Запуск:** один курс на главной странице. Архитектура заложена под несколько курсов.

### 2.2 Эксперт
- **Имя:** Alla Rizayev (Алла Ризаева)
- **Лицензия:** Licensed Real Estate Agent, North Carolina, Keller Williams Ballantyne
- **Опыт:** 14+ лет в недвижимости
- **Специализация:** покупка/продажа, relocation, new construction, инвестиции, Airbnb, работа с русскоязычными иммигрантами
- **География:** North & South Carolina
- **Соцсети:** Instagram @move.us.with.alla, YouTube @move.us.with.alla

### 2.3 Первый курс (Featured)
- **Название:** "Как купить дом в Америке"
- **Подзаголовок:** "Пошаговая система для иммигрантов"
- **Цена по умолчанию:** $397 (диапазон $297–497)
- **Формат:** видеоуроки + текстовые материалы + PDF + чек-листы
- **Доступ:** мгновенный после оплаты, навсегда
- **Темы:** подготовка финансов и credit score, mortgage и pre-approval, выбор района, offers и переговоры, inspections/appraisal, HOA/страховка/налоги, closing, инвестиционная стратегия

### 2.4 Аудитория
- Русскоговорящие иммигранты в США
- First-time home buyers
- Relocation buyers (особенно в North Carolina, Charlotte)
- Люди, которые рассматривают недвижимость как wealth strategy

### 2.5 Tone of voice
- Премиум, но дружелюбный (luxury approachable)
- Экспертный, без снобизма
- Уверенный, тёплый, конкретный
- НЕ инфобизный стиль — запрещены кричащие заголовки

---

## 🏗 3. КЛЮЧЕВОЕ АРХИТЕКТУРНОЕ РЕШЕНИЕ: MULTI-COURSE

С первой строчки кода проект строится как платформа для **нескольких курсов**, хотя на лендинге сейчас показывается только один.

### 3.1 Концепция
- В БД таблица `courses` — каждый курс это отдельная запись с собственной ценой, контентом, настройками
- Один курс помечается флагом `is_featured = true` — он показывается на главной
- В админке полноценная multi-course панель с **Course Switcher** в topbar
- При покупке создаётся `course_enrollment` — связь пользователя с курсом
- Один пользователь может иметь enrollments к нескольким курсам
- Лендинг отрисовывает только featured курс, без хардкода — всё из БД

### 3.2 Что это даёт
- Готовность к запуску новых продуктов без переделки админки
- A/B тесты курсов на разных лендингах в будущем
- Promo codes можно привязывать к конкретным курсам
- Корректное разделение аналитики и enrollments по курсам

### 3.3 Что НЕ делаем сейчас
- На лендинге ТОЛЬКО featured курс (никаких "выберите курс")
- Не строим вторичные лендинги под другие курсы (это на v2)
- Не делаем bundle-purchases (несколько курсов в одном заказе)

---

## 🛠 4. ТЕХНОЛОГИЧЕСКИЙ СТЕК

### 4.1 Core
| Технология | Версия | Назначение |
|------------|--------|------------|
| Node.js | 20.x LTS | Runtime |
| pnpm | 9.x | Package manager |
| Next.js | 14.2+ | Framework, App Router |
| React | 18.3+ | UI library |
| TypeScript | 5.4+ | Strict mode |

### 4.2 Стилизация и UI
- tailwindcss 3.4+ + @tailwindcss/typography + tailwindcss-animate
- shadcn-ui (CLI)
- lucide-react (иконки)
- framer-motion 11+ (анимации)
- sonner (toasts)

### 4.3 Формы и валидация
- react-hook-form + zod + @hookform/resolvers

### 4.4 Состояние
- @tanstack/react-query
- zustand (минимально)

### 4.5 Backend
- @supabase/ssr + @supabase/supabase-js
- stripe + @stripe/stripe-js
- resend + @react-email/components + @react-email/render

### 4.6 Редактор курса
- @dnd-kit/core + @dnd-kit/sortable + @dnd-kit/utilities
- @tiptap/react + @tiptap/starter-kit + @tiptap/extension-link + @tiptap/extension-image
- isomorphic-dompurify

### 4.7 Аналитика
- @vercel/analytics + @vercel/speed-insights

### 4.8 Утилиты
- date-fns
- clsx + tailwind-merge
- nanoid
- recharts

### 4.9 Dev tools
- eslint, prettier, prettier-plugin-tailwindcss
- supabase CLI

### 4.10 Инфраструктура
- **Хостинг:** Vercel
- **БД:** Supabase (PostgreSQL + Auth + Storage)
- **Видео:** YouTube / Vimeo (embed, НЕ в Storage)
- **Email:** Resend
- **Платежи:** Stripe Checkout
- **Git:** GitHub
- **Rate limiting:** Upstash Redis (опционально)

---

## 📁 5. СТРУКТУРА ПРОЕКТА

```
D:\americanhomeedu\
├── app/
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                        # Главная (featured course)
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   └── refund/page.tsx
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── verify-email/page.tsx
│   ├── (student)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx              # Список купленных курсов
│   │   ├── course/[courseId]/page.tsx      # Просмотр конкретного курса
│   │   └── profile/page.tsx
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── layout.tsx                  # Sidebar + topbar + course switcher
│   │   │   ├── page.tsx                    # Dashboard
│   │   │   ├── courses/                    # 🆕 Multi-course management
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── editor/page.tsx
│   │   │   │       └── settings/page.tsx
│   │   │   ├── users/
│   │   │   ├── orders/
│   │   │   ├── analytics/page.tsx
│   │   │   ├── promo-codes/page.tsx
│   │   │   ├── testimonials/page.tsx
│   │   │   ├── faq/page.tsx
│   │   │   └── settings/page.tsx
│   ├── api/
│   │   ├── stripe/
│   │   ├── admin/
│   │   │   ├── courses/                    # 🆕
│   │   │   ├── users/
│   │   │   ├── enrollments/                # 🆕
│   │   │   ├── analytics/
│   │   │   └── ...
│   │   ├── upload/route.ts
│   │   ├── progress/route.ts
│   │   └── track/route.ts
│   ├── checkout/
│   │   ├── success/page.tsx
│   │   └── cancel/page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   ├── sitemap.ts
│   ├── robots.ts
│   └── manifest.ts
├── components/
│   ├── ui/                                 # shadcn в стиле дизайн-файла
│   ├── marketing/
│   ├── auth/
│   ├── student/
│   ├── admin/
│   │   ├── course-switcher.tsx             # 🆕 Главный новый компонент
│   │   ├── course-card.tsx                 # 🆕
│   │   ├── course-selector.tsx             # 🆕
│   │   ├── admin-sidebar.tsx               # Адаптивный
│   │   ├── admin-topbar.tsx
│   │   └── ...
│   ├── course-editor/
│   ├── course-viewer/
│   └── shared/
├── lib/
│   ├── supabase/
│   ├── stripe/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── sync.ts                         # 🆕 Sync курсов в Stripe Products
│   │   └── helpers.ts
│   ├── resend/
│   ├── contexts/
│   │   └── course-context.tsx              # 🆕
│   ├── hooks/
│   │   └── use-current-course.ts           # 🆕
│   ├── analytics/
│   ├── validations/
│   │   ├── auth.ts
│   │   ├── course.ts                       # 🆕
│   │   ├── enrollment.ts                   # 🆕
│   │   └── ...
│   ├── auth/
│   ├── rate-limit.ts
│   ├── utils.ts
│   └── constants.ts
├── emails/                                 # React Email шаблоны
├── supabase/
│   ├── migrations/
│   │   ├── 0001_init_schema.sql            # С courses и enrollments
│   │   ├── 0002_rls_policies.sql
│   │   ├── 0003_functions_triggers.sql
│   │   └── 0004_seed_data.sql
│   ├── seed.sql
│   └── config.toml
├── types/
├── public/
├── middleware.ts
├── .env.local.example
├── DESIGN_TOKENS.md                        # 🆕 Извлечённые из дизайна
├── tailwind.config.ts
└── CLAUDE.md
```

---

## 🗄 6. БАЗА ДАННЫХ — СРАЗУ С MULTI-COURSE

### 6.1 Миграция 0001: схема таблиц

Файл `supabase/migrations/0001_init_schema.sql`:

```sql
create extension if not exists "uuid-ossp";

create type user_role as enum ('student', 'admin');
create type order_status as enum ('pending', 'completed', 'failed', 'refunded');
create type discount_type as enum ('percent', 'fixed');
create type enrollment_source as enum ('purchase', 'manual', 'promo', 'gift');
create type promo_applies_to as enum ('specific', 'all');

-- === 1. profiles ===
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  avatar_url text,
  role user_role not null default 'student',
  stripe_customer_id text unique,
  last_login_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_email on public.profiles(email);
create index idx_profiles_role on public.profiles(role);

-- === 2. courses (центральная таблица) ===
create table public.courses (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  subtitle text,
  description text,
  cover_image_url text,
  price_cents integer not null,
  old_price_cents integer,
  currency text not null default 'usd',
  stripe_product_id text,
  stripe_price_id text,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  position integer not null default 0,
  estimated_total_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_courses_slug on public.courses(slug);
create index idx_courses_published on public.courses(is_published);

-- Только один курс может быть featured
create unique index idx_courses_only_one_featured
  on public.courses(is_featured) where is_featured = true;

-- Первый featured курс
insert into public.courses (slug, title, subtitle, price_cents, is_published, is_featured)
values (
  'american-home-blueprint',
  'Как купить дом в Америке',
  'Пошаговая система для иммигрантов',
  39700,
  true,
  true
);

-- === 3. course_sections ===
create table public.course_sections (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses(id) on delete cascade,
  position integer not null,
  title text not null,
  slug text,
  description text,
  blocks jsonb not null default '[]'::jsonb,
  is_published boolean not null default true,
  estimated_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_sections_course on public.course_sections(course_id);
create index idx_sections_position on public.course_sections(course_id, position);

-- === 4. course_enrollments ===
create table public.course_enrollments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references public.profiles(id) on delete set null,
  source enrollment_source not null default 'purchase',
  order_id uuid,
  expires_at timestamptz,
  revoked_at timestamptz,
  revoke_reason text,
  unique(user_id, course_id)
);

create index idx_enrollments_user on public.course_enrollments(user_id);
create index idx_enrollments_course on public.course_enrollments(course_id);
create index idx_enrollments_active on public.course_enrollments(user_id, course_id)
  where revoked_at is null;

-- === 5. orders ===
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  course_id uuid not null references public.courses(id) on delete restrict,
  stripe_session_id text unique not null,
  stripe_payment_intent_id text unique,
  amount_cents integer not null,
  currency text not null default 'usd',
  status order_status not null default 'pending',
  promo_code text,
  customer_email text not null,
  customer_name text,
  refunded_at timestamptz,
  refund_reason text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_orders_user on public.orders(user_id);
create index idx_orders_course on public.orders(course_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_created_at on public.orders(created_at desc);

alter table public.course_enrollments
  add constraint course_enrollments_order_id_fkey
  foreign key (order_id) references public.orders(id) on delete set null;

-- === 6. promo_codes ===
create table public.promo_codes (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  course_id uuid references public.courses(id) on delete cascade,
  applies_to promo_applies_to not null default 'specific',
  discount_type discount_type not null,
  discount_value integer not null check (discount_value > 0),
  max_uses integer,
  current_uses integer not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  stripe_coupon_id text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_promo_codes_code on public.promo_codes(code);
create index idx_promo_codes_active on public.promo_codes(is_active);
create index idx_promo_codes_course on public.promo_codes(course_id);

-- === 7. analytics_events ===
create table public.analytics_events (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null,
  user_id uuid references public.profiles(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  session_id text,
  page_url text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  user_agent text,
  country_code text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_analytics_event_type on public.analytics_events(event_type);
create index idx_analytics_created_at on public.analytics_events(created_at desc);
create index idx_analytics_user on public.analytics_events(user_id);
create index idx_analytics_course on public.analytics_events(course_id);

-- === 8. course_progress ===
create table public.course_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  section_id uuid not null references public.course_sections(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  time_spent_seconds integer not null default 0,
  last_position integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, section_id)
);

create index idx_progress_user on public.course_progress(user_id);
create index idx_progress_section on public.course_progress(section_id);

-- === 9. testimonials ===
create table public.testimonials (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade,
  name text not null,
  city text,
  rating integer not null check (rating between 1 and 5),
  text text not null,
  avatar_url text,
  tag text,
  is_published boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_testimonials_course on public.testimonials(course_id);
create index idx_testimonials_published on public.testimonials(is_published, position);

-- === 10. faq_items ===
create table public.faq_items (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade,
  question text not null,
  answer text not null,
  position integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_faq_course on public.faq_items(course_id);
create index idx_faq_published on public.faq_items(is_published, position);

-- === 11. site_settings ===
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (key, value, description) values
  ('site_title', '"American Home Blueprint"'::jsonb, ''),
  ('contact_email', '"hello@americanhomeblueprint.com"'::jsonb, ''),
  ('support_email', '"support@americanhomeblueprint.com"'::jsonb, ''),
  ('refund_days', '30'::jsonb, ''),
  ('default_currency', '"usd"'::jsonb, ''),
  ('hero_badge_text', '"🏡 Курс для русскоязычных в США"'::jsonb, ''),
  ('social_instagram', '"https://instagram.com/move.us.with.alla"'::jsonb, ''),
  ('social_youtube', '"https://youtube.com/@move.us.with.alla"'::jsonb, '');
```

### 6.2 Миграция 0002: RLS политики

Файл `supabase/migrations/0002_rls_policies.sql`:

```sql
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_sections enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.orders enable row level security;
alter table public.promo_codes enable row level security;
alter table public.analytics_events enable row level security;
alter table public.course_progress enable row level security;
alter table public.testimonials enable row level security;
alter table public.faq_items enable row level security;
alter table public.site_settings enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.user_active_course_ids(user_uuid uuid)
returns setof uuid
language sql
stable
security definer
as $$
  select course_id from public.course_enrollments
  where user_id = user_uuid
    and revoked_at is null
    and (expires_at is null or expires_at > now());
$$;

-- PROFILES
create policy "users_select_own_profile" on public.profiles
  for select using (auth.uid() = id);

create policy "users_update_own_profile" on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
  );

create policy "admin_all_profiles" on public.profiles
  for all using (public.is_admin());

-- COURSES
create policy "public_read_published_courses" on public.courses
  for select using (is_published = true);

create policy "admin_all_courses" on public.courses
  for all using (public.is_admin());

-- COURSE_SECTIONS
create policy "enrolled_students_read_sections" on public.course_sections
  for select using (
    is_published = true
    and exists (
      select 1 from public.course_enrollments
      where user_id = auth.uid()
        and course_id = course_sections.course_id
        and revoked_at is null
        and (expires_at is null or expires_at > now())
    )
  );

create policy "admin_all_sections" on public.course_sections
  for all using (public.is_admin());

-- COURSE_ENROLLMENTS
create policy "users_read_own_enrollments" on public.course_enrollments
  for select using (auth.uid() = user_id);

create policy "admin_all_enrollments" on public.course_enrollments
  for all using (public.is_admin());

-- ORDERS
create policy "users_select_own_orders" on public.orders
  for select using (auth.uid() = user_id);

create policy "admin_all_orders" on public.orders
  for all using (public.is_admin());

-- COURSE_PROGRESS
create policy "users_own_progress" on public.course_progress
  for all using (auth.uid() = user_id);

create policy "admin_read_progress" on public.course_progress
  for select using (public.is_admin());

-- TESTIMONIALS
create policy "public_read_testimonials" on public.testimonials
  for select using (is_published = true);

create policy "admin_all_testimonials" on public.testimonials
  for all using (public.is_admin());

-- FAQ
create policy "public_read_faq" on public.faq_items
  for select using (is_published = true);

create policy "admin_all_faq" on public.faq_items
  for all using (public.is_admin());

-- SITE_SETTINGS
create policy "public_read_settings" on public.site_settings
  for select using (true);

create policy "admin_write_settings" on public.site_settings
  for all using (public.is_admin());

-- PROMO_CODES
create policy "admin_all_promo_codes" on public.promo_codes
  for all using (public.is_admin());

-- ANALYTICS_EVENTS
create policy "admin_read_analytics" on public.analytics_events
  for select using (public.is_admin());
```

### 6.3 Миграция 0003: триггеры и функции

Файл `supabase/migrations/0003_functions_triggers.sql`:

```sql
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_courses_updated_at before update on public.courses
  for each row execute function public.set_updated_at();
create trigger trg_sections_updated_at before update on public.course_sections
  for each row execute function public.set_updated_at();
create trigger trg_orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
create trigger trg_promo_codes_updated_at before update on public.promo_codes
  for each row execute function public.set_updated_at();
create trigger trg_progress_updated_at before update on public.course_progress
  for each row execute function public.set_updated_at();
create trigger trg_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

-- Авто-создание профиля
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Прогресс по курсу
create or replace function public.get_user_course_progress_percent(
  user_uuid uuid,
  course_uuid uuid
)
returns integer
language sql
stable
as $$
  with total as (
    select count(*) as total from public.course_sections
    where course_id = course_uuid and is_published = true
  ),
  completed as (
    select count(*) as completed from public.course_progress cp
    join public.course_sections cs on cs.id = cp.section_id
    where cp.user_id = user_uuid
      and cs.course_id = course_uuid
      and cp.completed = true
  )
  select case
    when (select total from total) = 0 then 0
    else (((select completed from completed)::float / (select total from total)::float) * 100)::integer
  end;
$$;
```

### 6.4 Storage Buckets

```sql
insert into storage.buckets (id, name, public) values 
  ('course-covers', 'course-covers', true),
  ('course-images', 'course-images', true),
  ('course-files', 'course-files', false),
  ('avatars', 'avatars', true)
on conflict do nothing;

create policy "Public read course-covers" on storage.objects
  for select using (bucket_id = 'course-covers');
create policy "Admin write course-covers" on storage.objects
  for all using (bucket_id = 'course-covers' and public.is_admin());

create policy "Public read course-images" on storage.objects
  for select using (bucket_id = 'course-images');
create policy "Admin write course-images" on storage.objects
  for all using (bucket_id = 'course-images' and public.is_admin());

create policy "Admin write course-files" on storage.objects
  for all using (bucket_id = 'course-files' and public.is_admin());
create policy "Enrolled students read course-files" on storage.objects
  for select using (
    bucket_id = 'course-files'
    and exists (
      select 1 from public.course_enrollments
      where user_id = auth.uid()
        and revoked_at is null
        and (expires_at is null or expires_at > now())
    )
  );

create policy "Public read avatars" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "Users write own avatar" on storage.objects
  for all using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
```

---

## ✨ 7. ФУНКЦИОНАЛ ПО МОДУЛЯМ

### 7.1 Главная страница — только featured курс

**Ключевое:** показывается только курс с `is_featured = true`. Никаких списков курсов.

```tsx
// app/(marketing)/page.tsx
export const revalidate = 60

export default async function HomePage() {
  const supabase = createServerClient()
  
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('is_featured', true)
    .eq('is_published', true)
    .single()
  
  if (!course) notFound()
  
  const { data: sections } = await supabase
    .from('course_sections')
    .select('id, title, position, estimated_minutes')
    .eq('course_id', course.id)
    .eq('is_published', true)
    .order('position')
  
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_published', true)
    .or(`course_id.eq.${course.id},course_id.is.null`)
    .order('position')
  
  const { data: faqs } = await supabase
    .from('faq_items')
    .select('*')
    .eq('is_published', true)
    .or(`course_id.eq.${course.id},course_id.is.null`)
    .order('position')
  
  return (
    <>
      <Hero course={course} />
      <PainPoints />
      <BeforeAfter />
      <Curriculum sections={sections || []} />
      <AboutAlla />
      <Stats />
      <Testimonials items={testimonials || []} />
      <Comparison />
      <Pricing course={course} />
      <Faq items={faqs || []} />
      <FinalCta course={course} />
      <JsonLd data={getCourseJsonLd(course)} />
    </>
  )
}
```

Все секции получают `course` пропсом — берут оттуда цену, название, slug.

**Стиль секций — точно из дизайн-файла.** Все секции отрисовать 1:1 с дизайном.

### 7.2 Авторизация

**Решение по верификации (зафиксировано):** Email-подтверждение ВКЛЮЧЕНО (Supabase "Confirm email" = ON). Это намеренный выбор: аудитория трастовая, продукт дорогой ($397), и нельзя допустить ситуацию "оплатил, но не получил доступ из-за опечатки в почте". К моменту покупки email уже должен быть подтверждён.

**Способ подтверждения: 6-значный код** (НЕ ссылка). Человек вводит код прямо на странице — не уходит из вкладки, конверсия выше, но доступ к почте всё равно проверяется.
> Чтобы переключить на ссылку вместо кода: в шаблоне Supabase заменить `{{ .Token }}` на `{{ .ConfirmationURL }}` и обрабатывать редирект на `/verify-email`. Логика на странице меняется минимально.

**Кто отправляет auth-письма:** письма подтверждения email и сброса пароля отправляет САМ Supabase Auth (не наш код через Resend напрямую). Чтобы письма шли с нашего домена и хорошо доставлялись:
- Подключить **Resend как SMTP-провайдер в настройках Supabase Auth** (Project Settings → Auth → SMTP Settings).
- Шаблоны этих писем стилизовать в Supabase Dashboard (Auth → Email Templates), используя inline-HTML в стиле бренда.
- Для подтверждения кода — в шаблоне использовать `{{ .Token }}` (6-значный код).
> ВАЖНО: НЕ слать письмо подтверждения вручную через Resend при регистрации — это сделает Supabase. Наши React Email шаблоны (раздел 7.6) — только для НЕ-auth писем (покупка, уведомления админу).
> Альтернатива для пиксель-в-пиксель брендового письма — Supabase Auth Hook "Send Email" с React Email + Resend. Но на старте достаточно SMTP + стилизованный шаблон.

**Флоу регистрации:**
1. `/register` — форма (имя, email, пароль). Submit → `supabase.auth.signUp(...)`.
2. Supabase создаёт пользователя (`email_confirmed_at = null`) и отправляет письмо с 6-значным кодом.
3. Экран "Подтвердите почту" — поле для ввода 6-значного кода + кнопка "Отправить код повторно" (с таймером 60 сек) + подсказка "проверьте папку Спам".
4. Ввод кода → `supabase.auth.verifyOtp({ email, token, type: 'signup' })`.
5. При успехе — сессия активна, профиль создан (через trigger), редирект на `/dashboard`.
6. В кабинете человек видит блок покупки курса (см. 7.3, 7.4).

**Вход (`/login`):** `signInWithPassword`. Если email не подтверждён — Supabase вернёт ошибку; показать "Подтвердите email" + ссылку на повторную отправку кода. Rate limit: 5 попыток / 15 мин.

**Восстановление пароля:** `/forgot-password` → `resetPasswordForEmail` (письмо шлёт Supabase через Resend SMTP). `/reset-password` → ввод нового пароля → `updateUser({ password })`.

**Middleware** защищает `/dashboard`, `/course/[courseId]`, `/admin`. Доступ к `/course/[courseId]` дополнительно требует активный enrollment.

После подтверждения email профиль создаётся автоматически (trigger `handle_new_user`). Enrollments появляются ТОЛЬКО после покупки или ручного создания админом — регистрация сама по себе доступ к курсу НЕ даёт.

### 7.3 Покупка курса (Stripe)

**Архитектура флоу (зафиксировано): кабинет — единый центр покупки.**

Покупка ВСЕГДА инициируется из кабинета (`/dashboard`), а не авто-цепочкой после регистрации. Это надёжнее: меньше связанных авто-переходов = меньше мест для багов. Незавершённая оплата оставляет человека в осмысленном месте (кабинет с блоком покупки), откуда он может вернуться в любой момент.

**Маршрутизация кнопки "Купить" на лендинге:**
- Не залогинен → `/register` (после подтверждения email → `/dashboard`)
- Залогинен, активного enrollment нет → `/dashboard` (там блок покупки)
- Залогинен, enrollment уже есть → `/course/[courseId]` ("у вас уже есть доступ")

**Откуда реально вызывается checkout:** из блока покупки в кабинете (`/dashboard`). Одна кнопка, один код-путь. (Для залогиненного пользователя без курса допустимо с лендинга вести сразу на checkout как оптимизацию, но базовый и единый путь — через кабинет.)

**Полная цепочка:**
1. Лендинг "Купить" → (если надо) регистрация + подтверждение email → `/dashboard`
2. Кабинет: крупный блок "Получите доступ к курсу" + цена + кнопка "Купить"
3. Клик → POST `/api/stripe/checkout` → редирект на Stripe Checkout
4. Оплата на Stripe
5. `success_url` → `/checkout/success?session_id=...` — страница "Оплата прошла, готовим доступ"
6. Доступ выдаётся (см. "Двойная подстраховка" ниже) → кнопка/редирект в кабинет, уже с курсом
7. `cancel_url` → `/checkout/cancel` — "Покупка отменена, попробовать снова" + кнопка назад в кабинет

**Создание Checkout Session** (`app/api/stripe/checkout/route.ts`):
```typescript
const Schema = z.object({ courseId: z.string().uuid() })

export async function POST(req: Request) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { courseId } = Schema.parse(await req.json())

  const { data: course } = await supabase
    .from('courses').select('*')
    .eq('id', courseId).eq('is_published', true).single()
  if (!course) return Response.json({ error: 'Курс не найден' }, { status: 404 })

  // Защита: уже есть активный доступ?
  const { data: existing } = await supabase
    .from('course_enrollments').select('id')
    .eq('user_id', user.id).eq('course_id', courseId)
    .is('revoked_at', null).maybeSingle()
  if (existing) {
    return Response.json({ error: 'У вас уже есть доступ к этому курсу' }, { status: 400 })
  }

  // Stripe customer (создать или достать из profile.stripe_customer_id)
  // ...

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items: [{
      price_data: {
        currency: course.currency,
        product_data: { name: course.title, description: course.subtitle || undefined },
        unit_amount: course.price_cents,
      },
      quantity: 1,
    }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
    allow_promotion_codes: true,
    payment_method_types: ['card'],
    metadata: { user_id: user.id, course_id: course.id },
  })

  return Response.json({ url: session.url })
}
```

**⭐ ДВОЙНАЯ ПОДСТРАХОВКА НА ВЫДАЧУ ДОСТУПА (критично для надёжности).**

Доступ выдаётся через ДВА независимых механизма, оба идемпотентны — чтобы человек гарантированно получил курс, даже если webhook задержался или не пришёл, и при этом не было дублей.

Общая функция выдачи доступа (вызывается из обоих путей):
```typescript
// lib/stripe/fulfill.ts — ИДЕМПОТЕНТНАЯ обработка оплаченной сессии
async function fulfillCheckoutSession(sessionId: string) {
  const supabase = createServiceClient() // service role

  // 1. Идемпотентность: уже обработан этот session?
  const { data: existingOrder } = await supabase
    .from('orders').select('id').eq('stripe_session_id', sessionId).maybeSingle()
  if (existingOrder) return // уже выдано — выходим, дубля не будет

  // 2. Достаём сессию из Stripe и проверяем оплату
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  if (session.payment_status !== 'paid') return // не оплачено — ничего не делаем

  const userId = session.metadata?.user_id
  const courseId = session.metadata?.course_id
  if (!userId || !courseId) return

  const { data: course } = await supabase
    .from('courses').select('title').eq('id', courseId).single()

  // 3. Создаём order
  const { data: order } = await supabase.from('orders').insert({
    user_id: userId,
    course_id: courseId,
    stripe_session_id: session.id,
    stripe_payment_intent_id: session.payment_intent as string,
    amount_cents: session.amount_total!,
    currency: session.currency!,
    status: 'completed',
    customer_email: session.customer_details?.email ?? session.customer_email!,
    customer_name: session.customer_details?.name,
  }).select().single()

  // 4. Создаём enrollment (если ещё нет — unique(user_id, course_id) защищает)
  await supabase.from('course_enrollments').upsert({
    user_id: userId, course_id: courseId, source: 'purchase', order_id: order.id,
  }, { onConflict: 'user_id,course_id', ignoreDuplicates: true })

  // 5. Письма + аналитика
  await sendPurchaseConfirmationEmail({ to: order.customer_email, courseTitle: course.title, /* ... */ })
  await sendAdminNewSaleEmail({ /* ... */ })
  await supabase.from('analytics_events').insert({
    event_type: 'purchase', user_id: userId, course_id: courseId,
    metadata: { amount_cents: session.amount_total },
  })
}
```

Путь 1 — **Webhook** (`app/api/stripe/webhook/route.ts`, ОСНОВНОЙ):
- `runtime = 'nodejs'` (НЕ edge — нужен для verify signature)
- Проверка подписи: `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)`
- На событии `checkout.session.completed` → `await fulfillCheckoutSession(session.id)`
- Срабатывает даже если человек закрыл браузер сразу после оплаты

Путь 2 — **Страница `/checkout/success`** (ДОПОЛНИТЕЛЬНЫЙ, на случай задержки/сбоя webhook):
- Получает `session_id` из URL
- Вызывает серверный endpoint `POST /api/stripe/confirm` → внутри `await fulfillCheckoutSession(sessionId)` (та же идемпотентная функция)
- Показывает "Оплата прошла, готовим доступ..." и поллит статус enrollment (например, раз в 1.5 сек, до ~20 сек)
- Как только enrollment подтверждён → кнопка "Перейти к курсу" / авто-редирект в кабинет
- Если за 20 сек не подтвердилось — сообщение "Доступ скоро появится, мы уже обрабатываем оплату. Если не появился — напишите в поддержку" (но в норме fulfill отрабатывает мгновенно через confirm-endpoint)

**Почему это важно:** самый частый баг таких сайтов — человек оплатил, webhook задержался, его кинуло в кабинет с "у вас нет курсов". Двойная подстраховка + идемпотентность это исключают.

**Привязка платежа — по `user_id` из metadata,** НЕ по email. Это решает проблему, если email в Stripe отличается от email регистрации.

**Локально webhook тестируется через Stripe CLI:** `stripe listen --forward-to localhost:3000/api/stripe/webhook` (скопировать `whsec_...` в `.env.local`). Без этого webhook локально не прилетает — это не баг.

**Промокоды:** `allow_promotion_codes: true` — человек вводит код прямо в Stripe Checkout. Промокоды синхронизируются в Stripe Coupons при создании в админке.

### 7.4 Кабинет ученика

**/dashboard** — главная страница после входа и ЕДИНЫЙ ЦЕНТР ПОКУПКИ:
- Если есть активные enrollments → карточка(и) курса с прогрессом и кнопкой "Продолжить"
- Если 0 enrollments → **крупный, заметный блок покупки**: обложка курса, название, цена, кнопка "Купить курс" (она вызывает `/api/stripe/checkout`). Это основная точка инициации оплаты (см. 7.3).
- Блок покупки должен быть очевидным и мотивирующим — это не второстепенный empty state, а ключевой элемент конверсии для зарегистрированных, но ещё не купивших.

**/course/[courseId]** — просмотр конкретного курса:
- Middleware + страница проверяют активный enrollment (нет → редирект на `/dashboard`)
- Sidebar с секциями курса
- Рендер блоков из JSONB (read-only)
- Прогресс-трекинг
- Если у курса ещё нет опубликованных секций (наполняется админом) → empty state "Курс скоро будет доступен"

**/profile** — имя, аватар, смена пароля, список купленных курсов.

### 7.5 Админ-панель (multi-course)

Подробное описание UI см. раздел 8.

**Ключевые принципы:**
1. **Course Switcher в topbar** — главный элемент навигации
2. **Два режима:**
   - Конкретный курс → sidebar показывает все пункты, страницы фильтруют данные по курсу
   - "Все курсы" → sidebar скрывает контекстные пункты, страницы показывают сводные данные
3. **URL содержит контекст:** `?course=[uuid]` или `?course=all`

### 7.6 Email уведомления

**Два типа писем — разные механизмы отправки:**

**A) Auth-письма (отправляет Supabase Auth, НЕ наш код):**
- Подтверждение email (6-значный код) — при регистрации
- Сброс пароля
Эти письма шлёт Supabase. Настройка: подключить Resend как SMTP в Supabase Auth, стилизовать шаблоны в Supabase Dashboard (Auth → Email Templates) под бренд. Код в письме — через `{{ .Token }}`. См. раздел 7.2.
> Их НЕ нужно реализовывать как React Email и слать из нашего кода — это сделает Supabase.

**B) Транзакционные письма (отправляет наш код через Resend + React Email):**
Шаблоны в `emails/`:
- `purchase-confirmation.tsx` — подтверждение покупки + доступ (вызывается из `fulfillCheckoutSession`)
- `admin-new-sale.tsx` — уведомление Алле о покупке
- `admin-new-registration.tsx` — уведомление о регистрации (опционально, можно дайджестом)
- `manual-access-granted.tsx` — когда админ выдал доступ вручную
- `welcome.tsx` — приветствие (опционально, после подтверждения email; либо объединить с purchase-confirmation)

Все транзакционные шаблоны принимают `courseTitle` пропсом (не хардкодят название):
```tsx
export default function PurchaseConfirmation({ name, courseTitle, dashboardUrl }) {
  return (
    <Html lang="ru">
      <Body>
        <Text>Поздравляем с покупкой, {name}!</Text>
        <Text>Вы получили доступ к курсу «{courseTitle}».</Text>
        <Button href={dashboardUrl}>Перейти к курсу</Button>
      </Body>
    </Html>
  )
}
```

Дизайн всех писем — в стиле дизайн-файла (бренд, цвета, шрифты).

### 7.7 SEO

Метатеги главной — из featured курса:
```typescript
export async function generateMetadata(): Promise<Metadata> {
  const supabase = createServerClient()
  const { data: course } = await supabase
    .from('courses')
    .select('title, subtitle, description, cover_image_url')
    .eq('is_featured', true)
    .single()
  
  return {
    title: `${course?.title} — American Home Blueprint`,
    description: course?.subtitle || course?.description,
    openGraph: {
      title: course?.title,
      description: course?.subtitle,
      images: course?.cover_image_url ? [{ url: course.cover_image_url }] : [],
    },
  }
}
```

JSON-LD: Organization, Person (Alla), Course (featured), FAQPage.

Sitemap и robots.ts — стандартные.

### 7.8 Производительность и безопасность

Стандартные best practices:
- Server Components по умолчанию
- ISR для лендинга (`revalidate = 60`)
- next/image для всех картинок
- Security headers (CSP, HSTS, X-Frame-Options)
- RLS на всех таблицах
- Stripe webhook signature verification
- Service role key только на сервере
- Rate limiting на критичных endpoints
- Zod-валидация на сервере для всех форм
- DOMPurify для контента из редактора курса
- TypeScript strict без ошибок
- Lighthouse цель 90+ по всем метрикам

### 7.9 Аналитика

GA4, Meta Pixel, Vercel Analytics.

Собственный трекер: каждое событие в analytics_events опционально содержит `course_id`. Это позволяет фильтровать метрики по курсам в админке.

Events: page_view, cta_click, register_start, register_success, checkout_start, purchase, refund, course_section_view, course_section_completed.

---

## 🎨 8. ДИЗАЙН АДМИНКИ (MULTI-COURSE UI)

> Стиль и палитра — из дизайн-файла (раздел 0). Этот раздел описывает структуру и поведение.

### 8.1 Course Switcher

**Расположение:** topbar, слева (сразу после логотипа).

**Триггер:**
- Padding 8px 12px, rounded-md, border
- Слева — иконка/превью курса (24px)
- В центре — название (truncate, max 200px)
- Справа — Chevron-down
- Высота 40px

**Popover при клике** (Command-style, ширина 320px):
- Поиск сверху
- Список курсов: ✓ у выбранного, превью + название + подстрока ("$397 · 142 ученика · published")
- Separator
- "🌐 Все курсы (обзор)" — специальный режим
- Separator
- "+ Создать новый курс"
- "⚙️ Управление курсами"

**Логика:**
- Выбранный курс в URL: `?course=[uuid]` или `?course=all`
- На загрузке: localStorage → fallback на featured course
- Контекст через `useCurrentCourse()`

### 8.2 Sidebar — адаптивный

**Конкретный курс выбран:**
```
── ОБЗОР ──
📊 Главная
📈 Аналитика

── КУРС ──
📝 Редактор
⭐ Отзывы
❓ FAQ

── ОБЩЕЕ ──
👥 Ученики
💳 Заказы
🎟 Промокоды

── СИСТЕМА ──
📚 Курсы
⚙️ Настройки
```

**Все курсы:**
Скрыты: Редактор, Отзывы, FAQ. Главная и Аналитика показывают сводные данные.

Все ссылки автоматически содержат `?course=[id]`.

### 8.3 /admin/courses (список курсов)

**Шапка:**
- H1 "Курсы"
- Подзаголовок
- Кнопка "+ Создать курс"

**Stat-карточки (3):**
- Всего курсов
- Общая выручка
- Всего учеников

**Таблица:**
| Курс | Цена | Учеников | Выручка | Статус | Действия |
|------|------|----------|---------|--------|----------|

Колонки: превью + название + slug; цена (зачёркнутая если есть old_price); учеников (активных enrollments); выручка (sum completed orders); статус (badges Published/Draft, Featured); DropdownMenu.

**Drag-and-drop** для переупорядочивания.

**Модалка "Создать курс":**
- Название (required)
- Slug (auto-gen, editable)
- Описание
- Цена (required, $input)
- Switch "Опубликовать сразу"

После создания → редирект на /admin/courses/[id]/settings.

### 8.4 /admin/courses/[id] (детальная)

**Шапка:**
- Обложка курса
- Название, slug, статус-badges
- Кнопка "Перейти к редактору"

**Tabs:**
- Настройки
- Контент (редактор)
- Ученики
- Отзывы
- FAQ
- Аналитика
- Заказы

#### Tab "Настройки"

**Основная информация:**
- Название, Slug, Подзаголовок, Описание, Обложка, Estimated minutes

**Цена и оплата:**
- Текущая цена, Старая цена, Валюта
- Stripe Product ID, Price ID (readonly)
- Кнопка "Синхронизировать со Stripe"

**Статус и видимость:**
- Switch "Опубликован"
- Switch "Featured" (показывается на главном лендинге)
- Позиция, URL курса

**Доступ:**
- Switch "Lifetime access"
- Срок доступа (дней) — если lifetime off

**Опасная зона:**
- Архивировать, Удалить (с warning)

#### Tab "Контент" — редактор

Drag-and-drop секций и блоков (см. 8.5).

#### Tab "Ученики"

Список учеников с enrollment к этому курсу. Кнопка "+ Добавить ученика".

#### Tabs "Отзывы", "FAQ", "Аналитика", "Заказы"

Привязанные к этому курсу.

### 8.5 Редактор курса (drag-and-drop)

**Layout 3 колонки:**
- Левая (280px): список секций с DnD
- Центр: содержимое выбранной секции с блоками
- Правая (320px, опциональная): настройки выбранного блока

**Шапка редактора:**
- Inline-редактируемое название секции
- Бейдж "Сохранено ✓" / "Сохранение..." / "Не сохранено"
- Switch "Опубликовано"
- Кнопка "Превью"

**Между блоками** — зона добавления, на hover превращается в кнопку "+ Добавить блок". Клик открывает Command-style popover с типами.

**Типы блоков (10):**
1. Heading (h1/h2/h3) — inline contentEditable
2. Text — Tiptap WYSIWYG с floating toolbar
3. Image — drag-n-drop загрузка в course-images bucket
4. Video — URL с автоопределением YouTube/Vimeo, embed превью
5. Link — URL + label, стиль inline/card
6. Button — URL + label + variant
7. List — bullet/numbered
8. Divider — горизонтальная линия
9. Callout — info/warning/success/tip
10. File — загрузка в course-files bucket

**Автосохранение** — debounce 2 сек. Cmd+S — принудительное.

**Превью** — Sheet справа с рендером как у ученика. Toggle Mobile/Tablet/Desktop.

**Клавиатурные шорткаты:**
- Cmd+S — Сохранить
- Cmd+P — Превью
- Cmd+/ или / — Добавить блок
- Cmd+D — Дублировать
- Delete — Удалить (с confirm)

### 8.6 /admin (Dashboard)

**Конкретный курс выбран:**
- 4 stat-карточки: Выручка курса, Новые ученики, Активные, Конверсия
- График выручки этого курса
- Воронка конверсии
- Последние покупки

**Все курсы:**
- Сводные stat-карточки
- График общей выручки
- "По курсам" — гистограмма выручки каждого
- Pie chart "Доля курсов в выручке"

### 8.7 /admin/users (всегда глобальный)

**Таблица:**
- Колонка "Курсы" — chips с enrollments
- Если 3+ курсов — chip "3 курса" с tooltip

**Фильтры:**
- Search, Select "Курс", Select "Период"

**Bulk actions:**
- "Дать доступ к курсу" — модалка с выбором курса
- "Забрать доступ к курсу"

**Кнопки:**
- "Экспорт CSV"
- "+ Добавить ученика"

### 8.8 /admin/users/[id]

В правой колонке профиля — секция "Курсы и доступы":
- Список enrollment'ов
- Для каждого: дата записи, источник, кнопки "Отозвать", "Продлить"
- Кнопка "+ Дать доступ к курсу"

Tab "Прогресс" — выбор курса + прогресс.

### 8.9 /admin/orders

- Колонка "Курс" в таблице
- Фильтр по курсу
- В деталях заказа — обложка + название

### 8.10 /admin/analytics

**Все курсы:** новый таб первым "По курсам" — сравнение, таблица, графики.
**Конкретный курс:** все табы фильтруются.

### 8.11 /admin/promo-codes

- Колонка "Применяется к" (название курса или "Все курсы")
- Модалка создания: Radio "К курсу" (Select) / "Ко всем"
- Synced со Stripe Coupons API

### 8.12 /admin/testimonials, /admin/faq

В контексте курса — привязанные к нему + toggle общие.
В режиме "Все курсы" — empty state "Выберите курс для управления".

### 8.13 /admin/settings

**Разделы:**
- Общие
- Лендинг (выбор featured course, тексты общих секций)
- Email
- Платежи (Stripe общие)
- Интеграции
- SEO
- Юридическое
- Безопасность

Настройки конкретного курса (цена, доступ) — в /admin/courses/[id]/settings.

---

## 📋 9. ENV VARIABLES (.env.local.example)

```env
# === Supabase ===
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# === Stripe ===
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# === Resend ===
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=hello@americanhomeblueprint.com
ADMIN_EMAIL=alla@americanhomeblueprint.com

# === Site ===
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=

# === Rate limiting (опционально) ===
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

NODE_ENV=development
```

---

## 🚦 10. ДЕТАЛЬНЫЙ ПЛАН ВЫПОЛНЕНИЯ

### ЭТАП 0: Дизайн-токены (ОБЯЗАТЕЛЬНЫЙ ПЕРВЫЙ ЭТАП)

**Цель:** превратить дизайн-файл в код.

1. Выполни fetch из раздела 0
2. Изучи admin/index.html и связанные файлы
3. Извлеки:
   - Цветовая палитра → `tailwind.config.ts` + CSS variables в `app/globals.css`
   - Типографика → подключение через `next/font/google`
   - Spacing tokens
   - Border radii, тени
4. Создай `DESIGN_TOKENS.md` с описанием извлечённых токенов
5. Создай базовые UI компоненты в `components/ui/` (button, input, card, badge) в стиле дизайна

**Commit:** `feat(design): design tokens and base UI components`

**Отчёт:** список извлечённых токенов, ссылка на DESIGN_TOKENS.md.

---

### ЭТАП 1: Инициализация проекта

```bash
cd D:\americanhomeedu
pnpm create next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*"
pnpm dlx shadcn@latest init
```

Установка всех пакетов (раздел 4):
```bash
pnpm add @supabase/ssr @supabase/supabase-js stripe @stripe/stripe-js resend @react-email/components @react-email/render
pnpm add react-hook-form zod @hookform/resolvers
pnpm add @tanstack/react-query zustand
pnpm add framer-motion sonner lucide-react
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image
pnpm add isomorphic-dompurify
pnpm add @vercel/analytics @vercel/speed-insights
pnpm add date-fns clsx tailwind-merge nanoid recharts
pnpm add -D prettier prettier-plugin-tailwindcss @tailwindcss/typography tailwindcss-animate
```

Установка shadcn компонентов:
```bash
pnpm dlx shadcn@latest add button card dialog dropdown-menu form input label select sheet skeleton sonner table tabs textarea toast tooltip badge avatar checkbox switch alert separator scroll-area accordion popover command radio-group progress
```

Файлы:
- `.env.local.example`, `.gitignore`, `.prettierrc`
- `next.config.js` с security headers
- `tailwind.config.ts` и `app/globals.css` (из ЭТАПА 0)
- `app/layout.tsx` со шрифтами
- `README.md`

Initial commit.

**Отчёт:** список пакетов, ссылки на dashboards для ключей Supabase/Stripe/Resend.

---

### ЭТАП 2: Supabase setup

Подготовка пользователем: создать Supabase проект, заполнить ключи в `.env.local`, `pnpm supabase link --project-ref xxxxx`.

**Настройка Auth в Supabase Dashboard (важно):**
- Auth → Providers → Email: **"Confirm email" = ON** (подтверждение обязательно)
- Auth → SMTP Settings: подключить **Resend как SMTP-провайдер** (host: smtp.resend.com, port 465, user: resend, password: RESEND_API_KEY), sender — с верифицированного домена
- Auth → Email Templates: шаблон "Confirm signup" настроить на **6-значный код** через `{{ .Token }}` (не ссылку), стилизовать под бренд
- Auth → URL Configuration: Site URL и Redirect URLs (localhost + прод-домен)

Файлы:
- `supabase/migrations/0001_init_schema.sql` (раздел 6.1) — С КУРСАМИ И ENROLLMENTS
- `supabase/migrations/0002_rls_policies.sql` (раздел 6.2)
- `supabase/migrations/0003_functions_triggers.sql` (раздел 6.3)
- `supabase/seed.sql` (несколько FAQ + 3-5 testimonials для featured курса)
- `lib/supabase/{client,server,service,middleware}.ts`
- `middleware.ts`

```bash
pnpm supabase db push
pnpm supabase gen types typescript --linked > types/database.ts
```

Storage buckets (раздел 6.4).

**Commit:** `feat(db): multi-course schema with enrollments, RLS, triggers`

**Отчёт:** как создать первого админа: `UPDATE profiles SET role = 'admin' WHERE email = '...'`.

---

### ЭТАП 3: Auth flow

- `/register` → форма → `signUp` → экран ввода **6-значного кода** → `verifyOtp({ type: 'signup' })` → редирект `/dashboard` (детали — раздел 7.2)
- `/login` → `signInWithPassword` (обработать ошибку "email не подтверждён")
- `/forgot-password` → `resetPasswordForEmail`; `/reset-password` → `updateUser({ password })`
- `/verify-email` — страница ввода кода (если выносить отдельно)
- Auth-письма шлёт Supabase через Resend SMTP (настроено в этапе 2) — НЕ слать вручную
- Middleware защищает `/dashboard`, `/course/[courseId]`, `/admin`
- Rate limiting на login и на повторную отправку кода

**Commit:** `feat(auth): register with email OTP verification, login, password reset`

---

### ЭТАП 4: Лендинг (featured course)

- Все секции лендинга **строго в стиле из дизайн-файла**
- Данные featured курса из БД
- SEO с динамическими метатегами
- JSON-LD
- Sitemap, robots
- Юр. страницы (Privacy, Terms, Refund) — заглушки с TODO

**Commit:** `feat(marketing): landing page with featured course from DB`

---

### ЭТАП 5: Stripe интеграция

- `lib/stripe/fulfill.ts` — **идемпотентная** функция `fulfillCheckoutSession` (создаёт order + enrollment + письма + аналитику; защита от дублей) — раздел 7.3
- `/api/stripe/checkout` с поддержкой course_id (вызывается из блока покупки в кабинете)
- `/api/stripe/webhook` (runtime nodejs, verify signature, на `checkout.session.completed` → `fulfillCheckoutSession`) — ОСНОВНОЙ путь
- `/api/stripe/confirm` (вызывается со страницы success → `fulfillCheckoutSession`) — ДОПОЛНИТЕЛЬНЫЙ путь
- `/checkout/success` — "готовим доступ", вызывает confirm, поллит enrollment, редирект в кабинет
- `/checkout/cancel`
- Транзакционные письма через Resend + React Email (покупка, уведомление админу)
- Auto-sync курса в Stripe Products/Prices в `lib/stripe/sync.ts`
- Тест: Stripe CLI `stripe listen --forward-to localhost:3000/api/stripe/webhook`, карта 4242 4242 4242 4242

**Проверка надёжности (обязательно):** оплатить тест-картой и убедиться, что доступ выдаётся И через webhook, И через success-страницу, и что повторная обработка той же сессии НЕ создаёт дубль заказа.

**Commit:** `feat(stripe): checkout with idempotent dual-path fulfillment`

---

### ЭТАП 6: Кабинет ученика

- `/dashboard` — карточки курсов (есть enrollment) ИЛИ **крупный блок покупки** (нет enrollment) — единый центр покупки, вызывает checkout
- `/course/[courseId]` — просмотр конкретного курса (проверка enrollment), empty state если курс ещё не наполнен
- `/profile`

Middleware + страница проверяют enrollment для доступа к курсу.

**Commit:** `feat(student): dashboard as purchase hub, course viewer with enrollment access`

---

### ЭТАП 7: Админка — фундамент (в стиле дизайна)

**Это первый этап админки. Внимательно следуй стилю из дизайн-файла admin/index.html.**

- Admin layout (sidebar + topbar) **точно как в дизайн-файле**
- Topbar с Course Switcher
- Adaptive Sidebar (логика см. 8.2)
- Course Context provider (`lib/contexts/course-context.tsx`)
- Hook `useCurrentCourse()`
- API endpoint /api/admin/courses/list (для switcher)
- Базовые компоненты: stat-card, data-table, empty-state, page-header

**Commit:** `feat(admin): foundation with course switcher and adaptive sidebar`

**Отчёт:** скриншот админки (если возможно), подтверждение что стиль соответствует дизайну.

---

### ЭТАП 8: Админка — управление курсами

- /admin/courses (список с DnD сортировкой)
- /admin/courses/new (модалка создания)
- /admin/courses/[id] (детальная с табами)
- /admin/courses/[id]/settings
- API: /api/admin/courses, /api/admin/courses/[id]
- Stripe sync при создании/обновлении курса (создание Product + Price)
- Featured course management (toggle, enforcement через unique index)

**Commit:** `feat(admin): courses management with tabs and Stripe sync`

---

### ЭТАП 9: Админка — Dashboard и Analytics

- /admin (dashboard в двух режимах)
- /admin/analytics с переключением режимов
- Графики Recharts
- Воронка конверсии
- Источники трафика

**Commit:** `feat(admin): dashboard and analytics with course-aware modes`

---

### ЭТАП 10: Админка — Users и Orders

- /admin/users (с колонкой "Курсы", bulk actions)
- /admin/users/new
- /admin/users/[id] (с секцией enrollments)
- /admin/orders (с колонкой курс и фильтром)
- /admin/orders/[id] (детали через Sheet)
- API endpoints

**Commit:** `feat(admin): users with enrollments management, orders`

---

### ЭТАП 11: Админка — Редактор курса

**Самая сложная часть. Внимание к деталям.**

- /admin/courses/[id]/editor
- Drag-and-drop секций
- Drag-and-drop блоков внутри секций
- 10 типов блоков с inline editing
- Tiptap для текста
- Загрузка медиа в Supabase Storage
- Автосохранение (debounce 2с)
- Preview mode (Sheet)
- Клавиатурные шорткаты

**Commit:** `feat(admin): drag-and-drop course editor with all block types`

---

### ЭТАП 12: Админка — остальные страницы

- /admin/promo-codes (с привязкой к курсу или ко всем, Stripe coupon sync)
- /admin/testimonials (с фильтром по курсу)
- /admin/faq (с фильтром по курсу)
- /admin/settings (без курс-специфичных настроек)

**Commit:** `feat(admin): promo codes, testimonials, FAQ, global settings`

---

### ЭТАП 13: Аналитика и tracking

- GA4 подключение
- Meta Pixel
- Свой трекер в analytics_events (с course_id)
- Vercel Analytics
- Cookie banner (опционально)

**Commit:** `feat(analytics): GA4, Meta Pixel, custom event tracker`

---

### ЭТАП 14: Polish и деплой

- Email шаблоны финализация (стиль дизайна)
- SEO финализация
- Lighthouse audit (90+ цель)
- Security headers проверка через securityheaders.com
- Тестирование всех flow
- Deployment на Vercel
- Подключение домена
- Stripe webhook на проде
- Resend домен верификация

**Commit:** `chore: production deployment ready`

---

## ✅ 11. КРИТЕРИИ ГОТОВНОСТИ

### Дизайн
- [ ] Дизайн-файл изучен, токены извлечены
- [ ] DESIGN_TOKENS.md создан
- [ ] Главная страница 1:1 с дизайном
- [ ] Админка 1:1 с дизайном
- [ ] Кабинет ученика стилистически един с дизайном

### Архитектура multi-course
- [ ] БД содержит courses, course_enrollments
- [ ] Featured курс через is_featured (только один)
- [ ] RLS политики корректны
- [ ] Stripe sync работает (Product + Price при создании курса)

### Функциональные
- [ ] Лендинг показывает featured курс из БД (не хардкод)
- [ ] Регистрация → подтверждение email 6-значным кодом → кабинет
- [ ] Email "Confirm email" включён в Supabase, auth-письма идут через Resend SMTP
- [ ] Кнопка "Купить" на лендинге маршрутизирует правильно (гость→register, залогинен без курса→dashboard, с курсом→course)
- [ ] Покупка инициируется из блока в кабинете
- [ ] Доступ выдаётся через ОБА пути: webhook И success-страница
- [ ] Обработка оплаты идемпотентна (повторная обработка сессии не создаёт дубль)
- [ ] После оплаты success-страница ждёт enrollment, не кидает в "пустой" кабинет
- [ ] Email содержит динамическое название курса
- [ ] Кабинет показывает enrollments
- [ ] /course/[courseId] требует enrollment
- [ ] Course Switcher работает
- [ ] Sidebar адаптируется
- [ ] /admin/courses CRUD работает
- [ ] Featured toggle работает
- [ ] Редактор курса с всеми типами блоков
- [ ] Промокоды с привязкой к курсу

### Технические
- [ ] TypeScript strict без ошибок
- [ ] Lighthouse 90+ на главной
- [ ] Адаптив проверен на 375/768/1024/1440
- [ ] Security headers активны

### Безопасность
- [ ] RLS на всех таблицах
- [ ] Service role только на сервере
- [ ] Stripe webhook signature
- [ ] Rate limiting

---

## 🚫 12. АНТИ-ПАТТЕРНЫ

- НЕ хардкодить название курса нигде — всегда из БД
- НЕ показывать список курсов на главной — только featured
- НЕ позволять одновременно нескольким курсам быть featured
- НЕ создавать enrollment без необходимых данных
- НЕ забывать course_id в analytics_events
- НЕ выдавать доступ к курсу только через webhook без подстраховки на success-странице
- НЕ редиректить после оплаты сразу в /dashboard без ожидания enrollment (увидит "пустой" кабинет)
- НЕ слать письмо подтверждения email вручную через Resend — это делает Supabase Auth
- НЕ блокировать выдачу доступа на подтверждении email (доступ даёт оплата; email подтверждается ДО покупки на этапе регистрации)
- НЕ забывать про идемпотентность в fulfillCheckoutSession (проверка существующего order перед созданием)
- НЕ привязывать платёж к курсу по email — только по user_id/course_id из metadata
- НЕ отходить от стиля дизайн-файла
- НЕ использовать `'use client'` без необходимости
- НЕ делать `select('*')` без нужды
- НЕ заливать видео в Supabase Storage
- НЕ использовать `dangerouslySetInnerHTML` без DOMPurify
- НЕ забывать индексы (особенно course_id)
- НЕ делать N+1 запросы
- НЕ игнорировать ESLint warnings
- НЕ коммитить без проверки `pnpm build`
- НЕ строить вторичные лендинги под другие курсы (не сейчас)

---

## 🎬 13. СТАРТ

**Порядок действий:**

1. **СНАЧАЛА ЭТАП 0** — fetch дизайна через Claude Design URL (раздел 0). **Это критически важно.** Без этого нельзя писать UI.

2. **ЭТАП 1** — инициализация проекта.

3. После каждого этапа:
   - Короткий отчёт что сделано
   - Список созданных/изменённых файлов
   - Что нужно настроить вручную
   - Git commit
   - Спроси разрешение на следующий этап

4. Если непонятно — задай один конкретный вопрос.

**Начни прямо сейчас с ЭТАПА 0:**

```
Fetch this design file, read its readme, and implement the relevant aspects of the design.
https://api.anthropic.com/v1/design/h/bluIoEQ531zqVklwfCx-cQ?open_file=admin%2Findex.html
Implement: admin/index.html
```

Изучи дизайн, извлеки токены, создай базовые компоненты — и только потом переходи к ЭТАПУ 1.

Поехали 🚀
