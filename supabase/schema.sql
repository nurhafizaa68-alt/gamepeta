-- Jalankan sekali di SQL Editor Supabase.
create table if not exists public.progress (
 user_id uuid not null references auth.users(id) on delete cascade,
 world_id text not null check(world_id in ('fruit','school','family','hobby','food')),
 stars integer not null default 0 check(stars between 0 and 3),
 updated_at timestamptz not null default now(),
 primary key(user_id,world_id)
);
alter table public.progress enable row level security;
revoke all on public.progress from anon, authenticated;
grant select on public.progress to authenticated;
grant all on public.progress to service_role;
create policy "Read own progress" on public.progress for select to authenticated using(auth.uid()=user_id);
create or replace function public.record_progress(p_user uuid,p_world text,p_stars integer)
returns void language sql security invoker set search_path=public as $$
 insert into public.progress(user_id,world_id,stars) values(p_user,p_world,p_stars)
 on conflict(user_id,world_id) do update set stars=greatest(progress.stars,excluded.stars),updated_at=now();
$$;
revoke all on function public.record_progress(uuid,text,integer) from public,anon,authenticated;
grant execute on function public.record_progress(uuid,text,integer) to service_role;
