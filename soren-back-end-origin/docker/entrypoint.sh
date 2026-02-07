#!/usr/bin/env bash
set -euo pipefail

log() {
  echo "[entrypoint] $1"
}

: "${DB_HOST:?DB_HOST is required}"
: "${DB_PORT:?DB_PORT is required}"
: "${DB_USERNAME:?DB_USERNAME is required}"
: "${DB_PASSWORD:?DB_PASSWORD is required}"
: "${DB_DATABASE:?DB_DATABASE is required}"

DB_ROOT_USERNAME="${DB_ROOT_USERNAME:-root}"
DB_ROOT_PASSWORD="${DB_ROOT_PASSWORD:-$DB_PASSWORD}"

log "Waiting for MariaDB at ${DB_HOST}:${DB_PORT}..."
ATTEMPTS=0
MAX_ATTEMPTS="${DB_WAIT_MAX_ATTEMPTS:-60}"

until mysqladmin ping -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_ROOT_USERNAME}" -p"${DB_ROOT_PASSWORD}" --silent; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
    log "Database not ready after ${MAX_ATTEMPTS} attempts. Exiting."
    exit 1
  fi
  sleep 2
  log "Database not ready yet (${ATTEMPTS}/${MAX_ATTEMPTS})..."
done

log "Database is ready. Ensuring database '${DB_DATABASE}' exists..."
mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_ROOT_USERNAME}" -p"${DB_ROOT_PASSWORD}" \
  -e 'CREATE DATABASE IF NOT EXISTS '"${DB_DATABASE}"' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'

if [ "${DB_USE_MIGRATIONS:-false}" = "true" ]; then
  log "DB_USE_MIGRATIONS=true, but no migration pipeline is configured in this repo. Falling back to schema sync strategy."
fi

if [ "${DB_SYNCHRONIZE:-true}" != "true" ]; then
  log "DB_SYNCHRONIZE=false and no migrations configured. Set DB_SYNCHRONIZE=true for docker boot."
  exit 1
fi

log "Running TypeORM schema sync..."
yarn db:sync:prod

if [ "${SEED_ON_BOOT:-true}" = "true" ]; then
  log "Running idempotent seed script..."
  yarn seed:prod
else
  log "SEED_ON_BOOT=false, skipping seed."
fi

log "Starting NestJS API..."
exec node dist/src/main.js
