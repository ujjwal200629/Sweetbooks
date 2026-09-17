# 🍬 Sweetbook - Business Operating System

Sweetbook is a modern, high-performance Business Operating System and POS (Point of Sale) application designed specifically for Mithai (sweet) shops, bakeries, and confectioneries. 

## 🎯 The Problem We Solve
Traditional POS systems are slow, clunky, and generic. They treat every customer as just another transaction. 

**Sweetbook solves this by allowing business owners to provide a highly personalized experience to their customers.** 
By seamlessly tracking purchase history and automatically categorizing customers into VIP tiers (Silver, Gold, Platinum), shop owners can offer personalized loyalty rewards and discounts. All of this happens instantly at the checkout counter, while the owner gets a bird's-eye view of their inventory, revenue, and business health through a powerful analytics dashboard.

---

## 💻 Tech Stack & Why We Chose It

We carefully selected a modern stack to ensure speed, scalability, and developer experience.

### Frontend: React + Vite + Tailwind CSS
* **Why not Angular/Vue?** React's ecosystem and component-based architecture allowed us to build a highly responsive POS interface that doesn't lag during peak business hours.
* **Why Vite instead of Create React App (CRA)?** CRA is deprecated and slow. Vite provides lightning-fast hot-module replacement (HMR) and optimized production builds.
* **Why Tailwind CSS?** It allows for rapid, utility-first styling without the bloat of traditional CSS frameworks like Bootstrap, ensuring our app loads instantly.

### Backend: Node.js + Express + Prisma ORM
* **Why Node.js?** The asynchronous, event-driven nature of Node.js is perfect for handling hundreds of simultaneous API requests (like fetching products and processing invoices).
* **Why Prisma instead of Sequelize/Mongoose?** Prisma offers unmatched type safety. It generates TypeScript types directly from our database schema, catching database errors before the code even runs.

### Database: PostgreSQL
* **Why not MongoDB?** Sweetbook handles financial data, invoices, and structured relationships (e.g., an invoice belongs to a customer, contains multiple line items, and affects loyalty points). PostgreSQL provides strict ACID compliance and relational integrity, which NoSQL databases struggle with in financial applications.

### Infrastructure: Docker
* **Why Docker?** It completely eliminates the "it works on my machine" problem. With Docker, anyone can run the exact same database and servers regardless of their operating system.

---

## 🏗️ Development Phases
Sweetbook was built in structured phases to ensure maximum stability:

1. **Phase 1: UI/UX Blueprinting** - Designed the complete frontend interface, ensuring the POS screen was optimized for fast checkout flows.
2. **Phase 2: Database Schema & API Architecture** - Designed the PostgreSQL schema, created Prisma models, and built the Express REST APIs.
3. **Phase 3: Business Logic Integration** - Connected the frontend to the backend, implementing the automatic VIP tiering system, dynamic dashboard analytics, and stock management.
4. **Phase 4: Dockerization & One-Click Setup** - Packaged the entire ecosystem into Docker containers and created automated setup scripts for seamless installation.

---

## 🚀 Spoon-Fed Installation Guide

We have made installing Sweetbook incredibly easy. You do not need to install Node.js, databases, or configure environment variables. The entire ecosystem boots up with one click.

### Step 1: Install Docker Desktop
Before doing anything, you need Docker installed on your computer.
1. Go to: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Download the version for your computer (Windows or Mac).
3. Run the installer and finish the setup.
4. **CRITICAL:** Open the "Docker Desktop" application on your computer and leave it running in the background.

### Step 2: Download the Project
1. Download this repository to your computer (either via `git clone` or downloading the ZIP file and extracting it).
2. Open the `Sweetbooks` folder you just downloaded.

### Step 3: Run the Setup File
**For Windows Users:**
1. Inside the folder, find the file named `run_sweetbook.bat` (it might just show up as `run_sweetbook` with a gear/window icon).
2. **Double-click it.**
3. A black terminal window will open. It will automatically download the database, build the code, and inject demo data (100+ customers and 500+ invoices). 
4. *Wait about 60 seconds.* The script will automatically open your web browser when it's ready.

**For Mac/Linux Users:**
1. Open your terminal and navigate to the Sweetbook folder.
2. Run this command: `bash run_sweetbook.sh`

### Step 4: Log In!
Once your browser opens to `http://localhost`, use the following demo credentials to explore the dashboard:
* **Email:** `demo@sweetbook.com`
* **Password:** `demo123`

---
*Built with ❤️ for local businesses.*
