import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        const password = configService.get<string>('DATABASE_PASSWORD') || (isProduction ? undefined : 'postgres');
        
        if (!password && isProduction) {
          throw new Error('DATABASE_PASSWORD is required in production. Please set it in your .env file.');
        }
        
        return {
          type: 'postgres',
          host: configService.get<string>('DATABASE_HOST') || 'localhost',
          port: parseInt(configService.get<string>('DATABASE_PORT') || '5432', 10),
          username: configService.get<string>('DATABASE_USER') || 'postgres',
          password: password as string,
          database: configService.get<string>('DATABASE_NAME') || 'taskmaster',
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: !isProduction,
          logging: configService.get('NODE_ENV') === 'development',
          migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
          ssl: isProduction ? { rejectUnauthorized: false } : false,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

