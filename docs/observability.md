# Observability Notes

## Current logging
- Checkout status transitions include correlation ids (`[cid:...]`) in service logs.
- Reservation lifecycle logs include reserve/commit/release events with correlation ids.
- Backend startup logs loaded env files and sanitized DB connection config.

## Sensitive data handling
- Admin audit logs sanitize sensitive keys (`password`, `token`, `secret`) in before/after payload snapshots.
- Security docs require never logging raw credentials or tokens.

## What to measure next
- API latency and error rates by route/resolver.
- Checkout funnel conversion (`begin_checkout`, `intent_created`, `payment_confirmed`).
- Reservation metrics: active holds, expirations, commit/release counts.
- Payment reliability: idempotency replay counts and webhook retries.

## Suggested instrumentation targets
- Add structured logs (JSON) with fields: `timestamp`, `level`, `correlationId`, `userId`, `route`, `operation`, `outcome`.
- Add metrics counters/timers for checkout and admin mutation paths.
- Add tracing around DB-heavy checkout + admin operations.
