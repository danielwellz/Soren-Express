import { existsSync } from 'fs';
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
  return {
    host: resolveDbHost(env),
    port: Number(env.DB_PORT || 3306),
    username: env.DB_USERNAME || 'root',
    password: env.DB_PASSWORD || '',
    database: env.DB_DATABASE || 'soren_store',
    synchronize: asBoolean(env.DB_SYNCHRONIZE, true),
    logging: asBoolean(env.DB_LOGGING, false),
  };
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
