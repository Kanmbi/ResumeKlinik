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

-- =========================================================
-- EMPLOYER PORTAL  (safe to run again: everything is "if not exists" / "or replace")
-- Employers only ever see anonymised candidates. Names, emails and phone numbers
-- are visible to admins (you) only, so every introduction goes through Talents Klinik.
-- =========================================================

-- Admins: add yourself once with
--   insert into public.tk_admins (user_id) select id from auth.users where email = 'you@example.com';
create table if not exists public.tk_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.tk_admins enable row level security;
drop policy if exists "admins read own" on public.tk_admins;
create policy "admins read own" on public.tk_admins for select using (auth.uid() = user_id);

-- Helper checks used by the policies below. SECURITY DEFINER so they can read the
-- admin and employer tables regardless of the caller's own row-level access.
create or replace function public.tk_is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.tk_admins where user_id = auth.uid()) $$;

create or replace function public.tk_touch() returns trigger language plpgsql as
$$ begin new.updated_at = now(); return new; end $$;

-- ---------- Employers ----------
create table if not exists public.tk_employers (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  company      text not null,
  website      text,
  contact_name text not null,
  email        text not null,
  phone        text,
  industry     text,
  size         text,
  roles_hiring text,
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.tk_employers enable row level security;

-- Approved-employer check (defined here because it reads tk_employers).
create or replace function public.tk_is_employer() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.tk_employers where user_id = auth.uid() and status = 'approved') $$;


-- Only an admin may change status or admin_note; employers editing their own details cannot approve themselves.
create or replace function public.tk_employers_guard() returns trigger language plpgsql security definer set search_path = public as
$$ begin
  if not public.tk_is_admin() then
    new.status := old.status;
    new.admin_note := old.admin_note;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists tk_employers_guard on public.tk_employers;
create trigger tk_employers_guard before update on public.tk_employers for each row execute function public.tk_employers_guard();

drop policy if exists "employer read own or admin"   on public.tk_employers;
drop policy if exists "employer insert own pending"  on public.tk_employers;
drop policy if exists "employer update own or admin" on public.tk_employers;
create policy "employer read own or admin"   on public.tk_employers for select using (auth.uid() = user_id or public.tk_is_admin());
create policy "employer insert own pending"  on public.tk_employers for insert with check (auth.uid() = user_id and status = 'pending');
create policy "employer update own or admin" on public.tk_employers for update using (auth.uid() = user_id or public.tk_is_admin()) with check (auth.uid() = user_id or public.tk_is_admin());

-- ---------- Jobs ----------
create table if not exists public.tk_jobs (
  id          uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.tk_employers(user_id) on delete cascade,
  title       text not null,
  description text,
  requirements text,
  location    text,
  work_mode   text,
  level       text,
  salary_min  integer,
  salary_max  integer,
  status      text not null default 'open' check (status in ('open','closed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.tk_jobs enable row level security;
drop trigger if exists tk_jobs_touch on public.tk_jobs;
create trigger tk_jobs_touch before update on public.tk_jobs for each row execute function public.tk_touch();

drop policy if exists "jobs read own or admin" on public.tk_jobs;
drop policy if exists "jobs insert approved employer" on public.tk_jobs;
drop policy if exists "jobs update own or admin" on public.tk_jobs;
drop policy if exists "jobs delete own or admin" on public.tk_jobs;
create policy "jobs read own or admin"        on public.tk_jobs for select using (auth.uid() = employer_id or public.tk_is_admin());
create policy "jobs insert approved employer" on public.tk_jobs for insert with check (auth.uid() = employer_id and public.tk_is_employer());
create policy "jobs update own or admin"      on public.tk_jobs for update using (auth.uid() = employer_id or public.tk_is_admin());
create policy "jobs delete own or admin"      on public.tk_jobs for delete using (auth.uid() = employer_id or public.tk_is_admin());

-- What candidates see: open roles from approved employers, with the company name but no contact details.
create or replace view public.tk_open_jobs as
select j.id, j.title, j.description, j.requirements, j.location, j.work_mode, j.level, j.salary_min, j.salary_max, j.created_at, e.company
from public.tk_jobs j join public.tk_employers e on e.user_id = j.employer_id
where j.status = 'open' and e.status = 'approved';
grant select on public.tk_open_jobs to authenticated;

-- ---------- Candidate interest in a job ----------
create table if not exists public.tk_interests (
  id           uuid primary key default gen_random_uuid(),
  job_id       uuid not null references public.tk_jobs(id) on delete cascade,
  candidate_id uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (job_id, candidate_id)
);
alter table public.tk_interests enable row level security;
drop policy if exists "interest candidate own"   on public.tk_interests;
drop policy if exists "interest candidate add"   on public.tk_interests;
drop policy if exists "interest candidate drop"  on public.tk_interests;
drop policy if exists "interest employer read"   on public.tk_interests;
create policy "interest candidate own"  on public.tk_interests for select using (auth.uid() = candidate_id or public.tk_is_admin());
create policy "interest candidate add"  on public.tk_interests for insert with check (auth.uid() = candidate_id and exists (select 1 from public.tk_open_jobs o where o.id = job_id));
create policy "interest candidate drop" on public.tk_interests for delete using (auth.uid() = candidate_id);
create policy "interest employer read"  on public.tk_interests for select using (exists (select 1 from public.tk_jobs j where j.id = job_id and j.employer_id = auth.uid()));

-- ---------- Shortlist ----------
create table if not exists public.tk_shortlist (
  employer_id  uuid not null references public.tk_employers(user_id) on delete cascade,
  candidate_id uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (employer_id, candidate_id)
);
alter table public.tk_shortlist enable row level security;
drop policy if exists "shortlist own" on public.tk_shortlist;
create policy "shortlist own" on public.tk_shortlist for all using (auth.uid() = employer_id) with check (auth.uid() = employer_id and public.tk_is_employer());

-- ---------- Introduction requests (brokered by Talents Klinik) ----------
create table if not exists public.tk_intro_requests (
  id           uuid primary key default gen_random_uuid(),
  employer_id  uuid not null references public.tk_employers(user_id) on delete cascade,
  candidate_id uuid not null references auth.users(id) on delete cascade,
  job_id       uuid references public.tk_jobs(id) on delete set null,
  message      text,
  status       text not null default 'pending' check (status in ('pending','approved','declined')),
  admin_note   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.tk_intro_requests enable row level security;
drop trigger if exists tk_intro_touch on public.tk_intro_requests;
create trigger tk_intro_touch before update on public.tk_intro_requests for each row execute function public.tk_touch();
drop policy if exists "intro employer read own or admin" on public.tk_intro_requests;
drop policy if exists "intro employer create"            on public.tk_intro_requests;
drop policy if exists "intro admin update"               on public.tk_intro_requests;
create policy "intro employer read own or admin" on public.tk_intro_requests for select using (auth.uid() = employer_id or public.tk_is_admin());
create policy "intro employer create"            on public.tk_intro_requests for insert with check (auth.uid() = employer_id and public.tk_is_employer() and status = 'pending');
create policy "intro admin update"               on public.tk_intro_requests for update using (public.tk_is_admin());

-- ---------- Anonymised candidate pool for approved employers ----------
-- Deliberately NOT security_invoker: employers have no access to tk_profiles itself,
-- so this view is the only window, and it carries no name, email or phone.
create or replace view public.tk_candidates as
select
  p.user_id                                  as candidate_id,
  upper(substr(replace(p.user_id::text,'-',''), 1, 6)) as ref,
  p.data->'profile'->>'location'             as location,
  p.data->'profile'->>'educationLevel'       as education,
  p.data->'profile'->>'course'               as course,
  p.data->'profile'->>'degreeClass'          as degree_class,
  p.data->'profile'->>'institution'          as institution,
  p.data->'profile'->>'nysc'                 as nysc_status,
  p.data->'profile'->>'qualifications'       as qualifications,
  p.data->'profile'->>'experience'           as experience,
  p.data->'profile'->>'currentRole'          as current_role,
  p.data->'profile'->>'targetRole'           as target_role,
  coalesce(p.data->'profile'->'industries', '[]'::jsonb) as industries,
  coalesce(p.data->'profile'->'skills', '[]'::jsonb)     as skills,
  (p.data->'cv'->'result'->>'score')::int    as cv_score,
  p.data->'persona'->>'label'                as persona,
  jsonb_array_length(coalesce(p.data->'certs', '[]'::jsonb)) as certificates,
  p.data->'match'->>'availability'           as availability,
  p.data->'match'->>'locations'              as preferred_locations,
  p.data->'match'->>'mode'                   as work_mode,
  p.updated_at
from public.tk_profiles p
where p.match_opt_in = true and (public.tk_is_employer() or public.tk_is_admin());
grant select on public.tk_candidates to authenticated;

-- Contact details for admins only, used when approving an introduction.
create or replace view public.tk_candidate_contacts as
select p.user_id as candidate_id, p.email,
  p.data->'profile'->>'firstName' as first_name,
  p.data->'profile'->>'lastName'  as last_name,
  p.data->'profile'->>'phone'     as phone
from public.tk_profiles p
where p.match_opt_in = true and public.tk_is_admin();
grant select on public.tk_candidate_contacts to authenticated;
