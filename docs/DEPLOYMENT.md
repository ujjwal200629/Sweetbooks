# Deployment Guide

This guide describes how to deploy the Sweetbook ecosystem to production using **Vercel** (Frontend), **Render** (Backend), and **Supabase** (PostgreSQL Database).

## 1. Database Setup (Supabase)
1. Log in to [Supabase](https://supabase.com/).
2. Create a new Project.
3. Once the database provisions, navigate to **Project Settings > Database**.
4. Copy the **Transaction Connection String**.
5. Replace `[YOUR-PASSWORD]` with your actual password.
   *Example:* `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`

## 2. Backend Deployment (Render)
Render uses Infrastructure as Code via the `render.yaml` file located in the `/backend` directory.

### Steps:
1. Push your repository to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New > Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file.
5. Provide the necessary Environment Variables when prompted:
   - `DATABASE_URL`: (Paste the Supabase connection string)
   - `JWT_SECRET`: (Generate a secure random string)
   - `FRONTEND_URL`: (Will be populated after Vercel deployment)
6. Click **Apply**. Render will automatically run `npm install`, `npx prisma generate`, `npm run build`, and `npm start`.

## 3. Frontend Deployment (Vercel)
Vercel automatically detects Vite configurations and SPA routing using the `vercel.json` file.

### Steps:
1. Log in to [Vercel](https://vercel.com/) and click **Add New > Project**.
2. Connect your GitHub repository.
3. Select the `frontend` directory as the Root Directory.
4. Set the Environment Variables:
   - `VITE_API_URL`: The URL of your Render backend deployment (e.g., `https://sweetbook-backend.onrender.com/api`).
5. Click **Deploy**. Vercel will build and host the application.

## 4. Finalizing the Connection
Once Vercel has generated your frontend URL:
1. Go back to Render Dashboard.
2. Edit the Environment Variables for the Web Service.
3. Update `FRONTEND_URL` to match your Vercel domain (e.g., `https://sweetbook.vercel.app`).
4. Restart the Render server to enforce CORS policy.

## 5. Migrations & Seeding in Production
To apply database schemas to Supabase, you must run migrations locally against the production URL:
```bash
cd backend
export DATABASE_URL="your-supabase-url"
npx prisma migrate deploy
npm run seed
```
> **IMPORTANT**: Running the seed script will DELETE all existing data. Do not run it on a live production database.
