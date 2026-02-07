import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { describeDbConnectionError, envFilePaths, resolveRuntimeDbConfig, sanitizeDbConfig } from './config/runtime-env';
import { ENTITIES } from './entities';
import { StoreModule } from './store.module';

const dbLogger = new Logger('Database');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFilePaths(),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const db = resolveRuntimeDbConfig();
        dbLogger.log(`Resolved DB config: ${JSON.stringify(sanitizeDbConfig(db))}`);

        return {
          type: 'mariadb',
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
          entities: ENTITIES,
          synchronize: db.synchronize,
          logging: db.logging,
          retryAttempts: Number(process.env.DB_RETRY_ATTEMPTS || 10),
          retryDelay: Number(process.env.DB_RETRY_DELAY_MS || 3000),
          toRetry: (error: unknown) => {
            dbLogger.error(`TypeORM connection failed: ${describeDbConnectionError(error)}`);
            return true;
          },
        };
      },
    }),
    GraphQLModule.forRoot<YogaDriverConfig>({
      driver: YogaDriver,
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      context: ({ req, res }) => ({ req, res }),
      graphiql: true,
    }),
    StoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
