import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file for migrations
// Handle both source (ts) and compiled (js) locations
const envPath = resolve(__dirname, '../../.env');
config({ path: envPath });

const isProduction = process.env.NODE_ENV === 'production';
const passwordEnv = process.env.DATABASE_PASSWORD;
const password = passwordEnv ? String(passwordEnv) : (isProduction ? undefined : 'postgres');

if (!password && isProduction) {
  throw new Error(
    'DATABASE_PASSWORD is required in production. Please set it in your .env file.'
  );
}

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: password as string,
  database: process.env.DATABASE_NAME || 'taskmaster',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl: isProduction ? { rejectUnauthorized: false } : false,
};

export default new DataSource(dataSourceOptions);

