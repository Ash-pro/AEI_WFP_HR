begin;
-- Explicit service privileges; never rely on project default grants.
grant all on public.hr_profiles,public.hr_profile_points,public.hr_employees,public.hr_points,
 public.hr_leaves,public.hr_resignations,public.hr_assets,public.hr_transfers,public.hr_periods,
 public.hr_snapshots,public.hr_audit,public.hr_login_attempts,public.hr_revoked_sessions,
 public.hr_profile_requests to service_role;
grant usage,select on sequence public.hr_audit_id_seq to service_role;
create table public.hr_bootstrap_runs(id text primary key,created_at timestamptz not null default now(),result jsonb not null);
alter table public.hr_bootstrap_runs enable row level security;
revoke all on public.hr_bootstrap_runs from anon,authenticated;
create function public.hr_bootstrap(p_id text,p_bundle jsonb) returns jsonb language plpgsql security definer set search_path=public as $$
declare result jsonb;
begin
 perform pg_advisory_xact_lock(731907);
 select r.result into result from hr_bootstrap_runs r where r.id=p_id;
 if found then return result; end if;
 if exists(select 1 from hr_employees) or exists(select 1 from hr_profiles) or exists(select 1 from hr_points) then
   raise exception 'Destination already contains data; bootstrap refuses to overwrite it';
 end if;
 if length(p_id)<>64 or jsonb_array_length(p_bundle->'employees')=0 or jsonb_array_length(p_bundle->'profiles')=0 then raise exception 'Invalid bootstrap bundle'; end if;
 insert into hr_points(id,name,status,data) select id,name,status,data from jsonb_to_recordset(p_bundle->'points') as x(id text,name text,status text,data jsonb);
 insert into hr_employees(national_id,point_id,status,started_on,data) select national_id,point_id,status,started_on,data from jsonb_to_recordset(p_bundle->'employees') as x(national_id text,point_id text,status text,started_on date,data jsonb);
 insert into hr_profiles(id,name,role,must_change_password) select id,name,role,true from jsonb_to_recordset(p_bundle->'profiles') as x(id uuid,name text,role text);
 insert into hr_profile_points(profile_id,point_id) select profile_id,point_id from jsonb_to_recordset(p_bundle->'assignments') as x(profile_id uuid,point_id text);
 result:=jsonb_build_object('employees',jsonb_array_length(p_bundle->'employees'),'points',jsonb_array_length(p_bundle->'points'),'accounts',jsonb_array_length(p_bundle->'profiles'));
 insert into hr_bootstrap_runs values(p_id,now(),result);
 insert into hr_audit(action,record_id,after_data) values('bootstrap',p_id,result);
 return result;
end $$;
revoke all on function public.hr_bootstrap(text,jsonb) from public,anon,authenticated;
grant execute on function public.hr_bootstrap(text,jsonb) to service_role;
commit;
