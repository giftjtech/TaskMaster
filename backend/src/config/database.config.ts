import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Ensure password is always a string (PostgreSQL requirement)
  // Convert to string explicitly to handle any edge cases
  const passwordEnv = process.env.DATABASE_PASSWORD;
  const password = passwordEnv ? String(passwordEnv) : (isProduction ? undefined : 'postgres');
  
  if (!password && isProduction) {
    throw new Error(
      'DATABASE_PASSWORD is required in production. Please set it in your .env file.'
    );
  }
  
  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: password as string, // Explicitly type as string
    database: process.env.DATABASE_NAME || 'taskmaster',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: !isProduction, // NEVER use synchronize in production - use migrations
    logging: process.env.NODE_ENV === 'development',
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  };
};

export const dataSourceOptions: DataSourceOptions = {
  ...getDatabaseConfig(),
  type: 'postgres',
} as DataSourceOptions;

export default new DataSource(dataSourceOptions);

