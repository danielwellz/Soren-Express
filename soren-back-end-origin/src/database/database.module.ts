import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? 'production.config.ts'
          : 'development.config.ts',
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class DatabaseModule {}
