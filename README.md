# Navvyata Kids Apparel — Full-Stack E-Commerce Platform

Navvyata is a full-stack e-commerce web application engineered for children's apparel (ages 0–14 years), featuring WHO-standard pediatric growth sizing, localized Indian checkout validation, atomic inventory reservation, and role-based admin management.

---

## 🌟 Tech Stack

* **Frontend & Framework**: [Next.js 16 (App Router)](https://nextjs.org/) with React 19 & Turbopack.
* **Styling & UI**: Custom CSS Design System with mobile-first responsive layout, micro-animations, and accessible modals.
* **Database & ORM**: [Supabase (Managed PostgreSQL)](https://supabase.com/) powered by [Prisma ORM 7](https://www.prisma.io/) via `@prisma/adapter-pg`.
* **State & Persistence**: Global React Context (Cart, Wishlist, Toast, Auth) with `localStorage` client persistence.
* **Process Manager**: PM2 on AWS EC2 (Ubuntu).

---

## 🏗️ Architecture & Database Setup

Navvyata uses **Supabase PostgreSQL** with a dual-URL connection pooler architecture to handle serverless concurrency and DDL migrations:

1. **`DATABASE_URL` (Port 6543, Transaction Pooler)**:
   Used at runtime by Next.js API routes and server actions.
   `postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`

2. **`DIRECT_URL` (Port 5432, Session Pooler)**:
   Used by Prisma CLI for executing migrations and schema push.
   `postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`

### Key Data Models
* **`User`**, **`UserAddress`**, **`ChildProfile`**: Customer accounts, multi-address management with single-default invariant, and pediatric fit profiles.
* **`Product`**, **`ProductSizeStock`**: Catalog variants with `stock` and `reservedStock` (for 15-minute checkout holds).
* **`Order`**, **`OrderItem`**, **`PaymentTransaction`**: Order tracking with transaction audit logs (ready for PayU live gateway).
* **`Coupon`**, **`BlogPost`**, **`Review`**: Promotional discount engine, content marketing, and customer reviews.
* **`AdminUser`**: Role-Based Access Control (`Owner`, `Store Manager`, `Content Writer`).

---

## 🚀 Quick Start & Development Runbook

### 1. Prerequisites
* Node.js v20+ or v22+
* npm or pnpm

### 2. Installation & Setup
```bash
# Clone the repository
git clone https://github.com/master1405/navvyata.git
cd navvyata

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env
# Open .env and add your Supabase DATABASE_URL and DIRECT_URL

# Generate Prisma Client & Push Schema
npm run db:generate
npm run db:push

# Seed store products & admin team
npm run db:seed

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the storefront and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin portal.

### Default Admin Credentials
* **Email**: `owner@navvyata.com`
* **Password**: `admin123`
* **Role**: `Owner`

---

## ☁️ Production Deployment on AWS EC2

### 1. System Requirements & Optimization (Free Tier `t2.micro` / `t3.micro`)
Because free-tier EC2 instances have 1GB of physical RAM, Next.js Turbopack compilation requires enabling Swap memory to prevent build freezes:

```bash
# Enable 2GB Swap (100% Free on existing EBS storage)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Ensure workspace permissions
sudo chmod -R 777 /var/www/navvyata
```

### 2. Deploying Updates from Git
```bash
cd /var/www/navvyata

# Pull latest code
git pull origin main

# Install dependencies & generate client
npm install
npm run db:generate

# Build optimized production bundle
npm run build

# Restart PM2
pm2 restart all || pm2 start npm --name "navvyata" -- start
```

---

## 📖 Documentation
Detailed technical specifications, sizing rules, and RBAC matrix are documented in:
* **[Master Architecture & Handoff Log](handoff.md)**
