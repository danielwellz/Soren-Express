import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { describeDbConnectionError, resolveRuntimeDbConfig, sanitizeDbConfig } from '../config/runtime-env';
import { ENTITIES } from '../entities';

async function syncSchema(): Promise<void> {
  const db = resolveRuntimeDbConfig();
  const synchronizeEnabled = db.synchronize;

  if (!synchronizeEnabled) {
    // eslint-disable-next-line no-console
    console.log('[db:sync] DB_SYNCHRONIZE=false, skipping schema sync.');
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`[db:sync] Using DB config: ${JSON.stringify(sanitizeDbConfig(db))}`);

  const connection = await createConnection({
    type: 'mariadb',
    host: db.host,
    port: db.port,
    username: db.username,
    password: db.password,
    database: db.database,
    synchronize: true,
    logging: db.logging,
    entities: ENTITIES,
  });

  try {
    // eslint-disable-next-line no-console
    console.log('[db:sync] Schema synchronization complete.');
  } finally {
    await connection.close();
  }
}

syncSchema().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[db:sync] Failed:', describeDbConnectionError(error));
  process.exit(1);
});
