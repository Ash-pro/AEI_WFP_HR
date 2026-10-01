begin;
create table public.hr_login_attempts(key text primary key,window_start timestamptz not null,hits integer not null);
alter table public.hr_login_attempts enable row level security;
revoke all on public.hr_login_attempts from anon,authenticated;
create function public.hr_login_limit(p_key text,p_limit integer) returns boolean language plpgsql security definer set search_path=public as $$
declare n integer;
begin
  insert into hr_login_attempts(key,window_start,hits) values(p_key,now(),1)
  on conflict(key) do update set window_start=case when hr_login_attempts.window_start<now()-interval '15 minutes' then now() else hr_login_attempts.window_start end,
    hits=case when hr_login_attempts.window_start<now()-interval '15 minutes' then 1 else hr_login_attempts.hits+1 end returning hits into n;
  return n<=p_limit;
end $$;
revoke all on function public.hr_login_limit(text,integer) from public,anon,authenticated;
grant execute on function public.hr_login_limit(text,integer) to service_role;
create function public.hr_assign_points(p_actor uuid,p_profile uuid,p_points text[]) returns void language plpgsql security definer set search_path=public as $$
begin
  if not exists(select 1 from hr_profiles where id=p_actor and active and role='super_admin') or not exists(select 1 from hr_profiles where id=p_profile and role='supervisor') then raise exception 'غير مصرح'; end if;
  perform 1 from hr_profiles where id=p_profile for update;
  delete from hr_profile_points where profile_id=p_profile;
  insert into hr_profile_points(profile_id,point_id) select p_profile,unnest(p_points);
end $$;
revoke all on function public.hr_assign_points(uuid,uuid,text[]) from public,anon,authenticated;
grant execute on function public.hr_assign_points(uuid,uuid,text[]) to service_role;
commit;
