# 📚 PROJECT_OVERVIEW.md — School Management System

> **Generated:** 2026-08-05 | **Branch:** `my-changes`
> **Purpose:** Comprehensive codebase overview for developers picking up this project.

---

## 🎯 What Is This Application?

A **School Fee Management System** built for **Pakistani schools** to manage:

- **Students** — enrollment, status tracking, CNIC/B-Form records
- **Parents / Guardians** — contact info, linked to students via relationships
- **Teachers / Staff** — profiles, qualifications, salary info
- **Fee Structure** — fee types with per-class overrides (e.g., different tuition per grade)
- **Invoicing** — one invoice per student per month, with line-item breakdowns
- **Payments** — track partial/full payments against invoices, auto-balance calculation
- **Dashboard** — stats, charts, recent invoices at a glance

**Currency:** PKR (Pakistani Rupees) | **ID Format:** CNIC/B-Form (XXXXX-XXXXXXX-X)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  React 18 + Vite + Tailwind CSS + React Router 6        │
│  Port: 5173  →  proxies /api/* to backend:8000           │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (Axios + cookies)
┌──────────────────────▼──────────────────────────────────┐
│                    BACKEND (FastAPI)                      │
│  FastAPI + SQLAlchemy (async) + Pydantic                 │
│  JWT Auth (access + refresh tokens via httpOnly cookies) │
│  Rate limiting (slowapi)                                 │
│  RSA encryption for CNIC fields                          │
│  Port: 8000                                              │
└──────────────────────┬──────────────────────────────────┘
                       │ asyncpg / psycopg2
┌──────────────────────▼──────────────────────────────────┐
│              DATABASE (PostgreSQL — Neon DB)              │
│  Migrations via Alembic                                  │
│  10 tables: users, students, parents, student_parent_rel,│
│  teachers, fee_types, fee_class_overrides, invoices,     │
│  invoice_line_items, payments                            │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
behzad_stuck/
├── school-backend/                  # FastAPI backend
│   ├── app/
│   │   ├── main.py                  # FastAPI app entry point, CORS, routers
│   │   ├── config.py                # Pydantic Settings (env vars)
│   │   ├── database.py              # SQLAlchemy async engine + session
│   │   ├── models.py                # 10 SQLAlchemy ORM models
│   │   ├── schemas.py               # Pydantic request/response schemas
│   │   ├── crud.py                  # All database operations (separated from routes)
│   │   ├── routers.py               # All API endpoints (auth, students, parents, etc.)
│   │   ├── auth.py                  # JWT tokens, password hashing, auth dependency
│   │   └── encryption.py            # RSA-OAEP encryption for CNIC/B-Form fields
│   ├── alembic/                     # Database migrations
│   │   └── versions/                # 7 migration files
│   ├── alembic.ini                  # Alembic config
│   └── requirements.txt             # Python dependencies
│
├── school-frontend/                 # React (Vite) main frontend
│   ├── src/
│   │   ├── main.jsx                 # React entry point, BrowserRouter, Toaster
│   │   ├── App.jsx                  # Root layout: sidebar, header, routes
│   │   ├── api.js                   # Axios instance + all API endpoint functions
│   │   ├── index.css                # Tailwind + custom component classes
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx      # Auth state, login/logout, session restore
│   │   ├── components/
│   │   │   └── UI.jsx               # Reusable UI components (Modal, Table, etc.)
│   │   └── pages/
│   │       ├── Login.jsx            # Login form
│   │       ├── Dashboard.jsx        # Stats cards + charts + recent invoices
│   │       ├── Students.jsx         # Student CRUD + parent linking
│   │       ├── Teachers.jsx         # Teacher CRUD
│   │       ├── Parents.jsx          # Parent CRUD
│   │       ├── Fees.jsx             # Fee types + class overrides
│   │       ├── Invoices.jsx         # Invoice creation + management
│   │       ├── Payments.jsx         # Payment recording
│   │       └── Users.jsx            # User management (admin only) ⚠️ NOT ROUTED
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── index.html
│
├── README.md                        # Basic setup instructions
└── PROJECT_OVERVIEW.md              # This file
```

---

## 🔧 Technology Stack

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **FastAPI** | 0.111.0 | Async REST API framework |
| **SQLAlchemy** | 2.0.30 | ORM (async with mapped_column) |
| **Alembic** | 1.13.1 | Database migrations |
| **asyncpg** | 0.29.0 | Async PostgreSQL driver |
| **psycopg2-binary** | 2.9.9 | Sync PostgreSQL driver (migrations) |
| **Pydantic** | 2.7.1 | Request/response validation |
| **pydantic-settings** | 2.2.1 | Environment variable config |
| **python-jose** | 3.3.0 | JWT token creation/verification |
| **passlib** | 1.7.4 | Password hashing (bcrypt) |
| **cryptography** | 42.0.5 | RSA encryption for CNIC fields |
| **slowapi** | 0.1.9 | Rate limiting |
| **uvicorn** | 0.29.0 | ASGI server |
| **httpx** | 0.27.0 | HTTP client (testing) |

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI framework |
| **Vite** | 8.0.14 | Build tool + dev server |
| **Tailwind CSS** | 3.4.4 | Utility-first CSS |
| **React Router DOM** | 6.23.1 | Client-side routing |
| **Axios** | 1.7.2 | HTTP client (with interceptors) |
| **Recharts** | 2.12.7 | Dashboard charts |
| **Lucide React** | 0.383.0 | Icon library |
| **React Hot Toast** | 2.4.1 | Toast notifications |
| **date-fns** | 3.6.0 | Date utilities |

### Database

- **PostgreSQL** (via Neon DB — serverless PostgreSQL)
- **10 tables** with proper foreign keys, cascades, and unique constraints
- **Alembic** for version-controlled migrations (7 migration files)

---

## 🗃️ Database Schema

```
┌──────────────┐     ┌────────────────────┐     ┌──────────────┐
│   students   │────<│ student_parent_rel  │>────│   parents    │
│──────────────│     │────────────────────│     │──────────────│
│ id           │     │ student_id (FK)    │     │ id           │
│ first_name   │     │ parent_id (FK)     │     │ guardian_name│
│ last_name    │     │ relationship       │     │ cnic (enc)   │
│ cnic_bform   │     └────────────────────┘     │ cnic_hash    │
│ cnic_bform_h │                                  │ contact_no   │
│ dob          │     ┌──────────────┐            │ whatsapp_no  │
│ admission_dt │     │   teachers   │            │ address      │
│ current_class│     │──────────────│            └──────────────┘
│ status       │     │ id           │
└──────┬───────┘     │ first_name   │     ┌──────────────────┐
       │             │ last_name    │     │    fee_types      │
       │             │ email        │     │──────────────────│
       │             │ phone        │     │ id               │
       │             │ subject      │     │ fee_name         │
       │             │ qualification│     │ default_amount   │
       │             │ hire_date    │     │ is_active        │
       │             │ salary       │     └────────┬─────────┘
       │             │ status       │              │
       │             └──────────────┘              │
       │                                           │
       ▼                                           ▼
┌──────────────────┐              ┌────────────────────────────┐
│    invoices       │              │   fee_class_overrides       │
│──────────────────│              │────────────────────────────│
│ id               │              │ fee_type_id (FK)           │
│ student_id (FK)  │              │ class_name                 │
│ billing_month    │              │ amount                     │
│ due_date         │              └────────────────────────────┘
│ status           │
└────────┬─────────┘
         │
         ├─────────────────────────────┐
         ▼                             ▼
┌─────────────────────┐    ┌─────────────────────┐
│ invoice_line_items  │    │      payments        │
│─────────────────────│    │─────────────────────│
│ invoice_id (FK)     │    │ invoice_id (FK)     │
│ fee_type_id (FK)    │    │ amount_paid         │
│ amount              │    │ payment_date        │
└─────────────────────┘    │ notes               │
                           └─────────────────────┘

┌──────────────┐
│    users      │
│──────────────│
│ id           │
│ username     │
│ email        │
│ hashed_pwd   │
│ full_name    │
│ is_active    │
└──────────────┘
```

**Key Design Decisions:**
- One invoice per student per month (enforced by unique constraint)
- `invoice_line_items` stores per-fee breakdown (tuition, library, etc.)
- Invoice status: `pending` → `partial` → `paid` (auto-calculated)
- Siblings derived from shared parents (no extra table)
- Balance always derived: `total_amount - SUM(payments)`
- CNIC/B-Form encrypted with RSA-OAEP + stored hash for uniqueness checks

---

## 🔐 Authentication & Security

### Auth Flow
1. **Login** → `POST /api/v1/auth/login` → validates credentials → sets `access_token` + `refresh_token` as httpOnly cookies
2. **Access token** expires in 30 min (short-lived)
3. **Refresh token** expires in 7 days (long-lived)
4. **401 intercepted** → frontend auto-refreshes via `POST /api/v1/auth/refresh` → retries original request
5. **Logout** → revokes refresh token, deletes cookies

### Security Features
- ✅ RSA-OAEP encryption for CNIC/B-Form (sensitive PII)
- ✅ SHA-256 hash for CNIC deduplication (avoids double-encrypt comparison)
- ✅ Rate limiting on login (5 attempts/minute per IP)
- ✅ httpOnly cookies (not accessible via JavaScript)
- ✅ Password hashing with bcrypt
- ✅ CORS configured for specific origins
- ✅ API docs hidden in production (`docs_url=None` when `DEBUG=False`)

---

## 📡 API Endpoints

All endpoints are prefixed with `/api/v1`.

| Module | Method | Path | Auth | Description |
|--------|--------|------|------|-------------|
| **Auth** | POST | `/auth/login` | ❌ | Login (rate limited) |
| | POST | `/auth/refresh` | ❌ | Refresh access token |
| | POST | `/auth/logout` | ✅ | Logout + revoke refresh |
| | GET | `/auth/me` | ✅ | Current user profile |
| | PATCH | `/auth/me/profile` | ✅ | Update own profile |
| **Students** | GET | `/students` | ✅ | List (filter by status, search) |
| | POST | `/students` | ✅ | Create student |
| | GET | `/students/{id}` | ✅ | Detail with parents |
| | PATCH | `/students/{id}` | ✅ | Update student |
| | DELETE | `/students/{id}` | ✅ | Delete student |
| | GET | `/students/{id}/siblings` | ✅ | Get siblings |
| | POST | `/students/{id}/parents` | ✅ | Link parent |
| | DELETE | `/students/{id}/parents/{pid}` | ✅ | Unlink parent |
| **Parents** | GET | `/parents` | ✅ | List (search by name/phone) |
| | POST | `/parents` | ✅ | Create parent |
| | GET | `/parents/{id}` | ✅ | Detail with linked students |
| | PATCH | `/parents/{id}` | ✅ | Update parent |
| | DELETE | `/parents/{id}` | ✅ | Delete parent |
| **Teachers** | GET | `/teachers` | ✅ | List (filter, search) |
| | POST | `/teachers` | ✅ | Create teacher |
| | GET | `/teachers/{id}` | ✅ | Teacher detail |
| | PATCH | `/teachers/{id}` | ✅ | Update teacher |
| | DELETE | `/teachers/{id}` | ✅ | Delete teacher |
| **Fees** | GET | `/fees` | ✅ | List fee types + overrides |
| | POST | `/fees` | ✅ | Create fee type |
| | PATCH | `/fees/{id}` | ✅ | Update fee type |
| | POST | `/fees/{id}/overrides` | ✅ | Add class override |
| **Invoices** | GET | `/invoices` | ✅ | List (filter by status, student) |
| | POST | `/invoices` | ✅ | Create invoice + line items |
| | GET | `/invoices/{id}` | ✅ | Invoice detail + financials |
| | PATCH | `/invoices/{id}/status` | ✅ | Update status |
| | DELETE | `/invoices/{id}` | ✅ | Delete invoice |
| **Payments** | GET | `/payments` | ✅ | List (filter by invoice) |
| | POST | `/payments` | ✅ | Record payment (prevents overpay) |
| | DELETE | `/payments/{id}` | ✅ | Void payment (recalculates) |
| **Dashboard** | GET | `/dashboard/stats` | ✅ | Aggregate statistics |
| | GET | `/dashboard/monthly-collections` | ✅ | Chart data |

---

## 🖥️ Frontend Pages & Features

| Page | Route | Features |
|------|-------|----------|
| **Login** | `/*` (unauthenticated) | Username/password form, show/hide password |
| **Dashboard** | `/` | 4 stat cards, 3 area charts (Recharts), recent invoices table, summary panel |
| **Students** | `/students` | CRUD table, search, status filter, pagination, inline status change, link/unlink parents, view siblings, detail modal |
| **Teachers** | `/teachers` | CRUD table, search, status filter, pagination, detail modal |
| **Parents** | `/parents` | CRUD table, search, pagination, view linked students, detail modal |
| **Fees** | `/fees` | Fee type list with expandable class overrides, create/edit/override |
| **Invoices** | `/invoices` | Invoice list, create with line items, status badges, detail view, delete |
| **Payments** | `/payments` | Payment recording against invoices |
| **Users** | `/users` ⚠️ | Admin user management, role toggle, password reset |

### UI Design System
- **Theme:** Teal/green gradient with dark sidebar
- **Components:** Floating sidebar, glassmorphism topbar, card-based layout
- **Badges:** Color-coded status (active=teal, pending=amber, paid=emerald, overdue=red)
- **Animations:** Fade-in, slide-up transitions
- **Responsive:** Mobile sidebar toggle, responsive grids

---

## ⚠️ BROKEN LOGIC & Issues Found

### 🔴 Critical Issues

1. **`Users.jsx` page exists but has NO ROUTE in `App.jsx`**
   - File: `school-frontend/src/pages/Users.jsx` exists
   - File: `school-frontend/src/App.jsx` — no `<Route path="/users" ...>` entry
   - The Users page is completely inaccessible from the UI
   - **Impact:** User management is unreachable

2. **Frontend `api.js` references backend endpoints that DON'T EXIST**
   - `usersApi.list()` → `GET /users` — **No users router in backend**
   - `usersApi.create()` → `POST /auth/register` — **No register endpoint**
   - `usersApi.updateRole()` → `PATCH /users/{id}/role` — **No role endpoint**
   - `usersApi.resetPassword()` → `PATCH /users/{id}/password` — **No password reset**
   - **Impact:** Users page would throw errors on every action

3. **Hardcoded credentials in source code** 🚨
   - `school-frontend/src/contexts/AuthContext.jsx` line: `await api.post('/auth/login', { username: 'muhammadnawaz', password: '12345' })`
   - `school-frontend/src/pages/Login.jsx` line: `useState('muhammadnawaz')` and `useState('12345')`
   - **Security risk:** Credentials committed to git

### 🟡 Medium Issues

4. **In-memory token revocation** (`auth.py` — `_revoked_tokens: set`)
   - Token blacklist stored in a Python `set` — lost on server restart
   - **Impact:** Revoked tokens become valid again after restart

5. **Dashboard has hardcoded fake trend percentages**
   - `Dashboard.jsx`: `trend: '+12%'`, `trend: '+8%'`, `trend: '+15%'`, `trend: '-3%'`
   - These are static, not computed from actual data
   - **Impact:** Misleading metrics

6. **Dashboard charts use synthetic data for green/gray series**
   - `chartGreen = chartData.map(d => ({ ...d, amount: Math.round(d.amount * 0.7) }))`
   - `chartGray = chartData.map(d => ({ ...d, amount: Math.round(d.amount * 0.85) }))`
   - Only the teal chart uses real data; others are scaled copies
   - **Impact:** Charts are misleading/decorative, not informative

7. **No backend role-based access control (RBAC)**
   - Frontend `Users.jsx` checks `user?.role !== 'admin'` but backend has no `role` column on `User` model
   - Backend has no middleware/dependency to enforce admin-only routes
   - **Impact:** Any authenticated user could hit admin endpoints if they existed

8. **Parents search description is misleading**
   - `Parents.jsx` search placeholder says "Search by name or phone..."
   - Backend `get_parents` search only queries `guardian_name`, `contact_no`, `whatsapp_no`
   - CNIC is NOT searchable (it's encrypted)
   - **Impact:** Users expect CNIC search but it won't work

### 🟢 Minor Issues

9. **Dashboard "View All" button does nothing**
   - Button exists in `Dashboard.jsx` but has no `onClick` handler

10. **Dashboard "Projects" label is misleading**
    - The recent invoices table header says "Projects" — should say "Recent Invoices"

11. **Progress bars in dashboard are hardcoded**
    - `width: '72%'`, `width: '65%'`, `width: '58%'` — not computed from data

12. **No delete confirmation for fee types**
    - Fee types can't be deleted at all (no delete endpoint or button)

13. **No error boundary in React**
    - Unhandled errors will crash the entire app

---

## 👨‍💻 What Was the Original Coder Building?

Based on the codebase analysis, the original developer ("my-friend" / behzad) was building a **comprehensive school fee management system** with these goals:

### ✅ What They Successfully Built
1. **Complete backend API** — FastAPI with async SQLAlchemy, proper separation (models/schemas/crud/routers)
2. **10-table database schema** — Well-designed with proper relationships, cascades, and constraints
3. **JWT authentication** — Access + refresh token flow with httpOnly cookies
4. **RSA encryption** — For sensitive CNIC/B-Form fields (privacy compliance)
5. **React frontend** — 7 working pages with CRUD operations
6. **Dashboard with charts** — Using Recharts for data visualization
7. **Invoice system** — One invoice per student per month with line items
8. **Payment tracking** — With automatic balance calculation and overpayment prevention
9. **Alembic migrations** — 7 migration files for schema evolution
10. **Rate limiting** — On login endpoint

### 🚧 Where They Got Stuck
1. **User management incomplete** — `Users.jsx` was built but never wired up (no route, no backend endpoints)
2. **Backend users router missing** — The `api.js` references endpoints that were never implemented
3. **Dashboard polish** — Charts use fake data, progress bars are hardcoded
4. **No testing** — Zero test files in the entire project
5. **Security cleanup needed** — Hardcoded credentials, in-memory token revocation
6. **Role system incomplete** — Frontend has admin/staff roles but backend `User` model has no `role` column

---

## 🎨 Theme & Design System

### Color Palette
- **Primary:** Teal gradient (`#0f766e` → `#0d9488` → `#14b8a6`)
- **Background:** Light gray (`#e8ecf1`)
- **Sidebar:** Dark teal gradient (`#0a2e2e` → `#0f4f4f`)
- **Cards:** White with subtle borders and shadows
- **Text:** Gray scale (`#1e293b` primary, `#9ca3af` secondary)

### Component Classes (defined in `index.css`)
- `.card` — White rounded card with border
- `.card-hover` — Card with hover lift effect
- `.btn-primary` — Teal gradient button with shadow
- `.btn-secondary` — White outline button
- `.btn-danger` — Red danger button
- `.input` — Styled form inputs
- `.badge-*` — Status badges (active, pending, paid, overdue, etc.)
- `.sidebar-floating` — Dark floating sidebar with glow
- `.sidebar-link` / `.sidebar-link-active` — Nav items with active indicator

### Animations
- `fadeIn` — Subtle fade-up entrance
- `slideUp` — Scale-up entrance
- `pageEnter` — Page transition animation

---

## 📋 Checklist for Next Developer

### Must Fix
- [ ] Add `<Route path="/users" element={<Users />} />` to `App.jsx`
- [ ] Create backend `/api/v1/users` router with list, create, role update, password reset
- [ ] Add `role` column to `User` model + migration
- [ ] Remove hardcoded credentials from `AuthContext.jsx` and `Login.jsx`
- [ ] Replace in-memory token revocation with Redis or database-backed solution

### Should Fix
- [ ] Compute dashboard trend percentages from actual data
- [ ] Replace synthetic chart data with real metrics
- [ ] Add backend RBAC middleware for admin-only endpoints
- [ ] Add error boundary component in React
- [ ] Add "View All" navigation to invoices page from dashboard

### Nice to Have
- [ ] Add unit tests (pytest for backend, vitest for frontend)
- [ ] Add CNIC search for parents (decrypt-and-compare or maintain search index)
- [ ] Add fee type deletion capability
- [ ] Add loading skeletons instead of spinners
- [ ] Add dark mode support
- [ ] Add export/print functionality for invoices

---

## 🚀 Quick Start

### Backend
```bash
cd school-backend
pip install -r requirements.txt
# Configure .env with DATABASE_URL, SECRET_KEY, RSA keys
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd school-frontend
npm install
npm run dev    # Opens at http://localhost:5173
```

### Default Login
- **Username:** `muhammadnawaz`
- **Password:** `12345`
- ⚠️ These are hardcoded — change immediately in production

---

*This overview was generated to help developers understand the codebase quickly. For setup details, see `README.md`.*
