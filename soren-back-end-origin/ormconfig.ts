import { ConnectionOptions } from 'typeorm';
import { assertRequiredRuntimeDbKeys, loadRuntimeEnvFiles, resolveRuntimeDbConfig } from './src/config/runtime-env';
import { ENTITIES } from './src/entities';

loadRuntimeEnvFiles();
assertRequiredRuntimeDbKeys();

const db = resolveRuntimeDbConfig();

const ormConfig: ConnectionOptions = {
  type: 'mariadb',
  host: db.host,
  port: db.port,
  username: db.username,
  password: db.password,
  database: db.database,
  entities: ENTITIES,
  synchronize: db.synchronize,
  logging: db.logging,
};

export = ormConfig;
