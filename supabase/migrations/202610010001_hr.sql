-- New, isolated production schema. Does NOT delete or modify legacy HR tables.
begin;
create table public.hr_points (
  id text primary key, name text not null, data jsonb not null default '{}',
  status text not null default 'نشطة' check(status in ('نشطة','معلقة','مغلقة'))
);
create table public.hr_employees (
  id uuid primary key default gen_random_uuid(), national_id text not null unique check(national_id ~ '^[0-9]{9}$'),
  point_id text references public.hr_points(id), data jsonb not null default '{}',
  status text not null default 'معلق' check(status in ('معلق','نشط','مرفوض')),
  started_on date not null default (now() at time zone 'Asia/Hebron')::date, ended_on date,
  version integer not null default 1, updated_at timestamptz not null default now(),
  check(ended_on is null or ended_on >= started_on), check(not (data ?| array['pin','password','secret']))
);
create table public.hr_profiles (
  id uuid primary key references auth.users(id) on delete cascade, name text not null,
  role text not null check(role in ('super_admin','coordinator','supervisor','hr_observer','employee')),
  active boolean not null default true, employee_id uuid unique references public.hr_employees(id),
  must_change_password boolean not null default true,
  check(role <> 'employee' or employee_id is not null)
);
create table public.hr_profile_points (
  profile_id uuid references public.hr_profiles(id) on delete cascade,
  point_id text references public.hr_points(id), primary key(profile_id,point_id)
);
create table public.hr_leaves (
  id uuid primary key default gen_random_uuid(), employee_id uuid not null references public.hr_employees(id),
  point_id text references public.hr_points(id), employee_name text not null, national_id text not null,
  start_date date not null, end_date date not null, data jsonb not null default '{}',
  status text not null default 'معلق' check(status in ('معلق','معتمد_مشرف','معتمد_نهائي','مرفوض')),
  created_at timestamptz not null default now(), reviewed_at timestamptz, reviewed_by uuid references auth.users(id),
  version integer not null default 1, archived_at timestamptz, check(end_date >= start_date)
);
create table public.hr_resignations (
  id uuid primary key default gen_random_uuid(), employee_id uuid not null references public.hr_employees(id),
  point_id text references public.hr_points(id), employee_name text not null, national_id text not null,
  last_working_date date not null, data jsonb not null default '{}',
  status text not null default 'معلق' check(status in ('معلق','معتمد','مرفوض')),
  created_at timestamptz not null default now(), reviewed_at timestamptz, reviewed_by uuid references auth.users(id),
  version integer not null default 1, archived_at timestamptz
);
create unique index hr_one_resignation on public.hr_resignations(employee_id) where archived_at is null and status in ('معلق','معتمد');
create table public.hr_assets (
  id uuid primary key default gen_random_uuid(), employee_id uuid references public.hr_employees(id),
  point_id text not null references public.hr_points(id), name text not null, quantity integer not null check(quantity>0),
  returned boolean not null default false, created_at timestamptz not null default now()
);
create table public.hr_transfers (
  id uuid primary key default gen_random_uuid(), employee_id uuid not null references public.hr_employees(id),
  data jsonb not null, created_at timestamptz not null default now()
);
create table public.hr_periods (
  month date primary key check(extract(day from month)=1),
  status text not null default 'open' check(status in ('open','review','closed')),
  revision integer not null default 1, closed_at timestamptz, closed_by uuid references auth.users(id)
);
create table public.hr_snapshots (
  month date primary key references public.hr_periods(month), report jsonb not null, created_at timestamptz not null default now()
);
create table public.hr_audit (
  id bigint generated always as identity primary key, actor uuid, action text not null, record_id text,
  before_data jsonb, after_data jsonb, created_at timestamptz not null default now()
);
create index on public.hr_employees(point_id);
create index on public.hr_leaves(start_date,end_date);
create index on public.hr_resignations(last_working_date);

create function public.hr_role() returns text language sql stable security definer set search_path=public
as $$ select role from hr_profiles where id=auth.uid() and active $$;
create function public.hr_manage() returns boolean language sql stable security definer set search_path=public
as $$ select coalesce(hr_role() in ('super_admin','coordinator'),false) $$;
create function public.hr_scope(p_point text) returns boolean language sql stable security definer set search_path=public
as $$ select coalesce(hr_role() in ('super_admin','coordinator','hr_observer') or (hr_role()='supervisor' and exists(select 1 from hr_profile_points where profile_id=auth.uid() and point_id=p_point)),false) $$;
create function public.hr_own(p_employee uuid) returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from hr_profiles where id=auth.uid() and active and role='employee' and employee_id=p_employee) $$;

alter table public.hr_profiles enable row level security;
alter table public.hr_profile_points enable row level security;
alter table public.hr_points enable row level security;
alter table public.hr_employees enable row level security;
alter table public.hr_leaves enable row level security;
alter table public.hr_resignations enable row level security;
alter table public.hr_assets enable row level security;
alter table public.hr_transfers enable row level security;
alter table public.hr_periods enable row level security;
alter table public.hr_snapshots enable row level security;
alter table public.hr_audit enable row level security;
create policy profiles_read on public.hr_profiles for select to authenticated using(id=auth.uid() or hr_role()='super_admin');
create policy assignments_read on public.hr_profile_points for select to authenticated using(profile_id=auth.uid() or hr_role()='super_admin');
create policy points_read on public.hr_points for select to authenticated using(hr_scope(id) or hr_role()='employee');
create policy employees_read on public.hr_employees for select to authenticated using(hr_scope(point_id) or hr_own(id));
create policy leaves_read on public.hr_leaves for select to authenticated using(archived_at is null and ((hr_scope(point_id) and (hr_role()<>'hr_observer' or status='معتمد_نهائي')) or hr_own(employee_id)));
create policy resignations_read on public.hr_resignations for select to authenticated using(archived_at is null and ((hr_scope(point_id) and (hr_role()<>'hr_observer' or status='معتمد')) or hr_own(employee_id)));
create policy assets_read on public.hr_assets for select to authenticated using((hr_role()<>'hr_observer' and hr_scope(point_id)) or hr_own(employee_id));
create policy transfers_read on public.hr_transfers for select to authenticated using(hr_role()<>'hr_observer' and (hr_own(employee_id) or exists(select 1 from hr_employees e where e.id=employee_id and hr_scope(e.point_id))));
create policy periods_read on public.hr_periods for select to authenticated using(hr_role() is not null);
create policy audit_read on public.hr_audit for select to authenticated using(hr_role()='super_admin');
-- Snapshots are accessible ONLY through the scoped reporting function.
revoke all on public.hr_snapshots from anon,authenticated;
grant select on public.hr_profiles,public.hr_profile_points,public.hr_points,public.hr_employees,public.hr_leaves,public.hr_resignations,public.hr_assets,public.hr_transfers,public.hr_periods,public.hr_audit to authenticated;
revoke insert,update,delete on public.hr_profiles,public.hr_profile_points,public.hr_points,public.hr_employees,public.hr_leaves,public.hr_resignations,public.hr_assets,public.hr_transfers,public.hr_periods,public.hr_audit from anon,authenticated;

-- Only server-internal callers can obtain an unscoped report.
create function public.hr_raw_report(p_month date) returns jsonb language sql security definer set search_path=public
as $$ select jsonb_build_object(
  'employees',coalesce((select jsonb_agg(to_jsonb(e)) from hr_employees e where started_on < p_month+interval '1 month' and (ended_on is null or ended_on>=p_month)),'[]'::jsonb),
  'points',coalesce((select jsonb_agg(to_jsonb(p)) from hr_points p),'[]'::jsonb),
  'leaves',coalesce((select jsonb_agg(to_jsonb(l)) from hr_leaves l where archived_at is null and start_date < p_month+interval '1 month' and end_date>=p_month),'[]'::jsonb),
  'resignations',coalesce((select jsonb_agg(to_jsonb(r)) from hr_resignations r where archived_at is null and last_working_date>=p_month and last_working_date<p_month+interval '1 month'),'[]'::jsonb),
  'transfers',coalesce((select jsonb_agg(to_jsonb(t)) from hr_transfers t where (created_at at time zone 'Asia/Hebron')::date>=p_month and (created_at at time zone 'Asia/Hebron')::date<p_month+interval '1 month'),'[]'::jsonb),
  'generated_at',now()) $$;
revoke all on function public.hr_raw_report(date) from public,anon,authenticated;

create function public.hr_ensure_period() returns void language plpgsql security definer set search_path=public as $$
declare m date := date_trunc('month',now() at time zone 'Asia/Hebron')::date; previous record;
begin
  perform pg_advisory_xact_lock(731906);
  for previous in select month from hr_periods where status='open' and month<m for update loop
    insert into hr_snapshots(month,report) values(previous.month,hr_raw_report(previous.month)) on conflict(month) do nothing;
    update hr_periods set status='review' where month=previous.month;
  end loop;
  insert into hr_periods(month) values(m) on conflict do nothing;
end $$;
revoke all on function public.hr_ensure_period() from public,anon,authenticated;
create function public.hr_list_periods() returns jsonb language plpgsql security definer set search_path=public as $$
begin
  if hr_role() is null then raise exception 'غير مصرح'; end if;
  perform hr_ensure_period();
  return (select coalesce(jsonb_agg(to_jsonb(p) order by month desc),'[]'::jsonb) from hr_periods p);
end $$;
create function public.hr_report(p_month date) returns jsonb language plpgsql security definer set search_path=public as $$
declare result jsonb; period_row hr_periods; r text := hr_role();
begin
  if r is null then raise exception 'غير مصرح'; end if;
  perform hr_ensure_period();
  select * into period_row from hr_periods where month=p_month;
  if not found then raise exception 'الفترة غير موجودة'; end if;
  if period_row.status='open' then result:=hr_raw_report(p_month);
  else select report into result from hr_snapshots where month=p_month; end if;
  if result is null then raise exception 'نسخة الشهر غير متاحة؛ يلزم مراجعة الإدارة'; end if;
  result:=jsonb_set(result,'{employees}',coalesce((select jsonb_agg(x) from jsonb_array_elements(result->'employees') x where hr_scope(x->>'point_id') or hr_own((x->>'id')::uuid)),'[]'));
  result:=jsonb_set(result,'{points}',coalesce((select jsonb_agg(x) from jsonb_array_elements(result->'points') x where hr_scope(x->>'id') or r='employee'),'[]'));
  result:=jsonb_set(result,'{leaves}',coalesce((select jsonb_agg(x) from jsonb_array_elements(result->'leaves') x where (hr_scope(x->>'point_id') and (r<>'hr_observer' or x->>'status'='معتمد_نهائي')) or hr_own((x->>'employee_id')::uuid)),'[]'));
  result:=jsonb_set(result,'{resignations}',coalesce((select jsonb_agg(x) from jsonb_array_elements(result->'resignations') x where (hr_scope(x->>'point_id') and (r<>'hr_observer' or x->>'status'='معتمد')) or hr_own((x->>'employee_id')::uuid)),'[]'));
  result:=jsonb_set(result,'{transfers}',coalesce((select jsonb_agg(x) from jsonb_array_elements(result->'transfers') x where r<>'hr_observer' and (hr_own((x->>'employee_id')::uuid) or exists(select 1 from jsonb_array_elements(result->'employees') e where e->>'id'=x->>'employee_id'))),'[]'));
  return result || jsonb_build_object('period',to_jsonb(period_row));
end $$;

create function public.hr_clean_employee(p_data jsonb) returns jsonb language sql immutable set search_path=public as $$
 select coalesce(jsonb_object_agg(key,value),'{}') from jsonb_each(p_data) where key=any(array[
 'full_name_ar','full_name_en','birth_date','marital_status','family_count','children_under_5','phone','email','category','job_title','department','supervisor_name','degree','major','graduation_year','university','university_other','license_number','license_date','current_gov','current_address','housing_type','prewar_gov','prewar_address','payment_method','iban_or_phone','bank_account','bank_branch','photo_path','id_card_path','notes','declaration_agreed'])
$$;

create function public.hr_mutate(p_action text,p_id uuid default null,p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path=public as $$
declare r text:=hr_role(); e hr_employees; l hr_leaves; s hr_resignations; b jsonb; a jsonb;
  target uuid; pt text; d jsonb; m date:=date_trunc('month',now() at time zone 'Asia/Hebron')::date;
  today date:=(now() at time zone 'Asia/Hebron')::date; endday date; version_no integer;
begin
  if r is null or r='hr_observer' then raise exception 'صلاحية عرض فقط أو جلسة غير صالحة'; end if;
  if exists(select 1 from hr_profiles where id=auth.uid() and must_change_password) then raise exception 'غيّر كلمة المرور المؤقتة أولًا'; end if;
  perform hr_ensure_period();
  if (select status from hr_periods where month=m)<>'open' then raise exception 'الشهر الحالي مغلق'; end if;
  if p_action in ('employee_save','employee_approve','employee_reject','transfer') then
    if not hr_manage() then raise exception 'تعديل الملفات محصور بالإدارة'; end if;
    if nullif(trim(p_payload->>'reason'),'') is null then raise exception 'سبب الإجراء مطلوب'; end if;
    if p_id is not null then
      select * into e from hr_employees where id=p_id for update;
      if not found then raise exception 'الموظف غير موجود'; end if;
      if e.version is distinct from (p_payload->>'version')::integer or not(p_payload ? 'version') then raise exception 'تغير السجل؛ أعد تحميله قبل الحفظ'; end if;
      b:=to_jsonb(e);
    end if;
    if p_action='employee_save' then
      d:=hr_clean_employee(p_payload->'data');
      if nullif(trim(d->>'full_name_ar'),'') is null or nullif(trim(d->>'phone'),'') is null or nullif(trim(d->>'job_title'),'') is null then raise exception 'الاسم والجوال والمسمى الوظيفي مطلوبة'; end if;
      if coalesce((d->>'family_count')::integer,0)<0 or coalesce((d->>'children_under_5')::integer,0)<0 or coalesce((d->>'children_under_5')::integer,0)>coalesce((d->>'family_count')::integer,0) then raise exception 'أعداد الأسرة غير صحيحة'; end if;
      if nullif(d->>'birth_date','')::date>today then raise exception 'تاريخ الميلاد غير صحيح'; end if;
      if p_id is null then
        if (p_payload->>'started_on')::date<m then raise exception 'الإضافة السابقة لشهر التشغيل تحتاج ترحيلًا موثقًا'; end if;
        insert into hr_employees(national_id,point_id,data,started_on) values(p_payload->>'national_id',nullif(p_payload->>'point_id',''),d,(p_payload->>'started_on')::date) returning * into e;
      else
        if e.point_id is distinct from nullif(p_payload->>'point_id','') then raise exception 'لتغيير النقطة استخدم إجراء النقل'; end if;
        if e.started_on<m and e.started_on is distinct from (p_payload->>'started_on')::date then raise exception 'لا يمكن تغيير تاريخ خدمة سابق دون تسوية تاريخية'; end if;
        update hr_employees set national_id=p_payload->>'national_id',data=d,started_on=(p_payload->>'started_on')::date,version=version+1,updated_at=now() where id=p_id returning * into e;
      end if;
    elsif p_action in ('employee_approve','employee_reject') then
      if e.status<>'معلق' then raise exception 'الطلب محسوم بالفعل'; end if;
      update hr_employees set status=case when p_action='employee_approve' then 'نشط' else 'مرفوض' end,version=version+1,updated_at=now(),data=data||jsonb_build_object('notes',p_payload->>'reason') where id=p_id returning * into e;
    else
      pt:=p_payload->>'point_id';
      if e.ended_on is not null and e.ended_on<today then raise exception 'خدمة الموظف منتهية'; end if;
      if pt=e.point_id or not exists(select 1 from hr_points where id=pt and status='نشطة') then raise exception 'اختر نقطة نشطة مختلفة'; end if;
      insert into hr_transfers(employee_id,data) values(e.id,jsonb_build_object('from_point',e.point_id,'to_point',pt,'reason',p_payload->>'reason','actor',auth.uid(),'effective_on',today));
      update hr_employees set point_id=pt,data=data||jsonb_build_object('supervisor_name',(select data->>'supervisor_name' from hr_points where id=pt)),version=version+1,updated_at=now() where id=p_id returning * into e;
    end if;
    a:=to_jsonb(e);
  elsif p_action in ('leave_submit','resignation_submit') then
    target:=(p_payload->>'employee_id')::uuid;
    select * into e from hr_employees where id=target for update;
    if not found or not (hr_own(e.id) or (hr_scope(e.point_id) and r<>'employee')) then raise exception 'الموظف خارج نطاق الحساب'; end if;
    if e.status<>'نشط' or (e.ended_on is not null and e.ended_on<today) then raise exception 'الموظف غير نشط'; end if;
    if p_id is null then raise exception 'معرف الطلب مطلوب'; end if;
    if p_action='leave_submit' then
      if exists(select 1 from hr_leaves where id=p_id and employee_id=e.id) then return jsonb_build_object('id',p_id); end if;
      if (p_payload->>'start_date')::date<m then raise exception 'الطلب السابق لشهر التشغيل يحتاج تسوية من الإدارة'; end if;
      if (p_payload->>'start_date')::date<e.started_on or (p_payload->>'end_date')::date<(p_payload->>'start_date')::date or (e.ended_on is not null and (p_payload->>'end_date')::date>e.ended_on) then raise exception 'تواريخ الإجازة خارج الخدمة أو غير صحيحة'; end if;
      if exists(select 1 from hr_leaves where employee_id=e.id and archived_at is null and status<>'مرفوض' and start_date<=(p_payload->>'end_date')::date and end_date>=(p_payload->>'start_date')::date) then raise exception 'توجد إجازة متداخلة'; end if;
      if p_payload->>'leave_type' not in ('سنوية','مرضية','طارئة','أمومة','أخرى') then raise exception 'نوع إجازة غير صحيح'; end if;
      if p_payload->>'leave_type'='مرضية' and nullif(p_payload->>'document_path','') is null then raise exception 'التقرير الطبي مطلوب'; end if;
      insert into hr_leaves(id,employee_id,point_id,employee_name,national_id,start_date,end_date,data) values(p_id,e.id,e.point_id,e.data->>'full_name_ar',e.national_id,(p_payload->>'start_date')::date,(p_payload->>'end_date')::date,jsonb_build_object('leave_type',p_payload->>'leave_type','notes',p_payload->>'notes','document_path',p_payload->>'document_path')) returning to_jsonb(hr_leaves.*) into a;
    else
      if exists(select 1 from hr_resignations where id=p_id and employee_id=e.id) then return jsonb_build_object('id',p_id); end if;
      if (p_payload->>'last_working_date')::date<today or nullif(p_payload->>'document_path','') is null or nullif(trim(p_payload->>'reason'),'') is null then raise exception 'آخر يوم عمل صالح وخطاب الاستقالة والسبب مطلوبة'; end if;
      insert into hr_resignations(id,employee_id,point_id,employee_name,national_id,last_working_date,data) values(p_id,e.id,e.point_id,e.data->>'full_name_ar',e.national_id,(p_payload->>'last_working_date')::date,jsonb_build_object('reason',p_payload->>'reason','document_path',p_payload->>'document_path')) returning to_jsonb(hr_resignations.*) into a;
    end if;
  elsif p_action in ('leave_approve','leave_reject') then
    select * into l from hr_leaves where id=p_id and archived_at is null for update;
    if not found or r='employee' or not hr_scope(l.point_id) then raise exception 'غير مصرح'; end if;
    if l.version is distinct from (p_payload->>'version')::integer then raise exception 'تغير الطلب؛ أعد تحميله'; end if;
    if l.status not in ('معلق','معتمد_مشرف') then raise exception 'الطلب محسوم'; end if;
    perform hr_assert_mutable(l.start_date,l.end_date);
    b:=to_jsonb(l);
    if p_action='leave_reject' then
      if nullif(trim(p_payload->>'reason'),'') is null then raise exception 'سبب الرفض مطلوب'; end if;
      l.status:='مرفوض';
    elsif r='supervisor' and l.status='معلق' then l.status:='معتمد_مشرف';
    elsif hr_manage() and l.status='معتمد_مشرف' then l.status:='معتمد_نهائي';
    elsif hr_manage() and l.status='معلق' then l.status:='معتمد_مشرف';
    else raise exception 'غير مصرح بالاعتماد النهائي'; end if;
    update hr_leaves set status=l.status,reviewed_by=auth.uid(),reviewed_at=now(),version=version+1,data=data||jsonb_build_object('review_reason',p_payload->>'reason') where id=p_id returning to_jsonb(hr_leaves.*) into a;
  elsif p_action in ('resignation_approve','resignation_reject') then
    if not hr_manage() then raise exception 'اعتماد الاستقالة للإدارة فقط'; end if;
    select * into s from hr_resignations where id=p_id and archived_at is null for update;
    if not found or s.status<>'معلق' then raise exception 'الطلب غير موجود أو محسوم'; end if;
    if s.version is distinct from (p_payload->>'version')::integer then raise exception 'تغير الطلب؛ أعد تحميله'; end if;
    perform hr_assert_mutable(s.last_working_date,s.last_working_date);
    b:=to_jsonb(s);
    if p_action='resignation_approve' then
      select * into e from hr_employees where id=s.employee_id for update;
      if exists(select 1 from hr_assets where employee_id=e.id and not returned) then raise exception 'توجد عهد لم تسلم بعد'; end if;
      target:=(p_payload->>'replacement_id')::uuid;
      if target=e.id or not exists(select 1 from hr_employees where id=target and status='نشط' and started_on<=s.last_working_date+1 and (ended_on is null or ended_on>s.last_working_date)) then raise exception 'اختر بديلًا نشطًا مختلفًا'; end if;
      update hr_employees set ended_on=s.last_working_date,version=version+1,updated_at=now() where id=e.id;
      s.data:=s.data||jsonb_build_object('replacement_id',target,'replacement_name',(select data->>'full_name_ar' from hr_employees where id=target),'clearance_completed',true);
      s.status:='معتمد';
    else
      if nullif(trim(p_payload->>'reason'),'') is null then raise exception 'سبب الرفض مطلوب'; end if;
      s.status:='مرفوض'; s.data:=s.data||jsonb_build_object('review_reason',p_payload->>'reason');
    end if;
    update hr_resignations set status=s.status,data=s.data,reviewed_by=auth.uid(),reviewed_at=now(),version=version+1 where id=p_id returning to_jsonb(hr_resignations.*) into a;
  elsif p_action='point_save' then
    if not hr_manage() then raise exception 'تعديل النقاط للإدارة فقط'; end if;
    pt:=p_payload->>'point_id';
    select to_jsonb(p) into b from hr_points p where id=pt for update;
    if not found then raise exception 'النقطة غير موجودة'; end if;
    if nullif(trim(p_payload->>'name'),'') is null or nullif(trim(p_payload->>'reason'),'') is null then raise exception 'اسم النقطة وسبب التعديل مطلوبان'; end if;
    update hr_points set name=p_payload->>'name',status=p_payload->>'status',data=jsonb_build_object('governorate',p_payload->>'governorate','supervisor_name',p_payload->>'supervisor_name','programs',p_payload->>'programs','address',p_payload->>'address') where id=pt returning to_jsonb(hr_points.*) into a;
  elsif p_action in ('asset_add','asset_return') then
    if not hr_manage() then raise exception 'إدارة العهد للإدارة فقط'; end if;
    if p_action='asset_add' then
      target:=nullif(p_payload->>'employee_id','')::uuid;
      if target is not null then perform 1 from hr_employees where id=target and (ended_on is null or ended_on>=today) for update; if not found then raise exception 'خدمة الموظف منتهية'; end if; end if;
      insert into hr_assets(employee_id,point_id,name,quantity) values(target,p_payload->>'point_id',p_payload->>'name',(p_payload->>'quantity')::integer) returning to_jsonb(hr_assets.*) into a;
    else
      select to_jsonb(x) into b from hr_assets x where id=p_id for update;
      update hr_assets set returned=true where id=p_id and not returned returning to_jsonb(hr_assets.*) into a;
      if a is null then raise exception 'العهدة غير موجودة أو أعيدت مسبقًا'; end if;
    end if;
  else raise exception 'إجراء غير معروف'; end if;
  insert into hr_audit(actor,action,record_id,before_data,after_data) values(auth.uid(),p_action,coalesce(a->>'id',p_id::text),b,a);
  return a;
end $$;

create function public.hr_close_period(p_month date) returns void language plpgsql security definer set search_path=public as $$
begin
  if not hr_manage() then raise exception 'غير مصرح'; end if;
  perform hr_ensure_period();
  perform 1 from hr_periods where month=p_month and status='review' for update;
  if not found then raise exception 'يمكن إغلاق شهر سابق قيد المراجعة فقط'; end if;
  if exists(select 1 from hr_leaves where archived_at is null and status in ('معلق','معتمد_مشرف') and start_date<p_month+interval '1 month' and end_date>=p_month)
    or exists(select 1 from hr_resignations where archived_at is null and status='معلق' and last_working_date>=p_month and last_working_date<p_month+interval '1 month') then raise exception 'توجد طلبات معلقة؛ يلزم تسويتها قبل الإغلاق'; end if;
  update hr_periods set status='closed',closed_at=now(),closed_by=auth.uid() where month=p_month;
  insert into hr_audit(actor,action,record_id) values(auth.uid(),'period_close',p_month::text);
end $$;
create function public.hr_log_export(p_month date,p_kind text,p_scope text) returns void language plpgsql security definer set search_path=public as $$
begin
  if hr_role() is null or hr_role()='employee' then raise exception 'غير مصرح بالتصدير'; end if;
  insert into hr_audit(actor,action,record_id,after_data) values(auth.uid(),'export',p_month::text,jsonb_build_object('kind',p_kind,'scope',p_scope));
end $$;
revoke all on function public.hr_list_periods(),public.hr_report(date),public.hr_mutate(text,uuid,jsonb),public.hr_close_period(date),public.hr_log_export(date,text,text) from public,anon;
grant execute on function public.hr_list_periods(),public.hr_report(date),public.hr_mutate(text,uuid,jsonb),public.hr_close_period(date),public.hr_log_export(date,text,text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('hr-private-documents','hr-private-documents',false,8388608,array['image/jpeg','image/png','application/pdf']) on conflict(id) do nothing;
create policy hr_documents_read on storage.objects for select to authenticated using(bucket_id='hr-private-documents' and exists(select 1 from public.hr_employees e where e.id::text=(storage.foldername(name))[1] and (public.hr_scope(e.point_id) or public.hr_own(e.id))));
create policy hr_documents_upload on storage.objects for insert to authenticated with check(bucket_id='hr-private-documents' and exists(select 1 from public.hr_employees e where e.id::text=(storage.foldername(name))[1] and (public.hr_manage() or public.hr_own(e.id))));
-- Intentionally no object overwrite/delete permission. Retention handled server-side.
commit;
