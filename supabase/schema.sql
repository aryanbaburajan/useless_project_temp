-- Run in the Supabase SQL editor. The service-role key used by the server bypasses RLS.
create extension if not exists "pgcrypto";
create table if not exists public.tracks (
 id uuid primary key default gen_random_uuid(), title text not null check (char_length(title) between 1 and 100),
 description text not null, cover_image_url text, route jsonb not null default '[]'::jsonb,
 start_gate jsonb not null, checkpoints jsonb not null, status text not null default 'draft' check (status in ('draft','published','archived')),
 published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.runs (
 id uuid primary key default gen_random_uuid(), track_id uuid not null references public.tracks(id) on delete cascade,
 display_name text not null check (char_length(display_name) between 1 and 32), elapsed_ms integer not null check (elapsed_ms > 0),
 accuracy_m real not null, max_speed_mps real not null, gate_sequence jsonb not null, created_at timestamptz not null default now()
);
alter table public.tracks enable row level security; alter table public.runs enable row level security;
create policy "published track reads" on public.tracks for select using (status='published');
create policy "leaderboard reads" on public.runs for select using (exists(select 1 from public.tracks t where t.id=track_id and t.status='published'));
create index if not exists runs_track_time_idx on public.runs(track_id,elapsed_ms);
