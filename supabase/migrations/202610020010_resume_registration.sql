begin;
alter table public.hr_profile_requests add column revision integer not null default 1;
create function public.hr_registration_save(p_user uuid,p_version integer,p_revision integer,p_data jsonb) returns jsonb
language plpgsql security definer set search_path=public as $$
declare e hr_employees; q hr_profile_requests; employee uuid; d jsonb; result jsonb;
begin
 select employee_id into employee from hr_profiles where id=p_user and role='employee' and active and not must_change_password;
 if employee is null then raise exception 'الحساب غير مفعّل أو يحتاج تغيير الرمز المؤقت'; end if;
 perform hr_ensure_period();
 perform pg_advisory_xact_lock(hashtextextended(employee::text,2));
 select * into q from hr_profile_requests where employee_id=employee and status='معلق' for update;
 if q.revision is distinct from p_revision then raise exception 'تغير طلب التعديل؛ أعد تحميل البيانات'; end if;
 select * into e from hr_employees where id=employee for update;
 if e.version is distinct from p_version then raise exception 'تغير الملف؛ أعد تحميل البيانات'; end if;
 if e.status not in ('معلق','نشط') then raise exception 'راجع الإدارة بشأن حالة الملف'; end if;
 d:=hr_clean_employee(p_data)-array['photo_path','id_card_path','supervisor_name','department','category','notes'];
 if coalesce(d->>'job_title','') not in ('منسق مشروع','قائد فرق ميدانية','عامل صحة ميداني','متطوع','أمن') then raise exception 'اختر المسمى الوظيفي من القائمة'; end if;
 if length(trim(coalesce(d->>'full_name_ar','')))<3 or length(trim(coalesce(d->>'phone','')))<7 then raise exception 'الاسم والجوال مطلوبان'; end if;
 if coalesce((d->>'family_count')::integer,0)<0 or coalesce((d->>'children_under_5')::integer,0)<0 or coalesce((d->>'children_under_5')::integer,0)>coalesce((d->>'family_count')::integer,0) then raise exception 'أعداد الأسرة غير صحيحة'; end if;
 if nullif(d->>'birth_date','')::date>(now() at time zone 'Asia/Hebron')::date then raise exception 'تاريخ الميلاد غير صحيح'; end if;
 if e.status='معلق' then
   update hr_employees set data=data||d,version=version+1,updated_at=now() where id=employee;
   result:=jsonb_build_object('success',true,'review','registration');
 else
   if q.id is null then
     insert into hr_profile_requests(employee_id,data,reason,employee_version) values(employee,d,'تعديل من صفحة التسجيل',e.version);
   else
     update hr_profile_requests set data=d,employee_version=e.version,revision=revision+1,reason='تعديل من صفحة التسجيل' where id=q.id;
   end if;
   result:=jsonb_build_object('success',true,'review','profile_change');
 end if;
 insert into hr_audit(actor,action,record_id) values(p_user,'registration_updated',employee::text);
 return result;
end $$;
revoke all on function public.hr_registration_save(uuid,integer,integer,jsonb) from public,anon,authenticated;
grant execute on function public.hr_registration_save(uuid,integer,integer,jsonb) to service_role;
commit;
