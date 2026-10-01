begin;
create table public.hr_revoked_sessions(session_id uuid primary key,revoked_at timestamptz not null default now());
alter table public.hr_revoked_sessions enable row level security;
revoke all on public.hr_revoked_sessions from anon,authenticated;
create function public.hr_invalidate_sessions(p_user uuid) returns void language plpgsql security definer set search_path=public as $$
begin
  insert into hr_revoked_sessions(session_id) select id from auth.sessions where user_id=p_user on conflict do nothing;
end $$;
revoke all on function public.hr_invalidate_sessions(uuid) from public,anon,authenticated;
grant execute on function public.hr_invalidate_sessions(uuid) to service_role;
create or replace function public.hr_role() returns text language sql stable security definer set search_path=public
as $$ select role from hr_profiles where id=auth.uid() and active and not must_change_password
  and session_version=coalesce((auth.jwt()->'app_metadata'->>'hr_session_version')::integer,0)
  and not exists(select 1 from hr_revoked_sessions where session_id=nullif(auth.jwt()->>'session_id','')::uuid) $$;
commit;
