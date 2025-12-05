# Deployment Guide

## Overview

This guide covers deploying the TaskMaster application to production environments. The frontend is deployed to Vercel, and the backend can be deployed to Railway or Render.

## Prerequisites

- GitHub repository with code
- Accounts on deployment platforms:
  - Vercel (frontend)
  - Railway or Render (backend)
- Domain name (optional)

## Frontend Deployment - Vercel

### Method 1: GitHub Integration (Recommended)

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as root directory

2. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**
   Add the following variables:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   VITE_WS_URL=wss://your-backend-url.com
   VITE_APP_NAME=TaskMaster
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Future pushes to main branch will auto-deploy

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add VITE_API_URL
   vercel env add VITE_WS_URL
   vercel env add VITE_APP_NAME
   ```

5. **Production Deploy**
   ```bash
   vercel --prod
   ```

## Backend Deployment - Railway

### Setup

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   cd backend
   railway init
   ```

4. **Add PostgreSQL Service**
   - In Railway dashboard, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

5. **Add Redis Service (Optional)**
   - Click "New" → "Database" → "Redis"
   - Railway will set `REDIS_HOST` and `REDIS_PORT`

6. **Set Environment Variables**
   In Railway dashboard, add:
   ```
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=<generate-strong-secret>
   JWT_REFRESH_SECRET=<generate-strong-secret>
   JWT_EXPIRATION=7d
   JWT_REFRESH_EXPIRATION=30d
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   SMTP_HOST=<your-smtp-host>
   SMTP_PORT=587
   SMTP_USER=<your-smtp-user>
   SMTP_PASSWORD=<your-smtp-password>
   SMTP_FROM=noreply@taskmaster.com
   ```

7. **Deploy**
   ```bash
   railway up
   ```

8. **Run Migrations**
   ```bash
   railway run npm run migration:run
   ```

9. **Seed Admin (Optional)**
   ```bash
   railway run npm run seed:admin
   ```

## Backend Deployment - Render

### Setup

1. **Create Web Service**
   - Go to [Render Dashboard](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - Name: `taskmaster-backend`
   - Environment: `Node`
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm run start:prod`
   - Root Directory: `backend`

3. **Add PostgreSQL Database**
   - Click "New" → "PostgreSQL"
   - Render will automatically set `DATABASE_URL`

4. **Add Redis (Optional)**
   - Click "New" → "Redis"
   - Render will set connection variables

5. **Set Environment Variables**
   Add all variables from `backend/env.template`:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=<auto-set-by-render>
   JWT_SECRET=<generate-strong-secret>
   JWT_REFRESH_SECRET=<generate-strong-secret>
   JWT_EXPIRATION=7d
   JWT_REFRESH_EXPIRATION=30d
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   REDIS_HOST=<auto-set-by-render>
   REDIS_PORT=<auto-set-by-render>
   SMTP_HOST=<your-smtp-host>
   SMTP_PORT=587
   SMTP_USER=<your-smtp-user>
   SMTP_PASSWORD=<your-smtp-password>
   SMTP_FROM=noreply@taskmaster.com
   ```

6. **Deploy**
   - Render will automatically deploy on push to main branch
   - Or click "Manual Deploy" → "Deploy latest commit"

7. **Run Migrations**
   - Use Render Shell:
     ```bash
     cd backend
     npm run migration:run
     ```

## Environment Variables Reference

### Backend Production Variables

```env
# Required
NODE_ENV=production
PORT=3000
DATABASE_URL=<provided-by-platform>
JWT_SECRET=<32+ character secret>
JWT_REFRESH_SECRET=<32+ character secret>
CORS_ORIGIN=https://your-frontend.vercel.app

# Optional
JWT_EXPIRATION=7d
JWT_REFRESH_EXPIRATION=30d
REDIS_HOST=<provided-by-platform>
REDIS_PORT=<provided-by-platform>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@taskmaster.com
```

### Frontend Production Variables

```env
VITE_API_URL=https://your-backend-url.com/api
VITE_WS_URL=wss://your-backend-url.com
VITE_APP_NAME=TaskMaster
```

## Post-Deployment Steps

### 1. Run Database Migrations

```bash
# Railway
railway run npm run migration:run

# Render (via Shell)
cd backend && npm run migration:run
```

### 2. Seed Admin User (Optional)

```bash
# Railway
railway run npm run seed:admin

# Render (via Shell)
cd backend && npm run seed:admin
```

### 3. Verify Deployment

**Backend:**
- Check health endpoint: `https://your-backend-url.com/api/health`
- Access Swagger (if enabled): `https://your-backend-url.com/api/docs`

**Frontend:**
- Open deployed URL
- Test login functionality
- Verify API connection

### 4. Update CORS Settings

Ensure `CORS_ORIGIN` in backend matches your frontend URL:
```
CORS_ORIGIN=https://your-frontend.vercel.app
```

### 5. Configure Custom Domain (Optional)

**Vercel:**
- Go to project settings → Domains
- Add your domain
- Update DNS records

**Railway/Render:**
- Add custom domain in settings
- Update DNS records

## CI/CD with GitHub Actions

### Automated Deployment

The project includes GitHub Actions workflows for automated deployment:

1. **CI Workflow** (`.github/workflows/ci.yml`)
   - Runs on push/PR
   - Tests and lints code
   - Validates build

2. **Deploy Workflow** (`.github/workflows/deploy.yml`)
   - Deploys on push to main
   - Requires secrets configuration

### GitHub Secrets

Add these secrets to your repository:

**Vercel:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

**Railway:**
- `RAILWAY_TOKEN`
- `RAILWAY_SERVICE_ID`

**Render:**
- `RENDER_API_KEY`
- `RENDER_SERVICE_ID`

## Monitoring and Logs

### Railway

- View logs: Railway dashboard → Service → Logs
- Metrics: Built-in metrics dashboard

### Render

- View logs: Render dashboard → Service → Logs
- Metrics: Built-in metrics dashboard

### Vercel

- View logs: Vercel dashboard → Project → Logs
- Analytics: Built-in analytics

## Troubleshooting

### Backend Deployment Issues

**Build fails:**
- Check build logs
- Verify all dependencies in `package.json`
- Ensure Node.js version matches

**Database connection fails:**
- Verify `DATABASE_URL` is set correctly
- Check database service is running
- Verify network access

**Application crashes:**
- Check application logs
- Verify all environment variables are set
- Check JWT secrets are valid

### Frontend Deployment Issues

**Build fails:**
- Check build logs
- Verify environment variables
- Check for TypeScript errors

**API connection fails:**
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Verify backend is accessible

## Security Checklist

- [ ] All JWT secrets are strong (32+ characters)
- [ ] CORS is configured correctly
- [ ] Environment variables are set securely
- [ ] Database credentials are secure
- [ ] HTTPS is enabled
- [ ] Rate limiting is configured
- [ ] Security headers are enabled (Helmet)
- [ ] SMTP credentials are secure
- [ ] No sensitive data in code
- [ ] Secrets are not in version control

## Scaling Considerations

### Backend Scaling

- Use load balancer for multiple instances
- Ensure stateless design (JWT tokens)
- Configure Redis for shared cache
- Use connection pooling for database

### Frontend Scaling

- CDN for static assets
- Enable caching headers
- Optimize bundle size
- Use lazy loading

## Backup and Recovery

### Database Backups

**Railway:**
- Automatic daily backups
- Manual backup via dashboard

**Render:**
- Automatic backups (paid plans)
- Manual backup via dashboard

### Recovery

1. Restore database from backup
2. Redeploy application
3. Run migrations if needed
4. Verify functionality

## Maintenance

### Regular Tasks

- Update dependencies
- Review security patches
- Monitor logs and errors
- Check database performance
- Review and optimize queries
- Update documentation

