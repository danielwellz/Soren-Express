# Soren Express Store (Portfolio Build)

A full-stack e-commerce demo built for portfolio use:
- Frontend: React + TypeScript + React Router + MUI + Apollo Client
- Backend: NestJS + TypeScript + GraphQL (code-first) + TypeORM + MariaDB

This build includes complete browsing, product detail, cart, checkout, account history, admin dashboard, fake payments, mock notifications, and analytics events.

## Features

### Storefront
- Home page with hero, categories, featured products
- Product catalog with search, filtering, sorting, pagination
- Product details with gallery, variant selection, stock visibility
- Reviews with moderation workflow
- Cart management (guest + logged-in) with server persistence
- Checkout flow with shipping/tax preview, coupon support, and order confirmation

### Auth & Account
- Register, login, token refresh, `me`
- JWT access/refresh token handling
- Role support: `CUSTOMER`, `ADMIN`
- Account profile + order history + order details

### Admin
- Dashboard metrics + analytics event feed
- CRUD-like management for categories, brands, products, variants, coupons
- Inventory updates
- User role management
- Order status management

### Demo/Portfolio mode
- Fake payment provider (`FAKEPAY`) with Stripe-like intent + confirm flow
- Local dev mailer (logs + DB notification records)
- Mock SMS provider (enabled only with env flag)

## Screenshots (placeholders)
- `docs/screenshots/home.png`
- `docs/screenshots/products.png`
- `docs/screenshots/product-detail.png`
- `docs/screenshots/checkout.png`
- `docs/screenshots/admin.png`

## Project structure
- `/Users/danielwellz/Work/Soren Express/soren-front-end-master`
- `/Users/danielwellz/Work/Soren Express/soren-back-end-origin`

## Git hygiene
- Generated artifacts are ignored at the repo root (`dist`, `build`, `output`, `coverage`, Playwright reports, logs, editor junk).
- Secret-bearing env files (`.env`, `.env.*`) are ignored. Only template files like `.env.example` stay tracked.
- Dependency/vendor directories (`node_modules`) are ignored to keep commits deterministic and reviewable.

## Run with Docker
```bash
cp .env.example .env
docker compose up --build
```
GraphQL endpoint: `http://localhost:3000/graphql`

Notes:
- In Docker/service networking, API uses `DB_HOST=db` automatically.
- You do not need to manually edit `DB_HOST` for Docker.

## Quick start

### 1) Backend env
```bash
cd /Users/danielwellz/Work/Soren\ Express/soren-back-end-origin
cp .env.example .env.local
```

Required defaults in `.env.local`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=soren
DB_PASSWORD=soren_password
DB_DATABASE=soren_store
DB_SYNCHRONIZE=true
JWT_ACCESS_SECRET=dev-access-secret
JWT_REFRESH_SECRET=dev-refresh-secret
SMS_PROVIDER_ENABLED=false
```

Local mode host strategy:
- `yarn start:dev` (local process) defaults to `DB_HOST=localhost`.
- If backend runs inside Docker or `NODE_ENV=production`, host resolves to `db`.
- Optional override for local host alias `db`: set `DB_HOST_FORCE=true`.

### 2) Install deps
```bash
cd /Users/danielwellz/Work/Soren\ Express/soren-back-end-origin && yarn install
cd /Users/danielwellz/Work/Soren\ Express/soren-front-end-master && yarn install
```

### 3) Seed DB
```bash
cd /Users/danielwellz/Work/Soren\ Express/soren-back-end-origin
yarn seed
```
`seed`/`db:sync`/bootstrap now load `.env.local` and `.env` automatically (without overriding pre-set shell env vars), so local scripts resolve DB credentials consistently.

### 4) Run apps
Option A (separate terminals):
```bash
cd /Users/danielwellz/Work/Soren\ Express/soren-back-end-origin && yarn start:dev
cd /Users/danielwellz/Work/Soren\ Express/soren-front-end-master && yarn start
```

Option B (workspace root helper):
```bash
cd /Users/danielwellz/Work/Soren\ Express
npm run dev
```

Frontend defaults to `http://localhost:3000/graphql` for API.
If needed, set `REACT_APP_GRAPHQL_URL` in frontend env.

### Local backend + Docker DB (no env swapping)
```bash
cd /Users/danielwellz/Work/Soren\ Express
docker compose up -d db

cd /Users/danielwellz/Work/Soren\ Express/soren-back-end-origin
yarn start:dev
```
Expected startup log includes resolved DB host as `localhost` in local mode.

### Connectivity checks
```bash
# 1) DB listens on localhost
mysqladmin ping -h 127.0.0.1 -P 3306 -u soren -psoren_password

# 2) API can query DB (watch backend logs for "Resolved DB config")
cd /Users/danielwellz/Work/Soren\ Express/soren-back-end-origin
yarn start:dev

# 3) Docker API mode uses service host "db"
cd /Users/danielwellz/Work/Soren\ Express
docker compose up --build
```

## Seeded accounts
- Admin:
  - Email: `admin@soren.store`
  - Password: `Admin123!`
- Customer:
  - Email: `customer@soren.store`
  - Password: `Customer123!`

## Testing

### Backend
```bash
cd /Users/danielwellz/Work/Soren\ Express/soren-back-end-origin
yarn test
yarn build
```

Optional DB-backed e2e checkout test:
```bash
cd /Users/danielwellz/Work/Soren\ Express/soren-back-end-origin
RUN_DB_E2E=true yarn test:e2e
```

### Frontend
```bash
cd /Users/danielwellz/Work/Soren\ Express/soren-front-end-master
yarn test --watchAll=false
yarn build
```

Note:
- `soren-front-end-master/.env.production` intentionally sets `GENERATE_SOURCEMAP=false` to avoid third-party sourcemap parse warnings (for example from `stylis-plugin-rtl`) during production builds.
- Development sourcemaps remain enabled.

## DB strategy
This project uses a reliable **TypeORM synchronize + deterministic seed** strategy for local development:
- `DB_SYNCHRONIZE=true` in development
- `yarn seed` repopulates baseline admin/catalog/rules/coupons/reviews

For production, switch `DB_SYNCHRONIZE=false` and add formal migrations.

### Docker DB strategy
- This repo currently has no TypeORM migration files under `soren-back-end-origin/src/migrations`.
- Docker startup uses deterministic schema sync (`yarn db:sync:prod`) and idempotent seed (`yarn seed:prod`) from `soren-back-end-origin/docker/entrypoint.sh`.

## Demo mode details
- Payments: fake provider only, no real transactions
- Emails: local logger + `notification_logs` table
- SMS: mock by default; optional provider toggle via `SMS_PROVIDER_ENABLED=true`
