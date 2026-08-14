create table if not exists public.rebalance_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  strategy_slug text not null,
  rebalance_date date not null,
  reviewed_change_ids text[] not null default '{}',
  visited_views text[] not null default '{}',
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, strategy_slug, rebalance_date)
);

alter table public.rebalance_reviews enable row level security;

create policy "rebalance reviews select own" on public.rebalance_reviews
  for select using (auth.uid() = user_id);

create policy "rebalance reviews insert own" on public.rebalance_reviews
  for insert with check (auth.uid() = user_id);

create policy "rebalance reviews update own" on public.rebalance_reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_rebalance_reviews_user_strategy
  on public.rebalance_reviews(user_id, strategy_slug, rebalance_date);

