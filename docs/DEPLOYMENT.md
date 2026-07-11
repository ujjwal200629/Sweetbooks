# Deployment Guide

This guide describes how to deploy the Sweetbook ecosystem to production completely free using **GitHub**, **Vercel** (Frontend), **Koyeb** (Backend), and **Supabase** (PostgreSQL Database).

## 1. Source Control (GitHub)
All deployments are triggered automatically when you push to the `main` branch of your GitHub repository.
1. Create a repository on GitHub.
2. Push the source code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/Sweetbooks.git
git push -u origin main
```

## 2. Database Setup (Supabase)
1. Log in to [Supabase](https://supabase.com/).
2. Create a new Project.
3. Navigate to **Project Settings > Database**.
4. Copy the **Transaction Connection String**.
5. Replace `[YOUR-PASSWORD]` with your actual password.
   *Example:* `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`

## 3. Backend Deployment (Koyeb)
Koyeb provides a free tier for Node.js applications and seamlessly integrates with GitHub.

### Steps:
1. Log in to [Koyeb](https://app.koyeb.com/).
2. Click **Create Web Service**.
3. Select **GitHub** and choose your `Sweetbooks` repository.
4. Set the **Branch** to `main` and **Work directory** to `backend`.
5. Under **Builder**, select **Buildpack**.
   - **Build command**: `npm install && npm run build` (This automatically runs `prisma generate && tsc` as configured in `package.json`).
   - **Run command**: `npm start`
6. Under **Environment variables**, add:
   - `DATABASE_URL`: (Paste the Supabase connection string)
   - `JWT_SECRET`: (Generate a secure random string)
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: (Will be populated after Vercel deployment)
7. Click **Deploy**. Koyeb will build and host the application.
8. Copy the Koyeb Public URL (e.g., `https://sweetbook-api.koyeb.app`).

## 4. Frontend Deployment (Vercel)
Vercel automatically detects Vite configurations and SPA routing using the `vercel.json` file.

### Steps:
1. Log in to [Vercel](https://vercel.com/) and click **Add New > Project**.
2. Connect your GitHub repository.
3. Select the `frontend` directory as the Root Directory.
4. Set the Environment Variables:
   - `VITE_API_URL`: The URL of your Koyeb backend deployment (e.g., `https://sweetbook-api.koyeb.app/api`).
5. Click **Deploy**. Vercel will build and host the application.

## 5. Finalizing the Connection
Once Vercel has generated your frontend URL:
1. Go back to Koyeb Dashboard.
2. Edit the Environment Variables for the Web Service.
3. Update `FRONTEND_URL` to match your Vercel domain (e.g., `https://sweetbooks.vercel.app`).
4. Koyeb will automatically redeploy with the updated CORS policy.

## 6. Migrations & Seeding in Production
To apply database schemas to Supabase, you must run migrations locally against the production URL:
```bash
cd backend
export DATABASE_URL="your-supabase-url"
npx prisma migrate deploy
npm run seed
```
> **IMPORTANT**: Running the seed script will DELETE all existing data. Do not run it on a live production database.
