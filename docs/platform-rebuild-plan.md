# Vriksha Rebuild Plan

## Product Shape

Vriksha is now a subscription research platform:

- public home page
- strategy catalog
- strategy detail pages with backtests and methodology
- subscriber-only latest model portfolio
- subscriber-only last five rebalances
- login and account module
- Razorpay subscription flow
- admin import, publish, manual access grant, and audit workflows
- Python strategy package importer for approved strategy outputs

## Removed From The Active Architecture

- broker execution
- Zerodha/Kite account automation
- order placement
- customer holding reconciliation
- client-level trade recommendations
- Streamlit dashboards

## Recommended Production Stack

- Next.js and TypeScript for website, dashboard, admin, payments, and server routes
- Supabase Auth and Postgres
- Prisma for schema and typed database access
- Razorpay Subscriptions for India-first payments
- Python importer for validating finalized strategy packages
- Vercel for web hosting
- scheduled import jobs only if the strategy project drops approved output packages automatically

## Access Rule

A user can see a strategy's paywalled model portfolio when at least one condition is true:

- active paid subscription
- active manual access grant
- admin role

All access decisions should be checked server-side.

## Calculation Boundary

The strategy project owns:

- signals
- ranks
- lookback logic
- backtests
- latest model portfolio generation
- rebalance history generation

Vriksha owns:

- package validation
- CSV/JSON parsing
- chart data shaping
- display formatting
- public/private access control
- publishing workflow
