# TaskMaster Frontend

React + TypeScript + Vite frontend for the Task Management Platform.

## Quick Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create Environment File

```bash
cp .env.example .env
```

**That's it!** The `.env` file is already configured for local development. No changes needed unless your backend runs on a different port.

### Step 3: Start Development Server

```bash
npm run dev
```

✅ Frontend will be available at `http://localhost:5173`

---

## Production Configuration

For production deployment, update `.env` with your actual backend URLs:

```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_WS_URL=wss://your-backend.railway.app
VITE_APP_NAME=TaskMaster
```

## Build

```bash
npm run build
```

## Deployment (Vercel)

Before deploying to Vercel:

1. **Update `vercel.json`**: 
   - Replace `YOUR_BACKEND_URL` in the rewrites section with your actual backend URL
   - Or remove the rewrites section if you're using environment variables

2. **Set Environment Variables in Vercel**:
   - Go to your Vercel project settings
   - Add the following environment variables:
     - `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.railway.app/api`)
     - `VITE_WS_URL`: Your WebSocket URL (e.g., `wss://your-backend.railway.app`)
     - `VITE_APP_NAME`: Your app name (optional)

**Note**: Never commit `.env` files with actual credentials or production URLs to version control.

