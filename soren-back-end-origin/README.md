# Soren Store Backend

NestJS GraphQL API for the Soren portfolio e-commerce app.

## Stack
- NestJS + TypeScript
- GraphQL (code-first)
- TypeORM + MariaDB
- JWT auth (access + refresh)

## Run
```bash
yarn install
cp .env.example .env.local
yarn seed
yarn start:dev
```

## DB host resolution
- Local process mode (`yarn start:dev`): defaults to `DB_HOST=localhost`.
- Docker/runtime production mode (`NODE_ENV=production` or inside container): defaults to `DB_HOST=db`.
- If local mode needs a literal `db` host alias, set `DB_HOST_FORCE=true`.

The backend loads env files in this order:
1. `soren-back-end-origin/.env.local`
2. `soren-back-end-origin/.env`
3. workspace root `.env.local`
4. workspace root `.env`

Startup logs print sanitized DB settings and connection error details (`ENOTFOUND`, `ECONNREFUSED`, access denied, etc.).

## Verify
```bash
yarn test
yarn build
```

DB connectivity checks:
```bash
mysqladmin ping -h 127.0.0.1 -P 3306 -u soren -psoren_password
yarn start:dev
```

## Notes
- Local dev uses `DB_SYNCHRONIZE=true` + seed strategy.
- Optional DB e2e checkout test:
  - `RUN_DB_E2E=true yarn test:e2e`

See workspace docs:
- `/Users/danielwellz/Work/Soren Express/README.md`
