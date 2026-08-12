create table if not exists public.info_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  source text not null default 'blog' check (source in ('blog', 'newsletter', 'admin')),
  starts_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.info_subscriptions enable row level security;

create policy "info subscriptions select own" on public.info_subscriptions
  for select using (auth.uid() = user_id);

create policy "info subscriptions insert own" on public.info_subscriptions
  for insert with check (auth.uid() = user_id);

create policy "info subscriptions update own" on public.info_subscriptions
  for update using (auth.uid() = user_id);
