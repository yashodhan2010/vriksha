create table if not exists public.contact_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  source_path text,
  user_agent text,
  ip_address text,
  email_sent_at timestamptz,
  email_error text,
  status text not null default 'new' check (status in ('new', 'in_review', 'responded', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.contact_enquiries enable row level security;

