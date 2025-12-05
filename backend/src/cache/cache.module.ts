import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from './cache.service';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST');
        const redisPort = configService.get<number>('REDIS_PORT') || 6379;
        const redisPassword = configService.get<string>('REDIS_PASSWORD');
        const redisDb = configService.get<number>('REDIS_DB') || 0;

        // Only use Redis if REDIS_HOST is configured
        // Otherwise, use in-memory cache
        if (redisHost) {
          return {
            store: redisStore,
            host: redisHost,
            port: redisPort,
            password: redisPassword,
            db: redisDb,
            ttl: 300, // Default TTL: 5 minutes
          };
        }

        // Fallback to in-memory cache
        return {
          ttl: 300,
          max: 100,
        };
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}

