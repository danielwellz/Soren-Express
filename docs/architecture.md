# Architecture Overview

## Boundaries
- Frontend (`soren-front-end-master`): CRA + TypeScript + MUI + Apollo Client.
- Backend (`soren-back-end-origin`): NestJS + GraphQL + TypeORM + MariaDB.
- Infrastructure: local Docker Compose for API + DB orchestration.

## Module map
```mermaid
flowchart LR
  FE["Frontend (React + Apollo)"] -->|GraphQL| API["NestJS API"]
  API --> AUTH["Auth + RBAC"]
  API --> CATALOG["Catalog"]
  API --> CART["Cart"]
  API --> CHECKOUT["Checkout + Payments"]
  API --> ADMIN["Admin"]
  CHECKOUT --> INV["Inventory + Reservations"]
  CHECKOUT --> PAY["Payment intents + webhook"]
  ADMIN --> AUDIT["Admin Audit Log"]
  API --> DB[(MariaDB)]
```

## Runtime notes
- GraphQL schema is generated at `/Users/danielwellz/Work/Soren Express/soren-back-end-origin/schema.gql`.
- REST endpoint `/payments/webhook` is used for webhook-like confirmation events.
- Legacy backend trees were quarantined under `/Users/danielwellz/Work/Soren Express/legacy/backend` and excluded from runtime.
