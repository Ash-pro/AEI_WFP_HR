-- Cutover only: back up first and deploy the new UI before disabling the legacy APIs.
begin;
revoke all on public.employees,public.leave_requests,public.resignation_requests,public.point_assets,public.profile_update_requests,public.user_profiles,public.work_points,public.point_transfers,public.point_teams from anon,authenticated;
commit;
