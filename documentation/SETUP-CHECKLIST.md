# Quick Setup Checklist

Follow this checklist to get TaskMaster running quickly. Check off each step as you complete it.

## ✅ Prerequisites Check

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] PostgreSQL 14+ installed OR Docker installed
- [ ] Git installed (for cloning)

## ✅ Backend Setup

- [ ] Clone repository: `git clone <repo-url> && cd task-manage`
- [ ] Navigate to backend: `cd backend`
- [ ] Install dependencies: `npm install`
- [ ] Create `.env` file: `node setup-env.js` OR `cp env.template .env`
- [ ] Edit `.env` and set:
  - [ ] `DATABASE_PASSWORD` (your PostgreSQL password)
  - [ ] `JWT_SECRET` (generate with `node scripts/generate-secrets.js`)
  - [ ] `JWT_REFRESH_SECRET` (generate with `node scripts/generate-secrets.js`)
- [ ] Create database: `psql -U postgres` then `CREATE DATABASE taskmaster;`
- [ ] Run migrations: `npm run migration:run`
- [ ] (Optional) Seed users: Add to `.env` then `npm run seed:users`
- [ ] Start backend: `npm run start:dev`
- [ ] Verify: Open `http://localhost:3000/api/docs`

## ✅ Frontend Setup

- [ ] Navigate to frontend: `cd frontend`
- [ ] Install dependencies: `npm install`
- [ ] Create `.env`: `cp .env.example .env`
- [ ] Start frontend: `npm run dev`
- [ ] Verify: Open `http://localhost:5173`

## ✅ Optional: Email Setup (for password reset)

- [ ] Add to backend `.env`:
  - [ ] `SMTP_HOST=smtp.gmail.com`
  - [ ] `SMTP_USER=your-email@gmail.com`
  - [ ] `SMTP_PASSWORD=your-gmail-app-password`
  - [ ] `SMTP_FROM=your-email@gmail.com`
- [ ] Get Gmail App Password: https://myaccount.google.com/apppasswords

## ✅ Test Login

- [ ] Open `http://localhost:5173`
- [ ] Log in with seeded user credentials
- [ ] Verify you can see the dashboard

## 🎉 Done!

If all steps are checked, you're ready to use TaskMaster!

**Having issues?** Check the [Troubleshooting section](./05-SETUP-INSTALLATION.md#troubleshooting) in the full setup guide.

