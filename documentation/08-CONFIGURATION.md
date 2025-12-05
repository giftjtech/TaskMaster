# Configuration Guide

## Environment Variables

### Backend Configuration

#### Database Configuration

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=taskmaster
```

Or use connection string:
```env
DATABASE_URL=postgresql://user:password@host:port/database
```

#### JWT Configuration

```env
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=your-refresh-secret-minimum-32-characters-long
JWT_REFRESH_EXPIRATION=30d
```

**Security Requirements:**
- Secrets must be at least 32 characters
- Use random, secure strings
- Never use default or placeholder values
- Generate secrets: `node scripts/generate-secrets.js`

#### Application Configuration

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

For multiple origins:
```env
CORS_ORIGIN=http://localhost:5173,https://app.example.com
```

#### Redis Configuration (Optional)

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

If Redis is not configured, the application automatically falls back to in-memory caching.

#### Email Configuration (Optional)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@taskmaster.com
```

**Gmail Setup:**
1. Enable 2-factor authentication
2. Generate app password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Use app password in `SMTP_PASSWORD`

**Other Providers:**
- **SendGrid**: `smtp.sendgrid.net`, port `587`
- **Mailgun**: `smtp.mailgun.org`, port `587`
- **AWS SES**: Use AWS SDK instead

### Frontend Configuration

```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
VITE_APP_NAME=TaskMaster
```

**Production:**
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_WS_URL=wss://api.yourdomain.com
VITE_APP_NAME=TaskMaster
```

## Security Configuration

### JWT Secret Validation

The application validates JWT secrets on startup:
- Secrets must be at least 32 characters
- Default/placeholder values are rejected in production
- Application will not start with invalid secrets

### CORS Configuration

**Development:**
```env
CORS_ORIGIN=http://localhost:5173
```

**Production:**
```env
CORS_ORIGIN=https://your-frontend.vercel.app
```

**Multiple Origins:**
```env
CORS_ORIGIN=https://app1.example.com,https://app2.example.com
```

### Rate Limiting

Configured in `app.module.ts`:
```typescript
ThrottlerModule.forRoot([
  {
    ttl: 60000, // 1 minute
    limit: 100, // 100 requests per minute
  },
])
```

Customize per endpoint in controllers using `@Throttle()` decorator.

## Database Configuration

### TypeORM Configuration

Located in `src/database/database.config.ts`:

```typescript
{
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false, // Never true in production
  logging: process.env.NODE_ENV === 'development',
}
```

### Connection Pooling

TypeORM automatically manages connection pooling. Configure in `database.config.ts`:

```typescript
{
  extra: {
    max: 20, // Maximum connections
    min: 5,  // Minimum connections
    idleTimeoutMillis: 30000,
  }
}
```

## Cache Configuration

### Redis Configuration

If Redis is available, it's used automatically. Configure connection:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_DB=0
```

### Cache TTL

Configure cache TTL in service files:

```typescript
await this.cacheService.wrap(
  `cache:key`,
  async () => data,
  300 // TTL in seconds (5 minutes)
);
```

## Email Configuration

### SMTP Settings

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false  # true for port 465
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@taskmaster.com
```

### Email Templates

Email templates are in `src/email/email.service.ts`. Customize as needed.

## Logging Configuration

### Development Logging

Enabled by default in development mode:
```typescript
logging: process.env.NODE_ENV === 'development'
```

### Production Logging

Configure logging interceptor in `common/interceptors/logging.interceptor.ts`.

## Swagger Configuration

Swagger is enabled only in development:

```typescript
if (!isProduction) {
  SwaggerModule.setup('api/docs', app, document);
}
```

To enable in production (not recommended):
```typescript
SwaggerModule.setup('api/docs', app, document);
```

## WebSocket Configuration

### Socket.io Configuration

Configured in `notifications/notifications.gateway.ts`:

```typescript
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
})
```

### Room Management

Rooms are automatically managed:
- `task:${taskId}` - Task-specific room
- `user:${userId}` - User-specific room

## Production Configuration

### Environment-Specific Settings

**Development:**
```env
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Production:**
```env
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Security Headers

Configured via Helmet in `main.ts`:

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));
```

## Frontend Configuration

### Vite Configuration

Located in `frontend/vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

### Tailwind Configuration

Located in `frontend/tailwind.config.js`:

```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // Custom theme configuration
    },
  },
}
```

## Docker Configuration

### Docker Compose

Located in `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: taskmaster
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

## Configuration Validation

### Backend Validation

JWT secrets are validated on startup. Invalid secrets will prevent application start.

### Environment Variable Validation

Use `env.template` as reference for required variables. Missing required variables will cause startup errors.

## Best Practices

1. **Never commit `.env` files** - Use `.env.example` or `env.template`
2. **Use strong secrets** - Generate with `node scripts/generate-secrets.js`
3. **Environment-specific configs** - Separate dev and prod configurations
4. **Secure storage** - Use platform secrets management in production
5. **Regular rotation** - Rotate secrets periodically
6. **Documentation** - Keep configuration documented
7. **Validation** - Validate all configuration on startup

