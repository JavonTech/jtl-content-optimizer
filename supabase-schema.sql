-- ============================================================
-- Javon Technology Ltd. — Content Optimizer Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

create table if not exists public.posts (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),

  -- Post metadata
  platform         text not null,
  content_type     text not null,
  topic            text not null,
  cta_goal         text not null,
  generated_text   text not null,

  -- Engagement tracking
  posted_at        date,
  likes            integer not null default 0,
  comments         integer not null default 0,
  shares           integer not null default 0,
  clicks           integer not null default 0,
  impressions      integer not null default 0,

  -- Revenue
  kajabi_revenue   numeric(10, 2) not null default 0
);

-- ── Index for top-performer queries ──────────────────────────
create index if not exists posts_impressions_idx on public.posts (impressions desc);
create index if not exists posts_created_at_idx on public.posts (created_at desc);

-- ── Row Level Security ────────────────────────────────────────
alter table public.posts enable row level security;

-- Allow service role full access (used by API routes)
create policy "Service role full access"
  on public.posts
  for all
  to service_role
  using (true)
  with check (true);

-- Allow anon read (for client-side fetches if needed)
create policy "Anon read"
  on public.posts
  for select
  to anon
  using (true);

-- ── Optional: authenticated user access ───────────────────────
-- Uncomment if you add Supabase Auth later
-- create policy "Auth user full access"
--   on public.posts
--   for all
--   to authenticated
--   using (true)
--   with check (true);
