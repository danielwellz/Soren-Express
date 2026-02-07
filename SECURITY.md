# Security Pack v1

## Authentication and session model
- Access and refresh JWT tokens are used for authenticated sessions.
- Access tokens are short-lived (`JWT_ACCESS_EXPIRES_IN`), refresh tokens are longer-lived (`JWT_REFRESH_EXPIRES_IN`).
- Role-based authorization is enforced in backend guards for customer/admin boundaries.

## Rate limiting
- Auth-related throttling is controlled by `AUTH_RATE_LIMIT_WINDOW_MS` and `AUTH_RATE_LIMIT_MAX`.
- Current implementation is in-memory and intended for single-instance/local environments.
- For production-scale deployments, move to shared/distributed rate limiting storage.

## Input validation
- Nest global `ValidationPipe` is enabled.
- Whitelisting is enabled to strip unexpected fields.
- DTO validation uses `class-validator` and `class-transformer`.

## Transport and request hardening
- `helmet` security headers are enabled.
- CORS is strict outside development: only explicit origins from `CORS_ORIGIN` are allowed.
- Request body size limits are enforced via `REQUEST_BODY_LIMIT` (default: `1mb`).

## Secret management policy
- `.env` and `.env.local` must never be committed.
- Use tracked templates only (`.env.example`).
- All template values must remain placeholders (`change_me_*`).

## Scanning guidance
- Recommended: enable GitHub secret scanning for this repository.
- Optional: enable CodeQL analysis via `.github/workflows/codeql.yml`.
- Local hygiene recommendation: run `yarn check:lockfiles` before pushing.

## Reporting process (portfolio)
- Open a private issue describing impact, reproduction steps, and affected modules.
- Include only sanitized logs and redact any sensitive token/credential material.
- Acknowledge receipt, triage severity, and document remediation commits.
