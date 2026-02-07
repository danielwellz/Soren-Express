# Backend Legacy Quarantine

This folder archives legacy Nest module trees that are intentionally excluded from the active runtime.

Archived paths were moved from `soren-back-end-origin/src` to reduce conceptual and schema drift risk:
- `product/`
- `user/`
- `order/`
- `transaction/`
- `common/common-types.ts`
- legacy `src/schema.gql`

Canonical backend runtime now uses:
- active modules under `soren-back-end-origin/src/*`
- canonical GraphQL schema file at `soren-back-end-origin/schema.gql`
- entities from `soren-back-end-origin/src/entities`

Do not import from `legacy/` in runtime code.
