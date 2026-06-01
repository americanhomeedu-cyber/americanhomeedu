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
set search_path = public
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
