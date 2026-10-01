-- =========================================================
-- Talents Klinik — database setup (run once in Supabase)
-- Supabase dashboard > SQL Editor > New query > paste > Run
-- =========================================================

create table if not exists public.tk_profiles (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  email        text,
  data         jsonb not null default '{}'::jsonb,
  match_opt_in boolean not null default false,
  updated_at   timestamptz not null default now()
);

alter table public.tk_profiles enable row level security;

-- Each member can only see and change their own record
drop policy if exists "own row read"   on public.tk_profiles;
drop policy if exists "own row insert" on public.tk_profiles;
drop policy if exists "own row update" on public.tk_profiles;
drop policy if exists "own row delete" on public.tk_profiles;
create policy "own row read"   on public.tk_profiles for select using (auth.uid() = user_id);
create policy "own row insert" on public.tk_profiles for insert with check (auth.uid() = user_id);
create policy "own row update" on public.tk_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own row delete" on public.tk_profiles for delete using (auth.uid() = user_id);

-- A ready-made list of candidates who opted in to employer matching.
-- View it in the dashboard: Table Editor > matching_pool  (only you, as the owner, can see it)
create or replace view public.matching_pool with (security_invoker = true) as
select
  p.email,
  p.data->'profile'->>'firstName'      as first_name,
  p.data->'profile'->>'lastName'       as last_name,
  p.data->'profile'->>'phone'          as phone,
  p.data->'profile'->>'location'       as location,
  p.data->'profile'->>'educationLevel' as education,
  p.data->'profile'->>'course'         as course,
  p.data->'profile'->>'degreeClass'    as degree_class,
  p.data->'profile'->>'nysc'           as nysc_status,
  p.data->'profile'->>'qualifications' as qualifications,
  p.data->'profile'->>'targetRole'     as target_role,
  (p.data->'cv'->'result'->>'score')::int as cv_score,
  p.data->'persona'->>'label'          as persona,
  p.data->'match'->>'availability'     as availability,
  p.data->'match'->>'locations'        as preferred_locations,
  p.data->'match'->>'mode'             as work_mode,
  p.updated_at
from public.tk_profiles p
where p.match_opt_in = true;

revoke all on public.matching_pool from anon, authenticated;
