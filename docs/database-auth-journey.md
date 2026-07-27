# Database, Auth, and Access Journey

This document explains how Vriksha uses Supabase for visitor identity, compliance logging,
subscriptions, manual access grants, and subscriber-only strategy access.

## Do We Need Paid Supabase?

For local development and early testing, the Supabase Free plan is enough.

For a live paid website, use Supabase Pro. The free plan is useful for prototypes, but production
should have an always-on project, daily backups, higher limits, and email support.

Recommended starting stack:

```text
Vercel Pro or equivalent hosting
Supabase Pro
Razorpay
Domain and transactional email setup
```

## User Types

Vriksha has three practical access states.

| State | Meaning | What they can see |
|---|---|---|
| Public visitor | No verified identity yet | Home, catalog, compliance pages, methodology, non-performance details |
| Verified prospect | Email OTP verified and performance acknowledgement accepted | Requested strategy performance/backtest details |
| Subscriber | Verified login plus active subscription or manual grant | Model portfolio, last 5 rebalances, CSV exports |

Login is not the same as subscription. Login identifies the person. Subscription grants access to a
specific strategy.

## Visitor Journey

### 1. Public Visit

The visitor lands on the website.

They can browse:

```text
/
/strategies
/strategies/[slug]
/compliance
/investor-charter
/complaints
/audit-report
/contact
```

At this stage, the app does not know who they are.

Public pages must not reveal:

```text
latest model portfolio
last 5 rebalances
subscriber CSV exports
ungated performance details
```

### 2. Performance Request

When the visitor tries to view performance, the performance gate appears.

Flow:

```text
Visitor clicks locked performance
App asks for email
Supabase generates a one-time auth code
Vriksha sends the code using the configured transactional email sender
Visitor enters the code on Vriksha
Visitor ticks acknowledgement
App records performance_access_logs row
Performance details unlock for that session/page
```

This creates a verified prospect. It does not create a paid subscriber.

The database records:

```text
user_id
strategy_slug
acknowledgement_key
disclaimer_version
user_agent
ip_address
created_at
```

This is the audit trail for a one-to-one requested performance view.

### 3. Login

The login page uses Supabase email OTP for identity, but Vriksha sends the email through the
configured transactional email provider.

After login:

```text
auth.users contains the Supabase auth user
public.profiles contains the app profile
```

The SQL migration includes a trigger that creates `public.profiles` automatically when Supabase
creates an auth user.

### 4. Subscribe

When a logged-in user clicks subscribe:

```text
User opens /subscribe/[slug]
App checks user is logged in
User accepts required terms/disclosures
Razorpay checkout starts
Razorpay webhook confirms payment
App creates/updates subscriptions row
Subscriber access unlocks
```

Until Razorpay is wired, the button remains a placeholder and access can be granted manually.

### 5. Manual Access Grant

Manual grants are for internal users, partners, trial users, or offline-paid users.

After the user logs in at least once, run:

```sql
insert into public.strategy_access_grants (user_id, strategy_slug, reason)
values ('USER_UUID_HERE', 'dual-momentum', 'Internal/manual access');
```

Manual grant access is checked the same way as paid subscription access.

### 6. Subscriber Strategy Access

When a subscriber opens a strategy detail page, the server checks:

```text
Does user have active subscriptions row for this strategy?
OR
Does user have active strategy_access_grants row for this strategy?
OR
Is this strategy listed in DEMO_SUBSCRIBED_STRATEGIES for local dev?
```

If yes:

```text
latest model portfolio visible
last 5 rebalances visible
CSV export links work
```

If no:

```text
paywall visible
CSV API returns 403
```

## Database Tables

The first migration lives here:

```text
supabase/migrations/0001_vriksha_access_model.sql
```

Main tables:

| Table | Purpose |
|---|---|
| `profiles` | App profile and role for each Supabase auth user |
| `strategies` | Optional database record of imported strategy metadata |
| `performance_access_logs` | Audit trail for performance requests and acknowledgements |
| `disclaimer_acceptances` | General terms/disclaimer acceptance history |
| `subscriptions` | Paid or active subscription records |
| `strategy_access_grants` | Manual/internal/offline access grants |
| `payments` | Razorpay payment/order/subscription records |
| `strategy_imports` | Import audit trail for strategy packages |

## Access Rules

Sensitive strategy data must be protected server-side.

The frontend may hide or show UI, but the server must decide whether data is returned.

Protected data:

```text
latest model portfolio
rebalance history
CSV exports
subscriber dashboard data
admin publishing console actions
```

## Environment Variables

For production Supabase:

```text
SUPABASE_DB_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
AUTH_FROM_EMAIL="Vriksha Capital <enquiry@vriksha-capital.com>"
```

For local demo access without Supabase:

```text
DEMO_SUBSCRIBED_STRATEGIES=dual-momentum
DEMO_ADMIN=true
```

Do not use demo access variables in production.

`SUPABASE_DB_URL` is only needed for local migration commands. It is not used by browser code.
Keep it private.

If the DB password has special characters, URL-encode them inside `SUPABASE_DB_URL`.

```text
% becomes %25
# becomes %23
& becomes %26
@ becomes %40
/ becomes %2F
? becomes %3F
```

The easiest setup is to reset the Supabase database password to letters and numbers only.

## Supabase Dashboard Setup

In Supabase Auth settings:

```text
Site URL:
http://localhost:3000

Redirect URLs:
http://localhost:3000/auth/callback
https://your-production-domain.com/auth/callback
```

After creating the project:

```text
1. Add env values to web/.env.local
2. Add SUPABASE_DB_URL from Project Settings -> Database -> Connection string
3. Run cd web; npm run db:apply
4. Restart npm run dev
5. Test /login with your email
```

## Phone OTP Roadmap

Email OTP is the launch default. Phone OTP should be added in phases because Indian SMS cost,
deliverability, DLT compliance, and global routing can make the wrong provider expensive.

Recommended rollout:

| Phase | Auth methods | Provider direction | Why |
|---|---|---|---|
| V1 | Email OTP | Supabase email auth | Lowest cost and simplest compliance audit trail |
| V1.1 | Email OTP + Indian phone OTP | MSG91, TextLocal, or another India-first OTP provider | Much cheaper for Indian numbers than global SMS providers |
| V1.2 | Email OTP + Indian phone OTP + global phone OTP | Twilio, Vonage, or Bird for non-India routes | Better global coverage when international users matter |
| Later | WhatsApp OTP | WhatsApp Business provider/templates | Useful if SMS delivery or cost becomes painful |

Technical changes required for phone OTP:

```text
Add country-code phone input
Store phone in E.164 format, for example +919876543210
Add OTP input screen
Store mobile and mobile_verified_at in profiles
Record identity_channel as email or phone in access logs
Add OTP rate limiting and abuse protection
Test delivery for Indian mobile networks before launch
```

Recommended product rule:

```text
Phone verification can create a verified prospect.
Phone verification alone should not create a paid subscription.
Subscription remains a separate payment/manual-grant record.
```

## Production Checklist

Before going live:

```text
Supabase Pro enabled
SQL migration applied
Email OTP tested
Production redirect URL added
Manual admin role assigned
Performance acknowledgement logging tested
CSV API returns 403 for non-subscribers
Manual grant tested
Razorpay webhook implemented
Terms/disclaimer versioning finalized
```
