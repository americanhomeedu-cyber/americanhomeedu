create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
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

-- Auto-create profile on signup (carries full_name + phone from metadata)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Course progress percent
create or replace function public.get_user_course_progress_percent(
  user_uuid uuid,
  course_uuid uuid
)
returns integer
language sql
stable
set search_path = public
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
