# Pricing and Subscription Module

This module owns strategy pricing, checkout sessions, payment confirmation, and subscriber access.
Razorpay is the payment processor. Vriksha remains the system of record for what was sold and what
access was unlocked.

## V1 Scope

V1 uses fixed-period strategy access after payment.

```text
Monthly: 30 days access
Quarterly: 90 days access
Annual: 365 days access
```

Recurring Razorpay subscriptions, coupons, GST invoice numbering, automated refunds, and upgrades
are v2 features.

## User Flow

```text
User views strategy
User adds one or more strategies to basket
User opens /checkout
User selects billing cycle and client type
User accepts terms and SEBI fee-limit acknowledgement
Server recalculates pricing
Server creates checkout session
Server creates Razorpay order when keys are configured
Razorpay webhook confirms payment
Server creates per-strategy subscription rows
Subscriber access unlocks
```

Frontend basket totals are never trusted. The server recalculates from the strategy/pricing model.

## Database Tables

Migration:

```text
supabase/migrations/0003_pricing_checkout.sql
```

Tables:

| Table | Purpose |
|---|---|
| `strategy_prices` | Price per strategy and billing cycle |
| `checkout_sessions` | Basket total, terms acknowledgement, Razorpay order reference |
| `checkout_items` | Strategy-level line items inside a checkout |
| `payments` | Razorpay payment/webhook audit trail |
| `subscriptions` | Per-strategy access rows created after payment confirmation |

## Razorpay Routes

```text
POST /api/checkout/create
POST /api/razorpay/webhook
```

`/api/checkout/create` creates a checkout session and, when Razorpay keys are configured, creates a
Razorpay order.

`/api/razorpay/webhook` verifies the Razorpay webhook signature and unlocks access only after a
`payment.captured` or `order.paid` event.

## Environment Variables

```text
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

Do not expose `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET` in browser code.

## SEBI / RA Guardrails

Checkout must show and record:

```text
Fee structure
Client type
Terms acceptance
Fee-limit acknowledgement
No assurance of returns disclaimer
No trade execution by RA
Refund and termination policy acknowledgement
```

For individual and HUF clients, the module checks the placeholder annual family fee cap:

```text
INR 1,51,000 per annum per family of client
```

This cap should be reviewed with compliance/legal before public paid launch. The current module
blocks checkout when the annualized basket exceeds the cap for `individual` or `huf` client types.

The fee cap is not applied to `non_individual` or `accredited_investor` client types in this v1
model, but that should also be confirmed before launch.

## V2 Items

```text
Recurring Razorpay subscriptions
Cancellation and access-until handling
Coupon codes
GST invoice fields and invoice numbering
Refund webhooks
Admin pricing screen
Subscription email notifications
Email unsubscribe/preferences
```

