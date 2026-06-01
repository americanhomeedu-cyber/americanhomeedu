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
  phone text,
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

-- === 2. courses (central table) ===
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

-- Only one course may be featured
create unique index idx_courses_only_one_featured
  on public.courses(is_featured) where is_featured = true;

-- First featured course
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
  ('contact_email', '"hello@americanhomeedu.com"'::jsonb, ''),
  ('support_email', '"support@americanhomeedu.com"'::jsonb, ''),
  ('refund_days', '30'::jsonb, ''),
  ('default_currency', '"usd"'::jsonb, ''),
  ('hero_badge_text', '"🏡 Курс для русскоязычных в США"'::jsonb, ''),
  ('social_instagram', '"https://instagram.com/move.us.with.alla"'::jsonb, ''),
  ('social_youtube', '"https://youtube.com/@AllaRizayev"'::jsonb, ''),
  ('social_facebook', '"https://www.facebook.com/alla.rizayev"'::jsonb, '');
