-- Security hardening (from get_advisors): remove the public RPC surface of
-- SECURITY DEFINER helpers that don't need it.
--   * handle_new_user runs only from the auth.users trigger (definer context),
--     so revoking EXECUTE from PUBLIC does not affect the trigger.
--   * user_active_course_ids is a helper not referenced by any RLS policy.
-- is_admin() is intentionally left callable: it is evaluated inside RLS policies
-- for anon/authenticated roles and only reflects the caller's own admin status.
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.user_active_course_ids(uuid) from public;
