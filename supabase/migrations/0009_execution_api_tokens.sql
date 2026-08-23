create table if not exists public.execution_api_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  scopes text[] not null default '{}',
  expires_at timestamptz not null,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.execution_api_tokens enable row level security;

create index if not exists idx_execution_api_tokens_hash
  on public.execution_api_tokens(token_hash);

create index if not exists idx_execution_api_tokens_user_expires
  on public.execution_api_tokens(user_id, expires_at);

