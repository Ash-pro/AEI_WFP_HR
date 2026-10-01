begin;
create table public.hr_import_batches(id uuid primary key,actor uuid not null,created_at timestamptz not null default now(),result jsonb not null);
alter table public.hr_import_batches enable row level security;
revoke all on public.hr_import_batches from anon,authenticated;
create function public.hr_import_employees(p_rows jsonb,p_reason text,p_batch uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare item jsonb; result jsonb; total integer:=0; nid text;
begin
 if not hr_manage() or length(trim(p_reason))<4 then raise exception 'غير مصرح أو سبب الاستيراد غير مكتمل'; end if;
 if jsonb_typeof(p_rows)<>'array' or jsonb_array_length(p_rows)>500 or jsonb_array_length(p_rows)=0 then raise exception 'دفعة غير صالحة'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_batch::text,0));
 select b.result into result from hr_import_batches b where id=p_batch;
 if found then return result; end if;
 for item in select * from jsonb_array_elements(p_rows) loop
   perform hr_mutate('employee_save',nullif(item->>'id','')::uuid,item||jsonb_build_object('reason',p_reason));total:=total+1;
 end loop;
 result:=jsonb_build_object('saved',total);
 insert into hr_import_batches(id,actor,result) values(p_batch,auth.uid(),result);
 return result;
end $$;
revoke all on function public.hr_import_employees(jsonb,text,uuid) from public,anon;
grant execute on function public.hr_import_employees(jsonb,text,uuid) to authenticated;
commit;
