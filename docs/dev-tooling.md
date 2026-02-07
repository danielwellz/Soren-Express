# Development Tooling

## Runtime versions
- Node.js: 18+ recommended
- Yarn: v1.x (`yarn --version` should be 1.x)

## Package manager policy
- This repository is Yarn-first for both frontend and backend.
- Commit `yarn.lock` files only.
- Do not commit `package-lock.json`.

## Common commands
From `/Users/danielwellz/Work/Soren Express`:

```bash
# backend
cd soren-back-end-origin
yarn install
yarn build
yarn test --runInBand

# frontend
cd ../soren-front-end-master
yarn install
CI=true yarn test --watchAll=false
yarn build
```

## Lockfile guard
Run from repo root:

```bash
yarn check:lockfiles
```

This fails if any `package-lock.json` is tracked or newly introduced.
