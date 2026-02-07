import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { loadRuntimeEnvFiles } from './config/runtime-env';

async function bootstrap() {
  const loadedEnvFiles = loadRuntimeEnvFiles();
  // eslint-disable-next-line no-console
  console.log(`[bootstrap] Loaded env files: ${loadedEnvFiles.join(', ') || 'none'}`);

  const app = await NestFactory.create(AppModule);
  const isProduction = process.env.NODE_ENV === 'production';
  const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const requestBodyLimit = process.env.REQUEST_BODY_LIMIT || '1mb';

  app.use(helmet());
  app.use(json({ limit: requestBodyLimit }));
  app.use(urlencoded({ extended: true, limit: requestBodyLimit }));

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || !isProduction) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS'), false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );

  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Soren Store API running on http://localhost:${port}/graphql`);
}

bootstrap();
