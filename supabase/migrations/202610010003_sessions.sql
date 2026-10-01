begin;
alter table public.hr_profiles add column session_version integer not null default 0;
create or replace function public.hr_role() returns text language sql stable security definer set search_path=public
as $$ select role from hr_profiles where id=auth.uid() and active and not must_change_password
  and session_version=coalesce((auth.jwt()->'app_metadata'->>'hr_session_version')::integer,0) $$;
create or replace function public.hr_own(p_employee uuid) returns boolean language sql stable security definer set search_path=public
as $$ select hr_role()='employee' and exists(select 1 from hr_profiles where id=auth.uid() and active and employee_id=p_employee) $$;
-- Own profile remains readable to explain pending password changes. No HR data is available before the change.
commit;
