#!/usr/bin/env bash
set -euo pipefail

tracked_locks="$(git ls-files | rg 'package-lock\.json$' || true)"

if [[ -n "${tracked_locks}" ]]; then
  echo "Lockfile policy violation: package-lock.json is tracked"
  echo "${tracked_locks}"
  exit 1
fi

working_tree_locks="$(rg --files | rg 'package-lock\.json$' || true)"
if [[ -n "${working_tree_locks}" ]]; then
  echo "Lockfile policy violation: package-lock.json exists in working tree"
  echo "${working_tree_locks}"
  exit 1
fi

echo "Lockfile policy OK (Yarn-only)."
