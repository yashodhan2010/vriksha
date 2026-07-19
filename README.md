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
- Python live strategy runner for approved model portfolio generation

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
strategy_runner/     Python boundary for approved live model portfolio generation
docs/                Product, package contract, and operating documentation
legacy_trading_platform/ Preserved old broker/execution implementation for reference
```

The research/backtest project remains separate. Once a strategy is finalized, it exports a strategy
package and optional runnable strategy module. Vriksha imports that approved package, publishes the
public research page, and can run the approved live rebalance logic.

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
python strategy_runner/package_contract.py path\to\strategy-package
```

See [docs/strategy-package-contract.md](docs/strategy-package-contract.md) for the package format.

## Production Stack

- Next.js and TypeScript
- Supabase Auth and Postgres
- Prisma
- Razorpay Subscriptions
- Python strategy runner
- Vercel for the web app

All paywalled portfolio access must be checked server-side using active subscription status, manual
access grants, or admin role.
