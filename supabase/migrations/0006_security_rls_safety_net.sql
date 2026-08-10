alter table if exists public.profiles enable row level security;
alter table if exists public.strategies enable row level security;
alter table if exists public.performance_access_logs enable row level security;
alter table if exists public.disclaimer_acceptances enable row level security;
alter table if exists public.subscriptions enable row level security;
alter table if exists public.strategy_access_grants enable row level security;
alter table if exists public.payments enable row level security;
alter table if exists public.strategy_imports enable row level security;
alter table if exists public.contact_enquiries enable row level security;
alter table if exists public.strategy_prices enable row level security;
alter table if exists public.checkout_sessions enable row level security;
alter table if exists public.checkout_items enable row level security;
alter table if exists public.kyc_profiles enable row level security;
alter table if exists public.kyc_documents enable row level security;
alter table if exists public.kyc_consents enable row level security;
alter table if exists public.kyc_validation_jobs enable row level security;
alter table if exists public.kyc_audit_events enable row level security;

update storage.buckets
set public = false
where id = 'kyc-documents';
