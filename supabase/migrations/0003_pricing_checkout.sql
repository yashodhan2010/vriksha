create table if not exists public.strategy_prices (
  id uuid primary key default gen_random_uuid(),
  strategy_slug text not null,
  billing_cycle text not null check (billing_cycle in ('monthly', 'quarterly', 'annual')),
  amount_paise integer not null check (amount_paise > 0),
  currency text not null default 'INR',
  access_days integer not null check (access_days > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (strategy_slug, billing_cycle)
);

create table if not exists public.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'created' check (status in ('created', 'payment_pending', 'paid', 'failed', 'expired', 'cancelled')),
  client_type text not null default 'individual' check (client_type in ('individual', 'huf', 'non_individual', 'accredited_investor')),
  billing_cycle text not null check (billing_cycle in ('monthly', 'quarterly', 'annual')),
  subtotal_paise integer not null,
  tax_paise integer not null default 0,
  total_paise integer not null,
  currency text not null default 'INR',
  terms_version text not null default 'v1',
  disclaimer_version text not null default 'v1',
  fee_cap_acknowledged boolean not null default false,
  terms_accepted_at timestamptz,
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.checkout_items (
  id uuid primary key default gen_random_uuid(),
  checkout_session_id uuid not null references public.checkout_sessions(id) on delete cascade,
  strategy_slug text not null,
  strategy_name text not null,
  price_id uuid references public.strategy_prices(id),
  billing_cycle text not null,
  amount_paise integer not null,
  access_days integer not null,
  created_at timestamptz not null default now()
);

alter table public.strategy_prices enable row level security;
alter table public.checkout_sessions enable row level security;
alter table public.checkout_items enable row level security;

create policy "active prices readable" on public.strategy_prices
  for select using (is_active = true);

create policy "checkout sessions select own" on public.checkout_sessions
  for select using (auth.uid() = user_id);

create policy "checkout items select own" on public.checkout_items
  for select using (
    exists (
      select 1
      from public.checkout_sessions
      where checkout_sessions.id = checkout_items.checkout_session_id
        and checkout_sessions.user_id = auth.uid()
    )
  );

insert into public.strategy_prices (strategy_slug, billing_cycle, amount_paise, access_days)
values
  ('dual-momentum', 'monthly', 499900, 30),
  ('dual-momentum', 'quarterly', 1299900, 90),
  ('dual-momentum', 'annual', 4799900, 365),
  ('conservative-dual-momentum', 'monthly', 399900, 30),
  ('conservative-dual-momentum', 'quarterly', 999900, 90),
  ('conservative-dual-momentum', 'annual', 3599900, 365),
  ('low-drawdown-dual-momentum', 'monthly', 599900, 30),
  ('low-drawdown-dual-momentum', 'quarterly', 1499900, 90),
  ('low-drawdown-dual-momentum', 'annual', 5399900, 365)
on conflict (strategy_slug, billing_cycle) do update
set amount_paise = excluded.amount_paise,
    access_days = excluded.access_days,
    is_active = true;

