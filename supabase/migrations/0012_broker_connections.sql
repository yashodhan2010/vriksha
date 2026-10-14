create table if not exists public.broker_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  broker text not null,
  broker_client_id text not null,
  broker_client_name text,
  broker_client_ucc text,
  access_token_ciphertext text not null,
  token_expires_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'expired', 'revoked')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, broker)
);

create index if not exists idx_broker_connections_broker_client
  on public.broker_connections (broker, broker_client_id);

create table if not exists public.broker_connect_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  broker text not null,
  state_hash text not null unique,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_broker_connect_sessions_lookup
  on public.broker_connect_sessions (broker, state_hash, expires_at);

create table if not exists public.broker_order_events (
  id uuid primary key default gen_random_uuid(),
  broker_connection_id uuid not null references public.broker_connections(id) on delete cascade,
  broker_order_id text not null,
  correlation_id text,
  order_status text,
  event_at timestamptz,
  raw_event jsonb not null,
  received_at timestamptz not null default now(),
  unique (broker_connection_id, broker_order_id, order_status, event_at)
);

create index if not exists idx_broker_order_events_connection_received
  on public.broker_order_events (broker_connection_id, received_at desc);

alter table public.broker_connections enable row level security;
alter table public.broker_connect_sessions enable row level security;
alter table public.broker_order_events enable row level security;
