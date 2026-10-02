begin;
-- Service-only registration: never overwrite or claim an existing identity.
create function public.hr_register_employee(p_user uuid,p_national_id text,p_data jsonb) returns uuid
language plpgsql security definer set search_path=public as $$
declare d jsonb; employee uuid;
begin
 if p_national_id !~ '^[0-9]{9}$' or p_national_id is null or p_user is null then raise exception 'Invalid registration'; end if;
 d:=hr_clean_employee(p_data)-array['photo_path','id_card_path','supervisor_name','department','category','notes'];
 if length(trim(coalesce(d->>'full_name_ar','')))<3 or length(trim(coalesce(d->>'phone','')))<7 or nullif(trim(d->>'job_title'),'') is null then raise exception 'Required registration fields missing'; end if;
 perform hr_ensure_period();
 insert into hr_employees(national_id,data,status,started_on) values(p_national_id,d,'معلق',(now() at time zone 'Asia/Hebron')::date) returning id into employee;
 insert into hr_profiles(id,name,role,employee_id,must_change_password) values(p_user,d->>'full_name_ar','employee',employee,false);
 insert into hr_audit(actor,action,record_id) values(p_user,'public_registration',employee::text);
 return employee;
end $$;
revoke all on function public.hr_register_employee(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.hr_register_employee(uuid,text,jsonb) to service_role;
commit;
