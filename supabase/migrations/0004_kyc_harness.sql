create table if not exists public.kyc_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_type text not null check (client_type in ('individual', 'huf', 'non_individual', 'accredited_investor')),
  full_name text not null,
  pan_last4 text not null,
  pan_hash text not null,
  dob date not null,
  mobile text not null,
  email text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  family_group_name text,
  dependent_family_declaration boolean not null default false,
  status text not null default 'submitted' check (
    status in (
      'not_started',
      'submitted',
      'queued_for_validation',
      'ocr_processing',
      'auto_verified',
      'manual_review_required',
      'verified',
      'rejected',
      'needs_resubmission',
      'expired'
    )
  ),
  source text not null default 'manual_upload' check (source in ('manual_upload', 'ocr', 'hitl', 'kra', 'ckyc', 'digilocker', 'vendor')),
  kra_status text,
  ckyc_number text,
  submitted_at timestamptz not null default now(),
  verified_at timestamptz,
  expires_at timestamptz,
  reviewed_by uuid references auth.users(id),
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kyc_documents (
  id uuid primary key default gen_random_uuid(),
  kyc_profile_id uuid not null references public.kyc_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null check (document_type in ('pan', 'address_proof', 'photo', 'signature', 'other')),
  source text not null default 'manual_upload' check (source in ('manual_upload', 'digilocker', 'kra', 'ckyc', 'vendor')),
  storage_bucket text,
  storage_path text,
  original_filename text,
  file_sha256 text,
  mime_type text,
  size_bytes integer,
  extracted_fields jsonb not null default '{}'::jsonb,
  match_scores jsonb not null default '{}'::jsonb,
  ocr_confidence numeric(5, 2),
  status text not null default 'uploaded' check (
    status in ('uploaded', 'queued', 'processing', 'passed', 'manual_review_required', 'rejected', 'needs_resubmission')
  ),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kyc_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kyc_profile_id uuid not null references public.kyc_profiles(id) on delete cascade,
  privacy_policy_version text not null,
  terms_version text not null,
  mitc_version text not null,
  kyc_consent_version text not null,
  ip_address text,
  user_agent text,
  accepted_at timestamptz not null default now()
);

create table if not exists public.kyc_validation_jobs (
  id uuid primary key default gen_random_uuid(),
  kyc_profile_id uuid not null references public.kyc_profiles(id) on delete cascade,
  document_id uuid references public.kyc_documents(id) on delete cascade,
  source text not null default 'ocr' check (source in ('ocr', 'kra', 'ckyc', 'digilocker', 'vendor')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  attempts integer not null default 0,
  locked_at timestamptz,
  locked_by text,
  error_message text,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kyc_audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  kyc_profile_id uuid references public.kyc_profiles(id) on delete cascade,
  document_id uuid references public.kyc_documents(id) on delete set null,
  event_type text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.kyc_profiles enable row level security;
alter table public.kyc_documents enable row level security;
alter table public.kyc_consents enable row level security;
alter table public.kyc_validation_jobs enable row level security;
alter table public.kyc_audit_events enable row level security;

create policy "kyc profiles select own" on public.kyc_profiles
  for select using (auth.uid() = user_id);

create policy "kyc documents select own" on public.kyc_documents
  for select using (auth.uid() = user_id);

create policy "kyc consents select own" on public.kyc_consents
  for select using (auth.uid() = user_id);

create policy "kyc audit events select own" on public.kyc_audit_events
  for select using (auth.uid() = user_id);

create index if not exists idx_kyc_profiles_user_status on public.kyc_profiles(user_id, status);
create index if not exists idx_kyc_profiles_pan_hash on public.kyc_profiles(pan_hash);
create index if not exists idx_kyc_documents_profile on public.kyc_documents(kyc_profile_id);
create index if not exists idx_kyc_jobs_status_created on public.kyc_validation_jobs(status, created_at);
create index if not exists idx_kyc_audit_profile_created on public.kyc_audit_events(kyc_profile_id, created_at);

alter table public.checkout_sessions
  add column if not exists kyc_profile_id uuid references public.kyc_profiles(id),
  add column if not exists kyc_verified_at timestamptz,
  add column if not exists mitc_version text not null default 'v1',
  add column if not exists fee_cap_snapshot jsonb not null default '{}'::jsonb;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kyc-documents',
  'kyc-documents',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
