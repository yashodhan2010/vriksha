alter table public.checkout_sessions
  add column if not exists cashfree_order_id text,
  add column if not exists cashfree_payment_id text;

create index if not exists idx_checkout_sessions_cashfree_order_id
  on public.checkout_sessions(cashfree_order_id);

alter table public.subscriptions
  drop constraint if exists subscriptions_source_check;

alter table public.subscriptions
  add constraint subscriptions_source_check
  check (source in ('razorpay', 'cashfree', 'manual', 'internal'));
