insert into storage.buckets (id, name, public) values
  ('course-covers', 'course-covers', true),
  ('course-images', 'course-images', true),
  ('course-files', 'course-files', false),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

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
