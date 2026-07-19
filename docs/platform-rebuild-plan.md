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
- Python live strategy runner for approved strategy versions

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
- Python strategy runner for finalized live model portfolio generation
- Vercel for web hosting
- scheduled runner on a controlled worker, cron host, or GitHub Actions during MVP

## Access Rule

A user can see a strategy's paywalled model portfolio when at least one condition is true:

- active paid subscription
- active manual access grant
- admin role

All access decisions should be checked server-side.
