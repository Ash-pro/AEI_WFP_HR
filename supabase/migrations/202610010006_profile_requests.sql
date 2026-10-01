begin;
create table public.hr_profile_requests (
 id uuid primary key default gen_random_uuid(), employee_id uuid not null references public.hr_employees(id), data jsonb not null, employee_version integer not null,
 status text not null default 'معلق' check(status in ('معلق','معتمد','مرفوض')), reason text not null,
 created_at timestamptz not null default now(), reviewed_at timestamptz, reviewed_by uuid references auth.users(id)
);
create unique index hr_one_profile_request on public.hr_profile_requests(employee_id) where status='معلق';
alter table public.hr_profile_requests enable row level security;
grant select on public.hr_profile_requests to authenticated;
revoke insert,update,delete on public.hr_profile_requests from anon,authenticated;
create policy profile_requests_read on public.hr_profile_requests for select to authenticated using(hr_own(employee_id) or (hr_role()<>'hr_observer' and exists(select 1 from hr_employees e where e.id=employee_id and hr_scope(e.point_id))));
create function public.hr_profile_change(p_employee uuid,p_data jsonb,p_reason text) returns uuid language plpgsql security definer set search_path=public as $$
declare new_id uuid; d jsonb;
begin
 if not hr_own(p_employee) or length(trim(p_reason))<3 then raise exception 'غير مصرح أو السبب غير مكتمل'; end if;
 d:=hr_clean_employee(p_data)-array['supervisor_name','department','category','job_title'];
 if nullif(d->>'full_name_ar','') is null or nullif(d->>'phone','') is null then raise exception 'الاسم والهاتف مطلوبان'; end if;
 insert into hr_profile_requests(employee_id,data,reason,employee_version) select p_employee,d,p_reason,version from hr_employees where id=p_employee returning id into new_id;
 insert into hr_audit(actor,action,record_id) values(auth.uid(),'profile_change_submitted',new_id::text);
 return new_id;
end $$;
create function public.hr_review_profile(p_id uuid,p_approve boolean,p_reason text) returns void language plpgsql security definer set search_path=public as $$
declare q hr_profile_requests; e hr_employees;
begin
 if not hr_manage() or length(trim(p_reason))<3 then raise exception 'غير مصرح أو سبب القرار غير مكتمل'; end if;
 perform hr_ensure_period();
 select * into q from hr_profile_requests where id=p_id and status='معلق' for update;
 if not found then raise exception 'الطلب غير موجود أو محسوم'; end if;
 select * into e from hr_employees where id=q.employee_id for update;
 if p_approve then
  if e.version<>q.employee_version then raise exception 'تغير ملف الموظف بعد تقديم الطلب؛ ارفض الطلب مع طلب إعادة تقديمه'; end if;
  update hr_employees set data=data||q.data,version=version+1,updated_at=now() where id=e.id;
 end if;
 update hr_profile_requests set status=case when p_approve then 'معتمد' else 'مرفوض' end,reviewed_at=now(),reviewed_by=auth.uid(),reason=reason||' | قرار المراجعة: '||p_reason where id=p_id;
 insert into hr_audit(actor,action,record_id,before_data,after_data) values(auth.uid(),'profile_change_reviewed',q.employee_id::text,e.data,jsonb_build_object('approved',p_approve,'submitted_data',q.data,'reason',p_reason));
end $$;
revoke all on function public.hr_profile_change(uuid,jsonb,text),public.hr_review_profile(uuid,boolean,text) from public,anon;
grant execute on function public.hr_profile_change(uuid,jsonb,text),public.hr_review_profile(uuid,boolean,text) to authenticated;
create function public.hr_validate_employee() returns trigger language plpgsql set search_path=public as $$
declare path text;
begin
 if nullif(trim(new.data->>'full_name_ar'),'') is null or nullif(trim(new.data->>'phone'),'') is null then raise exception 'الاسم والهاتف مطلوبان'; end if;
 if coalesce((new.data->>'family_count')::integer,0)<0 or coalesce((new.data->>'children_under_5')::integer,0)<0 or coalesce((new.data->>'children_under_5')::integer,0)>coalesce((new.data->>'family_count')::integer,0) then raise exception 'أعداد الأسرة غير صحيحة'; end if;
 if nullif(new.data->>'birth_date','')::date>(now() at time zone 'Asia/Hebron')::date then raise exception 'تاريخ الميلاد غير صحيح'; end if;
 foreach path in array array[new.data->>'photo_path',new.data->>'id_card_path'] loop
  if nullif(path,'') is not null and (split_part(path,'/',1)<>new.id::text or not exists(select 1 from storage.objects where bucket_id='hr-private-documents' and name=path)) then raise exception 'المرفق غير موجود أو لا يخص الموظف'; end if;
 end loop;
 return new;
end $$;
create trigger hr_employee_validate before insert or update on public.hr_employees for each row execute function public.hr_validate_employee();
create function public.hr_validate_request_document() returns trigger language plpgsql security definer set search_path=public as $$
declare path text:=new.data->>'document_path';
begin
 if nullif(path,'') is not null and (split_part(path,'/',1)<>new.employee_id::text or not exists(select 1 from storage.objects where bucket_id='hr-private-documents' and name=path)) then raise exception 'المرفق غير موجود أو لا يخص الموظف'; end if;
 return new;
end $$;
create trigger hr_leave_document before insert or update on public.hr_leaves for each row execute function public.hr_validate_request_document();
create trigger hr_resignation_document before insert or update on public.hr_resignations for each row execute function public.hr_validate_request_document();
commit;
