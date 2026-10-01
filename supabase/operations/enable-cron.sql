-- Apply on Supabase after migrations. Uses local civil time inside hr_ensure_period.
create extension if not exists pg_cron;
select cron.schedule('hr-month-rollover','* * * * *',$job$select public.hr_ensure_period();$job$);
select cron.schedule('hr-login-counter-retention','17 2 * * *',$job$delete from public.hr_login_attempts where window_start<now()-interval '2 days';$job$);
