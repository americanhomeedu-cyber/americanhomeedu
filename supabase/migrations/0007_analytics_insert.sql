-- Allow anyone (anon/authenticated) to INSERT analytics events for client-side
-- tracking. Reads stay admin-only (admin_read_analytics). No service-role key
-- needed for the /api/track endpoint.
create policy "public_insert_analytics" on public.analytics_events
  for insert with check (true);
