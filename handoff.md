# Navvyata E‑Commerce — Master Architecture & Handoff Documentation

This document serves as the permanent, single source of truth for the **Navvyata Kids Apparel** e-commerce platform. It details the system architecture, database models, customer storefront, sizing engine, checkout logistics, customer account lifecycle, and admin role-based access control (RBAC).

---

## 🚀 1. Architecture Overview

Navvyata is built as a full-stack Next.js application (App Router) powered by **Supabase (Managed PostgreSQL)** via `@prisma/adapter-pg` and `@prisma/client`.

```
navvyata/
├── app/
│   ├── (storefront)/          # Customer-facing shopping routes
│   │   ├── page.js            # Homepage with hero category highlights
│   │   ├── shop/              # Product Listing Page (PLP) with multi-filtering
│   │   ├── product/[id]/      # Product Detail Page (PDP) with sizing & WhatsApp
│   │   ├── cart/              # Cart management, coupon engine & coins
│   │   ├── checkout/          # 3-step checkout (Address -> Payment -> Confirmation)
│   │   ├── account/           # Customer dashboard (Auth, Addresses CRUD, Child Profiles CRUD, Orders)
│   │   ├── sizeguide/         # Interactive 0–14Y fit calculator & measurement guide
│   │   ├── rewards/           # Loyalty rewards ledger
│   │   ├── wishlist/          # Saved favorites
│   │   └── blog/              # Parenting & styling blog articles
│   ├── admin/                 # Isolated Admin Portal
│   │   ├── page.js            # Admin authentication gateway
│   │   └── dashboard/         # Dashboard layout, Metrics, Products, Coupons, Blog, Team RBAC
│   ├── api/                   # Route handlers
│   │   ├── admin/             # Admin protected endpoints (Metrics, Products, Coupons, Blog, Team)
│   │   ├── auth/              # Customer OTP auth endpoints
│   │   ├── orders/            # Order placement, status tracking & payment stub
│   │   ├── products/          # Catalog APIs
│   │   └── user/              # Customer addresses, child profiles, and order history
│   ├── components/            # Reusable UI components (ProductCard, Navbar, Footers)
│   ├── context/               # Global Cart, Wishlist, Toast, and User Auth state
│   └── lib/                   # Database client, auth helpers & domain constants
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   ├── seed.js                # Catalog, blog, coupon & order mock data
│   └── seed-admin.js          # Admin team provisioning script
└── handoff.md                 # Master handoff & architecture log (this file)
```

---

## 🗄️ 2. Database Schema & Data Models

Defined in [prisma/schema.prisma](file:///c:/Users/mashu/Downloads/navvyata/prisma/schema.prisma):

| Model | Key Fields | Description |
| :--- | :--- | :--- |
| **`User`** | `id`, `phone`, `email`, `coins` | Customer account authenticated via phone OTP. |
| **`UserAddress`** | `id`, `userId`, `name`, `phone`, `address`, `pincode`, `city`, `state`, `type`, `isDefault` | Saved shipping addresses with single-default invariant. |
| **`ChildProfile`** | `id`, `userId`, `name`, `age`, `height`, `size`, `isDefault` | Child metadata used for automatic size recommendations. |
| **`Product`** | `id`, `name`, `emoji`, `ageRange`, `price`, `oldPrice`, `bg`, `tag`, `isFeatured`, `isSale`, `isNew` | Catalog items with visual attributes. |
| **`ProductSizeStock`** | `id`, `productId`, `size`, `stock` | Inventory per size variant (e.g. `4–5Y`, stock: `15`). Decremented on order placement. |
| **`Order`** | `id`, `userId`, `status`, `subtotal`, `discount`, `shipping`, `total`, `payMethod`, `estDelivery` | Placed orders (`NVY-2025-XXXXX`). |
| **`OrderItem`** | `id`, `orderId`, `productId`, `name`, `size`, `color`, `price`, `qty` | Snapshot of items ordered. |
| **`Coupon`** | `id`, `code`, `discountPct`, `minSpend`, `maxUses`, `usedCount`, `expiresAt`, `isActive` | Promotional discount codes (e.g. `NAVVY20`, `FIRST50`). |
| **`BlogPost`** | `id`, `slug`, `title`, `excerpt`, `content`, `author`, `tags`, `readTime` | Content marketing articles. |
| **`AdminUser`** | `id`, `email`, `passwordHash`, `name`, `role`, `status` | Staff accounts with RBAC (`Owner`, `Store Manager`, `Content Writer`). |

---

## 👕 3. Children's Sizing Engine & Standards

Located in [app/lib/constants.js](file:///c:/Users/mashu/Downloads/navvyata/app/lib/constants.js):

* **WHO Pediatric Growth Metrics**: Accurately maps height (primary determinant in children's apparel) and age (fallback) from newborn (`0M`) to young adult (`14Y`):
  * **Baby**: `0–3M`, `3–6M`, `6–12M`
  * **Toddler**: `1–2Y`, `2–3Y`, `3–4Y`
  * **Kids**: `4–5Y`, `5–6Y`, `6–7Y`, `7–8Y`, `8–9Y`, `9–10Y`
  * **Tweens**: `10–11Y`, `11–12Y`, `12–13Y`, `13–14Y`
* **Interactive Size Guide ([`app/sizeguide/page.js`](file:///c:/Users/mashu/Downloads/navvyata/app/sizeguide/page.js))**:
  * Tabbed categories: **All Sizes**, **Baby (0–12M)**, **Toddler (1–4Y)**, **Kids (4–10Y)**, **Tweens (10–14Y)**.
  * Interactive Fit Finder: Evaluates input height and age to dynamically target and highlight the exact matching row with 🎯.
  * No hardcoded default row selection.
* **Product Detail Page Integration ([`app/product/[id]/ProductClient.js`](file:///c:/Users/mashu/Downloads/navvyata/app/product/[id]/ProductClient.js))**:
  * 1-Click Child Profile Pills: If a logged-in parent has saved child profiles, quick pills allow them to apply their child's size in 1 tap.
  * Direct WhatsApp Consultation: Opens `https://wa.me/919876543210` with item ID, product name, and sizing inquiry pre-populated.

---

## 🚚 4. Indian Logistics & Checkout Address Validation

Located in [app/checkout/address/page.js](file:///c:/Users/mashu/Downloads/navvyata/app/checkout/address/page.js) and [app/lib/constants.js](file:///c:/Users/mashu/Downloads/navvyata/app/lib/constants.js):

* **State Dropdown**: Standardized `<select>` menu containing all 28 States and 8 Union Territories of India.
* **Postal Pincode**: Strict 6-digit numeric pattern (`/^[1-9][0-9]{5}$/`), blocking non-numeric keystrokes.
* **Mobile Number**: Strict 10-digit mobile pattern starting with digits 6–9 (`/^[6-9]\d{9}$/`).
* **City & Name**: Alphabetic validation (`min 3 chars` for name, `min 2 chars` for city) with inline error hints.

---

## 👤 5. Customer Account & Lifecycle Management

Located in [app/account/AccountClient.js](file:///c:/Users/mashu/Downloads/navvyata/app/account/AccountClient.js):

* **Authentication**: Mobile phone OTP login (mock code `4289`) with Google authentication fallback.
* **Saved Addresses CRUD**:
  * **Add Address**: Modal form with Indian state dropdown and field validation.
  * **Edit Address**: Pre-populates existing details, persists updates via `PUT /api/user/addresses`.
  * **Delete Address**: Safe confirmation modal, triggers `DELETE /api/user/addresses?id=...`, auto-promotes next address if default was removed.
* **Kids Profiles CRUD**:
  * **Add Child Profile**: Captures name, age, height, and auto-derives recommended size.
  * **Edit Child Profile**: Modifies age/height with live size calculation updates via `PUT /api/user/child-profiles`.
  * **Delete Child Profile**: Confirmation modal, triggers `DELETE /api/user/child-profiles?id=...`.
* **Order History**: Displays order records with collapsible visual 3-step delivery progress timelines (Confirmed → Shipped → Delivered).

---

## 🛡️ 6. Admin Portal & Role-Based Access Control (RBAC)

Located in [app/admin/](file:///c:/Users/mashu/Downloads/navvyata/app/admin) and [app/api/admin/](file:///c:/Users/mashu/Downloads/navvyata/app/api/admin):

### Role Permissions Matrix

| Module / Screen | Route | Owner | Store Manager | Content Writer |
| :--- | :--- | :---: | :---: | :---: |
| **Login Gateway** | `/admin` | ✅ | ✅ | ✅ |
| **Dashboard Overview** | `/admin/dashboard` | ✅ | ✅ | ✅ |
| **Revenue & Sizing Metrics**| `/api/admin/metrics` | ✅ | ✅ | ❌ |
| **Products Catalog (CRUD)** | `/admin/dashboard/products` | ✅ | ✅ | ❌ |
| **Coupons Engine (CRUD)** | `/admin/dashboard/coupons` | ✅ | ✅ | ❌ |
| **Blog Publishing (CRUD)** | `/admin/dashboard/blog` | ✅ | ✅ | ✅ |
| **Team Management (RBAC)** | `/admin/dashboard/team` | ✅ | ❌ *(Hidden & 403 Forbidden)* | ❌ *(Hidden & 403 Forbidden)* |

### Admin Credentials (Local/Dev)
* **Script**: `node prisma/seed-admin.js`
* **Default Owner**:
  * **Email**: `owner@navvyata.com`
  * **Password**: `admin123`
  * **Role**: `Owner`
* **Password Hashing**: PBKDF2 with unique salts, managed via [app/lib/adminAuth.js](file:///c:/Users/mashu/Downloads/navvyata/app/lib/adminAuth.js).
* **Session Cookie**: `admin_session` base64 payload verified on every protected API route.

---

## 🧪 7. Test Verification & Quality Assurance

* **Production Compiler**: Verified with `next build` (Turbopack). All 40 routes compile cleanly with **0 errors**.
* **Headless Browser Compatibility**: All native browser prompts (`confirm()`, `alert()`) were replaced with non-blocking React state modals, preventing automated test runners from freezing.
* **Automated E2E Verification**:
  1. Homepage category deep-links (`/shop?category=tops`, `dresses`, `sets`, `bottoms`).
  2. Navbar active highlighting under `<Suspense>` isolation (`Shop all` vs `New arrivals` vs `Sale`).
  3. Interactive Size Guide fit calculator with category filtering.
  4. PDP variant stock, child profile quick-selection, and WhatsApp redirect.
  5. Checkout address validation and order placement.
  6. Customer account Address & Child Profile CRUD.
  7. Store Manager RBAC enforcement (Team menu hidden and URL `/admin/dashboard/team` returns 403 Forbidden).

---

## 📋 8. Setup & Development Runbook

```bash
# 1. Install dependencies
npm install

# 2. Configure .env with Supabase credentials (see .env.example)
# DATABASE_URL (Port 6543, Transaction pooler)
# DIRECT_URL (Port 5432, Session pooler)

# 3. Setup database schema & generate Prisma client
npm run db:generate
npm run db:push

# 4. Seed catalog data & admin accounts
npm run db:seed

# 5. Start local development server
npm run dev

# 6. Validate production compilation
npm run build
```

---

## ☁️ 9. AWS EC2 Production Deployment Runbook

For deploying on an AWS EC2 instance (Ubuntu/Debian) running PM2:

```bash
# 1. SSH into EC2 instance
ssh -i /path/to/key.pem ubuntu@<ec2-public-ip>

# 2. Navigate to project root
cd ~/navvyata

# 3. Fetch and switch to the production feature branch
git fetch origin
git checkout feat/supabase-postgres-migration
git pull origin feat/supabase-postgres-migration

# 4. Configure .env on EC2 securely
nano .env
# Paste DATABASE_URL and DIRECT_URL (replace password)
chmod 600 .env

# 5. Install dependencies and generate client
npm install
npm run db:generate

# 6. Push database schema & seed (if first time on Supabase)
npm run db:push
npm run db:seed

# 7. Build optimized Next.js bundle
npm run build

# 8. Restart process manager
pm2 restart navvyata || pm2 start npm --name "navvyata" -- start

# 9. Verify deployment
pm2 logs navvyata --lines 50
```
