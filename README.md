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
