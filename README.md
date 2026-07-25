# Vriksha

Vriksha is a SEBI RA-backed strategy subscription platform.

The product is no longer a trading or broker-execution system. It is a website where users can
review public strategy research, subscribe to a strategy, and access the latest model portfolio plus
recent rebalance history behind a paywall.

## Product Scope

- Public home page
- Strategy catalog
- Strategy detail pages with methodology, backtest metrics, benchmark comparison, and disclosures
- Subscriber dashboard
- Paywalled latest model portfolio
- Paywalled last five rebalances
- Login/account module
- Razorpay subscription flow
- Admin publishing console
- Manual/internal access grants
- Versioned strategy methodology and configuration
- Python strategy package importer for validation and ingestion

## Explicitly Out Of Scope

- Broker order placement
- Zerodha/Kite login automation
- Trading on behalf of subscribers
- Client portfolio reconciliation
- Customer-specific trade recommendations

## New Architecture

```text
web/                 Next.js app for public site, dashboard, admin, and subscriptions
web/prisma/          Postgres schema for strategies, portfolios, subscriptions, and audit logs
strategy_importer/   Python package validation and ingestion helpers
docs/                Product, package contract, and operating documentation
```

The research/backtest project remains separate. Once a strategy is finalized, it exports a strategy
package containing all calculated outputs. Vriksha imports that approved package, publishes the
public research page, and gates the latest model portfolio plus recent rebalances for subscribers.
Vriksha does not calculate strategy signals, ranks, lookbacks, backtests, or live portfolios.

## Local Web Setup

```powershell
cd web
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

For local paywall demo access:

```text
DEMO_SUBSCRIBED_STRATEGIES=nifty-quality-momentum
DEMO_ADMIN=true
```

## Command Grid

Run root-level commands from:

```powershell
cd "C:\Users\Yashodhan\OneDrive\Documents\Vriksha\vriksha"
```

| Purpose | Command |
|---|---|
| Install web dependencies | `cd web; npm install` |
| Start local website | `cd web; npm run dev` |
| Typecheck website | `cd web; npm run typecheck` |
| Build website | `cd web; npm run build` |
| Validate full strategy package | `python strategy_importer\package_contract.py "C:\Users\Yashodhan\OneDrive\Documents\Algo\vrisksha-strategy-manager\data\output\packages\dual-momentum\strategy-package"` |
| Import full strategy package | `python strategy_importer\import_package.py "C:\Users\Yashodhan\OneDrive\Documents\Algo\vrisksha-strategy-manager\data\output\packages\dual-momentum\strategy-package"` |
| Import all strategy packages | `python strategy_importer\import_all_packages.py "C:\Users\Yashodhan\OneDrive\Documents\Algo\vrisksha-strategy-manager\data\output\packages" --reset` |
| Validate model portfolio update | `python strategy_importer\package_contract.py "C:\Users\Yashodhan\OneDrive\Documents\Algo\vrisksha-strategy-manager\data\output\packages\dual-momentum\model-portfolio-update" --kind update` |
| Import model portfolio update | `python strategy_importer\import_package.py "C:\Users\Yashodhan\OneDrive\Documents\Algo\vrisksha-strategy-manager\data\output\packages\dual-momentum\model-portfolio-update" --kind update` |
| Open Dual Momentum page | `Start-Process http://localhost:3000/strategies/dual-momentum` |
| Open strategy catalog | `Start-Process http://localhost:3000/strategies` |

For local subscriber-preview mode, start the dev server with:

```powershell
cd web
$env:DEMO_SUBSCRIBED_STRATEGIES="dual-momentum"
$env:DEMO_ADMIN="true"
npm run dev
```

Without `DEMO_SUBSCRIBED_STRATEGIES`, the latest model portfolio and CSV export routes stay paywalled.

## Supabase Auth & Access

Supabase is the system of record for visitor identity, performance-access logs, subscriptions,
manual grants, payments, and admin roles.

See [docs/database-auth-journey.md](docs/database-auth-journey.md) for the full visitor journey,
database model, and operating notes.

Create a Supabase project, then run the SQL in:

```text
supabase/migrations/0001_vriksha_access_model.sql
```

Set these values in `web/.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Recommended Supabase Auth settings:

```text
Site URL: http://localhost:3000
Redirect URLs:
http://localhost:3000/auth/callback
https://your-production-domain.com/auth/callback
```

Access levels:

| Level | Meaning |
|---|---|
| Public visitor | Can view catalog, methodology, compliance pages, and non-performance strategy details |
| Verified prospect | Has verified email OTP and accepted the performance acknowledgement for a one-to-one request |
| Subscriber | Has verified login plus active subscription or manual strategy access grant |
| Admin/compliance | Has `profiles.role` set to `admin`, `research_analyst`, or `compliance` |

Manual access grant example after a user has logged in once:

```sql
insert into public.strategy_access_grants (user_id, strategy_slug, reason)
values ('USER_UUID_HERE', 'dual-momentum', 'Internal/manual access');
```

Admin role example:

```sql
update public.profiles
set role = 'admin'
where email = 'you@example.com';
```

### Supabase Activation Checklist

You need a Supabase account and one Supabase project.

From the Supabase dashboard, collect:

| Value | Where it goes | Safe for browser? |
|---|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| Anon public key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |
| Service role key | `SUPABASE_SERVICE_ROLE_KEY` | No |
| Postgres connection string | `SUPABASE_DB_URL` | No |

Put these in `web/.env.local`, not in git.

```text
SUPABASE_DB_URL=postgresql://postgres.your-project-ref:YOUR-PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Never expose `SUPABASE_DB_URL` or `SUPABASE_SERVICE_ROLE_KEY` in frontend code, screenshots,
public repos, or browser environment variables.

If your database password contains special characters, URL-encode them in `SUPABASE_DB_URL`.
Common replacements are `%` -> `%25`, `#` -> `%23`, `&` -> `%26`, `@` -> `%40`, `/` -> `%2F`,
and `?` -> `%3F`. The simplest option is to reset the Supabase database password to letters and
numbers only, then update `web/.env.local`.

To create/update Supabase tables from this project after `SUPABASE_DB_URL` is set:

```powershell
cd web
npm run db:apply
```

This applies the SQL files in `supabase/migrations/` and records completed migrations in
`public.schema_migrations`.

## Contact Form Email

The contact page posts to `/api/contact`.

The server:

```text
1. Saves the enquiry in Supabase `contact_enquiries`
2. Sends a notification email to enquiry@vriksha-capital.com if Resend is configured
```

Add these Vercel and local env variables before relying on live email notifications:

```text
RESEND_API_KEY=
CONTACT_TO_EMAIL=enquiry@vriksha-capital.com
CONTACT_FROM_EMAIL=Vriksha Capital <enquiry@vriksha-capital.com>
```

`CONTACT_FROM_EMAIL` must use a domain verified in Resend.

## Strategy Package Validation

```powershell
python strategy_importer/package_contract.py path\to\strategy-package
python strategy_importer/package_contract.py path\to\model-portfolio-update --kind update
```

See [docs/strategy-package-contract.md](docs/strategy-package-contract.md) for the package format.

## Production Stack

- Next.js and TypeScript
- Supabase Auth and Postgres
- Prisma
- Razorpay Subscriptions
- Python strategy package importer
- Vercel for the web app

All paywalled portfolio access must be checked server-side using active subscription status, manual
access grants, or admin role. Calculation inside Vriksha is limited to display transforms such as
CSV parsing, chart-series building, formatting returns, sorting rows, and validating package shape.
