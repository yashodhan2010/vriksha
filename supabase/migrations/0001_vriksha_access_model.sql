create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  mobile text,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin', 'research_analyst', 'compliance')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.strategies (
  slug text primary key,
  name text not null,
  status text not null default 'draft',
  imported_at timestamptz,
  package_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.performance_access_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  strategy_slug text,
  acknowledgement_key text not null,
  disclaimer_version text not null,
  user_agent text,
  ip_address text,
  created_at timestamptz not null default now()
);

create table if not exists public.disclaimer_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  context text not null,
  strategy_slug text,
  disclaimer_version text not null,
  accepted_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  strategy_slug text not null,
  status text not null check (status in ('trialing', 'active', 'past_due', 'cancelled', 'expired')),
  source text not null default 'razorpay' check (source in ('razorpay', 'manual', 'internal')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.strategy_access_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  strategy_slug text not null,
  reason text,
  granted_by uuid references auth.users(id),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  strategy_slug text,
  provider text not null default 'razorpay',
  provider_order_id text,
  provider_payment_id text,
  provider_subscription_id text,
  amount_in_paise integer,
  currency text not null default 'INR',
  status text not null,
  raw_event jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.strategy_imports (
  id uuid primary key default gen_random_uuid(),
  strategy_slug text not null,
  package_path text,
  package_checksum text,
  imported_by uuid references auth.users(id),
  imported_at timestamptz not null default now()
);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, mobile, full_name)
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

alter table public.profiles enable row level security;
alter table public.performance_access_logs enable row level security;
alter table public.disclaimer_acceptances enable row level security;
alter table public.subscriptions enable row level security;
alter table public.strategy_access_grants enable row level security;
alter table public.payments enable row level security;
alter table public.strategy_imports enable row level security;
alter table public.strategies enable row level security;

create policy "profiles select own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id);

create policy "performance logs insert own" on public.performance_access_logs
  for insert with check (auth.uid() = user_id);

create policy "performance logs select own" on public.performance_access_logs
  for select using (auth.uid() = user_id);

create policy "disclaimer acceptances insert own" on public.disclaimer_acceptances
  for insert with check (auth.uid() = user_id);

create policy "subscriptions select own" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "access grants select own" on public.strategy_access_grants
  for select using (auth.uid() = user_id);

create policy "payments select own" on public.payments
  for select using (auth.uid() = user_id);

create policy "published strategies readable" on public.strategies
  for select using (status = 'published');
