# 🍬 Sweetbook - Premium Mithai & Bakery BOS

Sweetbook is a modern Business Operating System designed exclusively for Indian sweet shops (Mithai), bakeries, and confectioneries. It features a high-speed point-of-sale interface, automated VIP customer tiering, loyalty programs, and comprehensive business analytics.

## 📚 Documentation
Comprehensive documentation can be found in the `/docs` directory:
- [PRD (Product Requirements)](docs/PRD.md)
- [SDD (Software Design)](docs/SDD.md)
- [DDS (Database Schema)](docs/DDS.md)
- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Local or Docker)

### 1. Database Setup
Ensure PostgreSQL is running on your machine.
Configure your environment variables:
- Duplicate `backend/.env.example` to `backend/.env`.
- Ensure `DATABASE_URL` matches your local postgres credentials (e.g. `postgresql://user:password@localhost:5432/sweetbook?schema=public`).

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed     # Warning: Clears DB and inserts demo data!
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

### 4. Login
- **URL**: `http://localhost:5173`
- **Email**: `demo@sweetbook.com`
- **Password**: `demo123`

## ☁️ Production Deployment

Sweetbook is designed to be deployed completely free across three services without requiring a credit card:
1. **Source Control**: GitHub (Triggers Automatic Deployments)
2. **Frontend**: Vercel (SPA)
3. **Backend**: Koyeb (Node.js/Express)
4. **Database**: Supabase (PostgreSQL)

For detailed step-by-step deployment instructions, please refer to the [Deployment Guide](docs/DEPLOYMENT.md).

## 🛠️ Common Errors & Troubleshooting

- **`Failed to resolve import` in Frontend**: 
  Vite caches modules. If you move files around, clear the cache by running `npm run dev -- --force`.
- **`PrismaClientInitializationError`**:
  Ensure PostgreSQL is actually running and the credentials in `backend/.env` are correct.
- **`Hydration mismatch` / `<button> cannot appear as a descendant of <button>`**:
  Ensure you are not nesting Shadcn `<Button>` components inside Radix `<DialogTrigger asChild>` without properly structuring the HTML.

## 🛑 Constraints & Rules
- Do NOT change the UI blueprint or the existing domain functionality (Sweets & Bakery).
- Always use PostgreSQL (SQLite is not supported due to date functions).
- Do not run `npm run seed` in production as it destroys all existing data.
