begin;
-- Late decisions may settle a review period, never silently modify an approved period.
create function public.hr_assert_mutable(p_start date,p_end date) returns void language plpgsql security definer set search_path=public as $$
begin
  if exists(select 1 from hr_periods where status='closed' and month<=p_end and month+interval '1 month'>p_start) then
    raise exception 'الفترة مغلقة؛ أنشئ إصدار تصحيح معتمد أولًا';
  end if;
end $$;
revoke all on function public.hr_assert_mutable(date,date) from public,anon,authenticated;
create function public.hr_refresh_review_request() returns trigger language plpgsql security definer set search_path=public as $$
declare kind text; startday date; endday date; p record; v jsonb; fieldname text;
begin
  if tg_table_name='hr_leaves' then kind:='leaves';startday:=new.start_date;endday:=new.end_date;
  else kind:='resignations';startday:=new.last_working_date;endday:=new.last_working_date;end if;
  perform hr_assert_mutable(startday,endday);
  for p in select s.month,s.report from hr_snapshots s join hr_periods w using(month) where w.status='review' and s.month<=endday and s.month+interval '1 month'>startday for update of s loop
    select coalesce(jsonb_agg(case when x->>'id'=new.id::text then to_jsonb(new) else x end),'[]'::jsonb) into v from jsonb_array_elements(p.report->kind) x;
    if not exists(select 1 from jsonb_array_elements(v) x where x->>'id'=new.id::text) then v:=v||jsonb_build_array(to_jsonb(new)); end if;
    update hr_snapshots set report=jsonb_set(report,array[kind],v)||jsonb_build_object('generated_at',now()) where month=p.month;
    if kind='resignations' and new.status='معتمد' then
      update hr_snapshots set report=jsonb_set(report,'{employees}',(select jsonb_agg(case when x->>'id'=new.employee_id::text then x||jsonb_build_object('ended_on',new.last_working_date) else x end) from jsonb_array_elements(report->'employees') x)) where month=p.month;
    end if;
  end loop;
  return new;
end $$;
create trigger hr_leave_review_snapshot after insert or update on public.hr_leaves for each row execute function public.hr_refresh_review_request();
create trigger hr_resignation_review_snapshot after insert or update on public.hr_resignations for each row execute function public.hr_refresh_review_request();
-- Corrections require a reason and retain the prior signed-off snapshot.
create table public.hr_report_versions(month date not null,revision integer not null,report jsonb not null,reason text not null,created_at timestamptz not null default now(),primary key(month,revision));
alter table public.hr_report_versions enable row level security;
revoke all on public.hr_report_versions from anon,authenticated;
create function public.hr_reopen_period(p_month date,p_reason text) returns void language plpgsql security definer set search_path=public as $$
declare p hr_periods;
begin
 if hr_role() is distinct from 'super_admin' or coalesce(length(trim(p_reason)),0)<8 then raise exception 'تصحيح الشهر يحتاج مدير النظام وسببًا واضحًا'; end if;
 perform pg_advisory_xact_lock(731906);
 select * into p from hr_periods where month=p_month for update;
 if not found or p.status<>'closed' then raise exception 'الشهر غير مغلق'; end if;
 insert into hr_report_versions(month,revision,report,reason) select p_month,p.revision,report,p_reason from hr_snapshots where month=p_month;
 update hr_periods set revision=revision+1,status='review',closed_at=null,closed_by=null where month=p_month;
 insert into hr_audit(actor,action,record_id,after_data) values(auth.uid(),'period_reopen',p_month::text,jsonb_build_object('reason',p_reason));
end $$;
revoke all on function public.hr_reopen_period(date,text) from public,anon;
grant execute on function public.hr_reopen_period(date,text) to authenticated;
commit;
