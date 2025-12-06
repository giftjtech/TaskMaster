# Setup and Installation Guide

## Prerequisites

Before setting up the application, ensure you have the following installed:

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher (comes with Node.js)
- **PostgreSQL** 14.0 or higher
- **Docker** (optional, for Redis and PostgreSQL)
- **Git** (for cloning the repository)

## Quick Start Guide

> 💡 **New to this?** Follow the steps below in order. Each step builds on the previous one.

### Step 1: Clone and Navigate

```bash
git clone https://github.com/giftjtech/TaskMaster.git
cd TaskMaster
```

### Step 2: Backend Setup

#### 2.1 Install Dependencies

```bash
cd backend
npm install
```

#### 2.2 Create Environment File

**Recommended (easiest):**
```bash
node setup-env.js
```

This creates `.env` automatically. Then edit `.env` and update these **required** values:

- `DATABASE_PASSWORD` - Your PostgreSQL password
- `JWT_SECRET` - Run `node scripts/generate-secrets.js` to generate
- `JWT_REFRESH_SECRET` - Run `node scripts/generate-secrets.js` to generate

**Alternative:**
```bash
cp env.template .env
# Then edit .env manually
```

#### 2.3 Create Database

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create the database
CREATE DATABASE taskmaster;

-- Exit
\q
```

#### 2.4 Run Migrations

```bash
npm run migration:run
```

✅ This creates all database tables automatically.

#### 2.5 (Optional) Create Test Users

Add these to your `.env` file:

```env
# Admin User
ADMIN_EMAIL=admin@taskmaster.com
ADMIN_PASSWORD=Admin123!
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User

# Regular User  
USER_EMAIL=user@taskmaster.com
USER_PASSWORD=User123!
USER_FIRST_NAME=John
USER_LAST_NAME=Doe
```

Then run:
```bash
npm run seed:users  # Creates both users
```

Or for admin only:
```bash
npm run seed:admin  # Creates only admin
```

#### 2.6 (Optional) Configure Email for Password Reset

Add to `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM=your-email@gmail.com
```

**Gmail Quick Setup:**
1. Enable 2FA: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Copy the 16-character password to `SMTP_PASSWORD`

> ⚠️ Without email, password reset won't work, but the app runs fine.

#### 2.7 Start Backend

```bash
npm run start:dev
```

✅ Backend: `http://localhost:3000`  
✅ API Docs: `http://localhost:3000/api/docs`

### Step 3: Frontend Setup

#### 3.1 Install Dependencies

```bash
cd frontend
npm install
```

#### 3.2 Create Environment File

```bash
cp .env.example .env
```

The `.env` file is already configured for local development - **no changes needed** unless your backend runs on a different port.

#### 3.3 Start Frontend

```bash
npm run dev
```

✅ Frontend: `http://localhost:5173`

**Done!** Open the URL in your browser and log in with your seeded user credentials.

## Docker Setup (Optional - Easier Alternative)

> 💡 **New to PostgreSQL?** Docker Compose makes setup much easier!

### Quick Start with Docker

**Before running Docker Compose**, create a `.env` file in the project root:

```env
# Database passwords (must match)
DATABASE_PASSWORD=your-database-password
POSTGRES_PASSWORD=your-database-password

# JWT Secrets (required)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-minimum-32-characters
```

Then from project root:

```bash
# Start everything (PostgreSQL, Redis, Backend, Frontend)
docker compose up -d

# Check if services are running
docker compose ps

# View logs
docker compose logs -f
```

**That's it!** Docker handles:
- ✅ PostgreSQL database (auto-created)
- ✅ Redis cache
- ✅ Backend server
- ✅ Frontend server

**Next steps:**
1. Run migrations: `cd backend && npm run migration:run`
2. Seed users: `npm run seed:users` (set credentials in `.env` first)
3. Access frontend: `http://localhost:5173`

### Individual Services

```bash
# Start only PostgreSQL (useful if you want to run backend/frontend manually)
docker compose up postgres -d

# Start only Redis
docker compose up redis -d
```

## Database Setup

### Manual PostgreSQL Setup

1. Install PostgreSQL:
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. Create database:

```bash
psql -U postgres
CREATE DATABASE taskmaster;
\q
```

3. Update `.env` with your PostgreSQL credentials

4. Run migrations:

```bash
cd backend
npm run migration:run
```

### Understanding Migrations

The project includes one initial migration that creates **all** database tables at once.

**Run migrations:**
```bash
npm run migration:run
```

This single command creates:
- ✅ `users` table (with password reset fields)
- ✅ `projects` table
- ✅ `tasks` table (with status, priority, due dates)
- ✅ `tags` table
- ✅ `task_tags` junction table
- ✅ `comments` table
- ✅ `notifications` table
- ✅ All foreign key relationships
- ✅ Performance indexes

**Other migration commands:**
```bash
# Revert last migration (drops all tables - use with caution!)
npm run migration:revert

# Generate new migration (only if you modify entity files)
npm run migration:generate -- -n MigrationName
```

> 💡 **For fresh installations**: Just run `npm run migration:run` once and you're done!

## Redis Setup (Optional)

Redis is optional but recommended for production. The application will automatically fall back to in-memory caching if Redis is not available.

### Using Docker

```bash
docker compose up redis -d
```

### Manual Installation

#### Windows (WSL)

```bash
wsl --install
sudo apt-get update
sudo apt-get install redis-server
sudo service redis-server start
```

#### macOS

```bash
brew install redis
brew services start redis
```

#### Linux

```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

## Email Configuration (Optional)

Email is used for password reset functionality. Configure SMTP settings in `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@taskmaster.com
```

### Gmail Setup

1. Enable 2-factor authentication
2. Generate app password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Use app password in `SMTP_PASSWORD`

## Verification

### Backend Verification

1. Check server is running:
   ```bash
   curl http://localhost:3000/api/health
   ```

2. Access Swagger docs:
   Open `http://localhost:3000/api/docs` in browser

### Frontend Verification

1. Open `http://localhost:5173` in browser
2. You should see the login page

### Database Verification

```bash
psql -U postgres -d taskmaster
\dt  # List tables
SELECT * FROM users;  # Check users table
```

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process or change PORT in .env
```

**Database connection error:**
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

**JWT secret error:**
- Ensure secrets are at least 32 characters
- Use `node scripts/generate-secrets.js` to generate secure secrets

### Frontend Issues

**API connection error:**
- Verify backend is running
- Check `VITE_API_URL` in `.env`
- Check CORS settings in backend

**Build errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Issues

**Migration errors:**
```bash
# Revert and re-run
npm run migration:revert
npm run migration:run
```

**Connection timeout:**
- Verify PostgreSQL is running
- Check firewall settings
- Verify connection string in `.env`

## Development Workflow

### Backend Development

1. Make changes to code
2. Server auto-reloads (watch mode)
3. Check console for errors
4. Test endpoints via Swagger

### Frontend Development

1. Make changes to code
2. Browser auto-reloads (HMR)
3. Check browser console for errors
4. Test in browser

### Database Changes

1. Modify entity files
2. Generate migration:
   ```bash
   npm run migration:generate -- -n DescribeChanges
   ```
3. Review generated migration
4. Run migration:
   ```bash
   npm run migration:run
   ```

## Production Setup

See [Deployment Guide](./06-DEPLOYMENT.md) for production deployment instructions.

## Next Steps

1. **Create Admin User**: Use seed script or register first user
2. **Configure Email**: Set up SMTP for password reset
3. **Set Up Redis**: For production caching
4. **Review Security**: Update all default secrets
5. **Configure CORS**: Update allowed origins for production

