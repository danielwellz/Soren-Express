import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export type RuntimeDbConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
};

type DbEnvKey =
  | 'DB_DATABASE'
  | 'DB_NAME'
  | 'TYPEORM_DATABASE'
  | 'DB_USERNAME'
  | 'DB_USER'
  | 'TYPEORM_USERNAME'
  | 'DB_PASSWORD'
  | 'MYSQL_PASSWORD'
  | 'TYPEORM_PASSWORD';

const DB_DATABASE_KEYS: DbEnvKey[] = ['DB_DATABASE', 'DB_NAME', 'TYPEORM_DATABASE'];
const DB_USERNAME_KEYS: DbEnvKey[] = ['DB_USERNAME', 'DB_USER', 'TYPEORM_USERNAME'];
const DB_PASSWORD_KEYS: DbEnvKey[] = ['DB_PASSWORD', 'MYSQL_PASSWORD', 'TYPEORM_PASSWORD'];

type RuntimeDbResolution = {
  database: { key: string; value: string };
  username: { key: string; value: string };
  password: { key: string; value: string };
};

function asBoolean(value: string | undefined, fallback: boolean): boolean {
  if (typeof value !== 'string') {
    return fallback;
  }
  return value.toLowerCase() === 'true';
}

export function envFilePaths(cwd: string = process.cwd()): string[] {
  return [
    join(cwd, '.env.local'),
    join(cwd, '.env'),
    join(cwd, '..', '.env.local'),
    join(cwd, '..', '.env'),
  ];
}

function normalizeEnvValue(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function loadRuntimeEnvFiles(cwd: string = process.cwd(), env: NodeJS.ProcessEnv = process.env): string[] {
  const loadedFiles: string[] = [];

  for (const filePath of envFilePaths(cwd)) {
    if (!existsSync(filePath)) {
      continue;
    }

    const content = readFileSync(filePath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex <= 0) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      if (!key || env[key] !== undefined) {
        continue;
      }

      const rawValue = trimmed.slice(separatorIndex + 1);
      env[key] = normalizeEnvValue(rawValue);
    }

    loadedFiles.push(filePath);
  }

  return loadedFiles;
}

function resolveAliasValue(
  env: NodeJS.ProcessEnv,
  keys: string[],
  fallbackKey: string,
  fallbackValue: string,
): { key: string; value: string } {
  for (const key of keys) {
    const value = env[key];
    if (typeof value === 'string' && value.length > 0) {
      return { key, value };
    }
  }

  return { key: fallbackKey, value: fallbackValue };
}

function resolveRuntimeDbAliases(env: NodeJS.ProcessEnv = process.env): RuntimeDbResolution {
  return {
    database: resolveAliasValue(env, DB_DATABASE_KEYS, 'default(database)', 'soren_store'),
    username: resolveAliasValue(env, DB_USERNAME_KEYS, 'default(username)', 'root'),
    password: resolveAliasValue(env, DB_PASSWORD_KEYS, 'default(password)', ''),
  };
}

export function isRunningInsideDocker(env: NodeJS.ProcessEnv = process.env): boolean {
  if (asBoolean(env.RUNNING_IN_DOCKER, false)) {
    return true;
  }
  if (asBoolean(env.DOCKER, false)) {
    return true;
  }
  if (asBoolean(env.CONTAINER, false)) {
    return true;
  }
  return existsSync('/.dockerenv');
}

function resolveDbHost(env: NodeJS.ProcessEnv = process.env): string {
  const configuredHost = env.DB_HOST?.trim();
  const forceConfiguredHost = asBoolean(env.DB_HOST_FORCE, false);
  const inDocker = isRunningInsideDocker(env);
  const isProduction = env.NODE_ENV === 'production';

  if (isProduction || inDocker) {
    return configuredHost || 'db';
  }

  if (configuredHost && (configuredHost.toLowerCase() !== 'db' || forceConfiguredHost)) {
    return configuredHost;
  }

  return 'localhost';
}

export function resolveRuntimeDbConfig(env: NodeJS.ProcessEnv = process.env): RuntimeDbConfig {
  const aliases = resolveRuntimeDbAliases(env);

  return {
    host: resolveDbHost(env),
    port: Number(env.DB_PORT || 3306),
    username: aliases.username.value,
    password: aliases.password.value,
    database: aliases.database.value,
    synchronize: asBoolean(env.DB_SYNCHRONIZE, true),
    logging: asBoolean(env.DB_LOGGING, false),
  };
}

export function resolveRuntimeDbConfigSources(env: NodeJS.ProcessEnv = process.env): Record<string, string> {
  const aliases = resolveRuntimeDbAliases(env);
  return {
    host: env.DB_HOST ? 'DB_HOST' : 'resolved(default host policy)',
    port: env.DB_PORT ? 'DB_PORT' : 'default(3306)',
    database: aliases.database.key,
    username: aliases.username.key,
    password: aliases.password.key,
  };
}

function hasDefinedValue(env: NodeJS.ProcessEnv, keys: string[]): boolean {
  return keys.some((key) => typeof env[key] === 'string' && env[key]!.length > 0);
}

export function resolveRuntimeDbRequiredKeyPresence(env: NodeJS.ProcessEnv = process.env): Record<string, boolean> {
  return {
    host: Boolean(env.DB_HOST),
    port: Boolean(env.DB_PORT),
    database: hasDefinedValue(env, DB_DATABASE_KEYS),
    username: hasDefinedValue(env, DB_USERNAME_KEYS),
    password: hasDefinedValue(env, DB_PASSWORD_KEYS),
  };
}

export function missingRuntimeDbKeys(env: NodeJS.ProcessEnv = process.env): string[] {
  const missing: string[] = [];

  if (!env.DB_HOST) {
    missing.push('DB_HOST');
  }
  if (!env.DB_PORT) {
    missing.push('DB_PORT');
  }
  if (!hasDefinedValue(env, DB_DATABASE_KEYS)) {
    missing.push('DB_DATABASE|DB_NAME|TYPEORM_DATABASE');
  }
  if (!hasDefinedValue(env, DB_USERNAME_KEYS)) {
    missing.push('DB_USERNAME|DB_USER|TYPEORM_USERNAME');
  }
  if (!hasDefinedValue(env, DB_PASSWORD_KEYS)) {
    missing.push('DB_PASSWORD|MYSQL_PASSWORD|TYPEORM_PASSWORD');
  }

  return missing;
}

export function assertRequiredRuntimeDbKeys(env: NodeJS.ProcessEnv = process.env): void {
  const missing = missingRuntimeDbKeys(env);
  if (missing.length > 0) {
    throw new Error(`Missing required DB environment keys: ${missing.join(', ')}`);
  }
}

export function sanitizeDbConfig(config: RuntimeDbConfig): Omit<RuntimeDbConfig, 'password'> & { passwordSet: boolean } {
  const { password, ...rest } = config;
  return {
    ...rest,
    passwordSet: Boolean(password),
  };
}

function flattenErrors(error: unknown, output: Error[] = []): Error[] {
  if (!error) {
    return output;
  }

  if (error instanceof Error) {
    output.push(error);
    const maybeAggregate = error as Error & { errors?: unknown[]; cause?: unknown };
    if (Array.isArray(maybeAggregate.errors)) {
      maybeAggregate.errors.forEach((item) => flattenErrors(item, output));
    }
    if (maybeAggregate.cause) {
      flattenErrors(maybeAggregate.cause, output);
    }
    return output;
  }

  output.push(new Error(String(error)));
  return output;
}

export function describeDbConnectionError(error: unknown): string {
  const all = flattenErrors(error);
  const target = all.find((item) => {
    const details = item as Error & {
      code?: string;
      errno?: number;
      sqlState?: string;
      sqlMessage?: string;
    };
    return Boolean(details.code || details.errno || details.sqlState || details.sqlMessage);
  }) || all[0];

  if (!target) {
    return 'unknown connection error';
  }

  const details = target as Error & {
    code?: string;
    errno?: number;
    sqlState?: string;
    sqlMessage?: string;
  };

  const parts = [
    details.name,
    details.code ? `code=${details.code}` : undefined,
    details.errno !== undefined ? `errno=${details.errno}` : undefined,
    details.sqlState ? `sqlState=${details.sqlState}` : undefined,
    details.sqlMessage ? `sqlMessage=${details.sqlMessage}` : undefined,
    details.message ? `message=${details.message}` : undefined,
  ].filter(Boolean);

  return parts.join(' | ');
}

function redactSqlParameters(parameters: unknown): unknown {
  if (!Array.isArray(parameters)) {
    return parameters;
  }

  return parameters.map((value) => {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (
        lower.includes('password') ||
        lower.includes('secret') ||
        lower.includes('token') ||
        lower.includes('authorization') ||
        lower.includes('bearer')
      ) {
        return '[REDACTED]';
      }
      if (value.length > 120) {
        return `${value.slice(0, 117)}...`;
      }
      return value;
    }

    return '[UNSERIALIZABLE]';
  });
}

export function describeDbQueryError(error: unknown): string {
  const details = error as Error & {
    code?: string;
    errno?: number;
    sqlState?: string;
    sqlMessage?: string;
    query?: string;
    parameters?: unknown[];
    message?: string;
  };

  const parts = [
    details.name,
    details.code ? `code=${details.code}` : undefined,
    details.errno !== undefined ? `errno=${details.errno}` : undefined,
    details.sqlState ? `sqlState=${details.sqlState}` : undefined,
    details.sqlMessage ? `sqlMessage=${details.sqlMessage}` : undefined,
    details.query ? `query=${details.query}` : undefined,
    details.parameters ? `parameters=${JSON.stringify(redactSqlParameters(details.parameters))}` : undefined,
    details.message ? `message=${details.message}` : undefined,
  ].filter(Boolean);

  return parts.join(' | ');
}
