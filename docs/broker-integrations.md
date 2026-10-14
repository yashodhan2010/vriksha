# Broker integrations

## DhanHQ partner login

Public endpoints:

- Redirect URL: `https://www.vriksha-capital.com/api/brokers/dhan/callback`
- Postback URL: `https://www.vriksha-capital.com/api/brokers/dhan/postback?key={DHAN_POSTBACK_SECRET}`

Before enabling the integration, configure these production environment variables:

- `DHAN_PARTNER_ID` and `DHAN_PARTNER_SECRET` supplied by Dhan.
- `DHAN_POSTBACK_SECRET`, a randomly generated value shared only with Dhan as part of the postback URL.
- `BROKER_TOKEN_ENCRYPTION_KEY`, a 32-byte random key encoded with base64.

The callback exchanges Dhan's one-time `tokenId` server-side and stores the resulting access token encrypted with AES-256-GCM. It expires at Dhan's supplied `expiryTime`; Vriksha must not use it afterwards. The postback endpoint stores received order state changes but does not place, modify, or cancel orders.

## Adding another broker

Create a broker module in `web/lib/brokers/`, then add its callback and postback routes under `web/app/api/brokers/{broker}/`. Reuse the shared `broker_connections`, `broker_connect_sessions`, and `broker_order_events` tables. Every broker must use a one-time connection state, encrypted credentials, an expiry, a secret or signed webhook verification mechanism, and an audit event record.
