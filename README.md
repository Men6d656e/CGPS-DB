# 📚 School Management System

> **Full-stack school fee management system** for Pakistani schools
> **Branch:** `my-changes` | **Last Updated:** 2026-08-05

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
│   │   ├── crud.py                  # All database operations
│   │   ├── routers.py               # All API endpoints
│   │   ├── auth.py                  # JWT tokens, password hashing
│   │   └── encryption.py            # RSA-OAEP encryption for CNIC fields
│   ├── alembic/                     # Database migrations
│   │   └── versions/                # 7 migration files
│   ├── scripts/                     # Utility scripts
│   ├── requirements.txt             # Python dependencies
│   └── .env.example                 # Environment variable template
│
├── school-frontend/                 # React (Vite) main frontend
│   ├── src/
│   │   ├── main.jsx                 # React entry point
│   │   ├── App.jsx                  # Root layout: sidebar, header, routes
│   │   ├── api.js                   # Axios instance + API endpoints
│   │   ├── index.css                # Tailwind + custom component classes
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx      # Auth state, login/logout
│   │   ├── components/
│   │   │   └── UI.jsx               # Reusable UI components
│   │   └── pages/
│   │       ├── Login.jsx            # Login form
│   │       ├── Dashboard.jsx        # Stats cards + charts
│   │       ├── Students.jsx         # Student CRUD
│   │       ├── Teachers.jsx         # Teacher CRUD
│   │       ├── Parents.jsx          # Parent CRUD
│   │       ├── Fees.jsx             # Fee types + class overrides
│   │       ├── Invoices.jsx         # Invoice creation + management
│   │       ├── Payments.jsx         # Payment recording
│   │       └── Users.jsx            # User management (admin only)
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── index.html
│
├── SPEC/                            # Specifications
│   └── SPEC1.md                     # Phase improvement plan
│
├── docs/                            # Documentation
│   └── (phase docs will be added)
│
├── README.md                        # This file
├── PROJECT_OVERVIEW2.md             # Comprehensive codebase analysis
└── ProjectOverview.md               # Original project overview
```

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
npm install --legacy-peer-deps
npm run dev    # Opens at http://localhost:5173
```

### Default Login
- **Username:** `muhammadnawaz`
- **Password:** `12345`
- ⚠️ These are hardcoded — change immediately in production

---

## 📋 Improvement Plan (SPEC1)

See [SPEC/SPEC1.md](SPEC/SPEC1.md) for the detailed phased improvement plan.

### Current Phases

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1** | Critical Security & Core Fixes | ⏳ Pending |
| **Phase 2** | User Management System | ⏳ Pending |
| **Phase 3** | Dashboard Improvements | ⏳ Pending |
| **Phase 4** | Frontend Polish & Error Handling | ⏳ Pending |
| **Phase 5** | Testing & Documentation | ⏳ Pending |
| **Phase 6** | Advanced Features | ⏳ Pending |

### Phase Workflow

Each phase follows this workflow:
1. **Code** — Implement the changes
2. **Test** — Run backend (pytest) and frontend (npm test) tests
3. **Document** — Create phase documentation in `/docs`
4. **Update README** — Add phase summary to root README.md
5. **Commit** — Stage and commit with descriptive message
6. **Push** — Push to `my-changes` branch

---

## 🔧 Technology Stack

### Backend
- **FastAPI** 0.111.0 — Async REST API framework
- **SQLAlchemy** 2.0.30 — ORM (async with mapped_column)
- **Alembic** 1.13.1 — Database migrations
- **asyncpg** 0.29.0 — Async PostgreSQL driver
- **Pydantic** 2.7.1 — Request/response validation
- **python-jose** 3.3.0 — JWT token creation/verification
- **passlib** 1.7.4 — Password hashing (bcrypt)
- **cryptography** 42.0.5 — RSA encryption for CNIC fields
- **slowapi** 0.1.9 — Rate limiting

### Frontend
- **React** 18.3.1 — UI framework
- **Vite** 8.0.14 — Build tool + dev server
- **Tailwind CSS** 3.4.4 — Utility-first CSS
- **React Router DOM** 6.23.1 — Client-side routing
- **Axios** 1.7.2 — HTTP client (with interceptors)
- **Recharts** 2.12.7 — Dashboard charts
- **Lucide React** 0.383.0 — Icon library
- **React Hot Toast** 2.4.1 — Toast notifications

### Database
- **PostgreSQL** (via Neon DB — serverless PostgreSQL)
- **10 tables** with proper foreign keys, cascades, and unique constraints
- **Alembic** for version-controlled migrations

---

## 📡 API Endpoints

All endpoints are prefixed with `/api/v1`.

| Module | Method | Path | Auth | Description |
|--------|--------|------|------|-------------|
| **Auth** | POST | `/auth/login` | ❌ | Login (rate limited) |
| | POST | `/auth/refresh` | ❌ | Refresh access token |
| | POST | `/auth/logout` | ✅ | Logout + revoke refresh |
| | GET | `/auth/me` | ✅ | Current user profile |
| **Students** | GET | `/students` | ✅ | List (filter by status, search) |
| | POST | `/students` | ✅ | Create student |
| | GET | `/students/{id}` | ✅ | Detail with parents |
| | PATCH | `/students/{id}` | ✅ | Update student |
| | DELETE | `/students/{id}` | ✅ | Delete student |
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
| | DELETE | `/invoices/{id}` | ✅ | Delete invoice |
| **Payments** | GET | `/payments` | ✅ | List (filter by invoice) |
| | POST | `/payments` | ✅ | Record payment (prevents overpay) |
| | DELETE | `/payments/{id}` | ✅ | Void payment (recalculates) |
| **Dashboard** | GET | `/dashboard/stats` | ✅ | Aggregate statistics |
| | GET | `/dashboard/monthly-collections` | ✅ | Chart data |

---

## 📚 Documentation

- [PROJECT_OVERVIEW2.md](PROJECT_OVERVIEW2.md) — Comprehensive codebase analysis
- [ProjectOverview.md](ProjectOverview.md) — Original project overview
- [SPEC/SPEC1.md](SPEC/SPEC1.md) — Phased improvement plan
- [docs/](docs/) — Phase documentation (updated as phases complete)

---

## 🔄 Development Workflow

### Branch Strategy
- **`main`** — Production-ready code
- **`my-changes`** — Active development branch (all work happens here)

### Commit Convention
```
feat(phase1): critical security and core fixes
feat(phase2): complete user management system
docs(phase1): add security fixes documentation
test(phase1): add backend security tests
```

### Pull Requests
- Create PRs from `my-changes` to `main`
- Include phase documentation in PR description
- Ensure all tests pass before merge

---

## 🚨 Known Issues

See [PROJECT_OVERVIEW2.md](PROJECT_OVERVIEW2.md) for the complete list of issues.

### Critical Issues (Phase 1)
- Hardcoded credentials in source code
- In-memory token revocation (lost on restart)
- Missing seed script for admin user

### Missing Features (Phase 2)
- Users page has no route in App.jsx
- Backend users router doesn't exist
- No role-based access control

### UI Issues (Phase 3-4)
- Dashboard uses fake/synthetic data
- No error boundary in React
- Missing loading states

---

## 📞 Support

For questions or issues:
- Check the [PROJECT_OVERVIEW2.md](PROJECT_OVERVIEW2.md) for detailed analysis
- Review [SPEC/SPEC1.md](SPEC/SPEC1.md) for the improvement plan
- Open an issue on GitHub

---

*Last updated: 2026-08-05 | Branch: my-changes*
