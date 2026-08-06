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
│   │   ├── encryption.py            # RSA-OAEP encryption for CNIC fields
│   │   └── ratelimit.py             # Shared SlowAPI limiter instance
│   ├── alembic/                     # Database migrations
│   │   └── versions/                # 8 migration files
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
│   ├── hooks/useDebounce.js         # Debounced value hook
│   ├── eslint.config.js             # ESLint flat config
│   ├── .prettierrc                  # Prettier config
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── index.html
│
├── .github/workflows/ci.yml         # GitHub Actions CI (pytest + vitest + lint + build)
│
├── SPEC/                            # Specifications
│   ├── SPEC1.md                     # Phase improvement plan (original 6 phases)
│   ├── SPEC2.md                     # Reliability & quality plan (deep review fixes)
│   └── SPEC3.md                     # Shadcn/ui migration plan (preset b7Br6guwa)
│
├── docs/                            # Documentation
│   ├── phase1-security-fixes.md     # Phase 1: Security & core fixes
│   ├── phase2-user-management.md    # Phase 2: User management
│   ├── phase3-dashboard-improvements.md  # Phase 3: Dashboard
│   ├── phase4-frontend-polish.md    # Phase 4: Frontend polish
│   ├── phase5-testing-documentation.md   # Phase 5: Testing
│   ├── phase6-advanced-features.md  # Phase 6: Advanced features
│   └── after-spec1-automation-script.md  # Makefile automation docs
│
├── .opencode/                       # OpenCode agency agents library (269 subagents)
│   └── agents/                      # One Markdown definition per agent
├── Makefile                         # Development automation script
├── README.md                        # This file
├── PROJECT_OVERVIEW2.md             # Codebase analysis (SPEC1 source)
├── project-overview3.md             # Deep codebase review (SPEC2 source)
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
npm install
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
| **Phase 1** | Critical Security & Core Fixes | ✅ Complete |
| **Phase 2** | User Management System | ✅ Complete |
| **Phase 3** | Dashboard Improvements | ✅ Complete |
| **Phase 4** | Frontend Polish & Error Handling | ✅ Complete |
| **Phase 5** | Testing & Documentation | ✅ Complete |
| **Phase 6** | Advanced Features | ✅ Complete |

### Phase Workflow

Each phase follows this workflow:
1. **Code** — Implement the changes
2. **Test** — Run backend (pytest) and frontend (npm test) tests
3. **Document** — Create phase documentation in `/docs`
4. **Update README** — Add phase summary to root README.md
5. **Commit** — Stage and commit with descriptive message
6. **Push** — Push to `my-changes` branch

---

## 🔍 Reliability Plan (SPEC2)

See [SPEC/SPEC2.md](SPEC/SPEC2.md) for the detailed plan derived from the deep codebase review ([project-overview3.md](project-overview3.md)). It fixes what SPEC1 left broken or incomplete: the Users page crash, dead dark-mode toggle, un-runnable test suites, enum case mismatch, and dead token revocation.

### Current Phases

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1** | Critical Runtime Fixes | ✅ Complete |
| **Phase 2** | Restore Broken Testing Infrastructure | ✅ Complete |
| **Phase 3** | Security Hardening | ✅ Complete |
| **Phase 4** | Data Integrity & Indexes | ✅ Complete |
| **Phase 5** | Working Dark / Light Theme | ✅ Complete |
| **Phase 6** | Code Quality & Performance | ✅ Complete |

---

## 🎨 Shadcn/UI Migration (SPEC3)

See [SPEC/SPEC3.md](SPEC/SPEC3.md) for the plan to replace the raw/custom UI with **shadcn/ui** components initialized from the selected preset (`b7Br6guwa` — typography, theme colors, radius). It replaces hand-rolled components and custom CSS classes (`.btn-*`, `.input`, `.card`, `.badge-*`, `.th/.td`) with shadcn components (`Button`, `Input`, `Select`, `Card`, `Dialog`, `Table`, `Badge`, `sonner`, …). `src/components/UI.jsx` is **kept** as the app's composition layer — every export inside it renders real shadcn/ui primitives (see [SPEC4](SPEC/SPEC4.md), which formalizes it and consolidates the design system).

### Current Phases

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1** | Shadcn Foundation (init with preset) | ✅ Complete |
| **Phase 2** | Forms & Controls Migration | ✅ Complete |
| **Phase 3** | Data Display Migration | ✅ Complete |
| **Phase 4** | Overlays & Feedback Migration | ✅ Complete |
| **Phase 5** | App Shell & Theme Polish | ✅ Complete |
| **Phase 6** | Cleanup & Final Verification | ✅ Complete |

### Design System Consolidation (SPEC4)

See [SPEC/SPEC4.md](SPEC/SPEC4.md) — final design-system pass on the frontend:
semantic color tokens (`--accent-brand`, `--success`, `--warning`, `--partial`,
`--info`), full `font-display`/`font-body` adoption, and radius normalization.

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1** | Tokenize theme (index.css, tailwind.config, deps) | ✅ Complete |
| **Phase 2** | Typography consolidation (font-display/body/mono) | ✅ Complete |
| **Phase 3** | Raw-color → semantic-token migration | ✅ Complete |
| **Phase 4** | Radius normalization (`--radius` 0.5rem) | ✅ Complete |
| **Phase 5** | Component-layer finalization (a11y, focus, docs) | ✅ Complete |
| **Phase 6** | Final gate (tests, lint, audits) | ⏳ In Progress |

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
- **Vite** 7.3.6 — Build tool + dev server
- **shadcn/ui** — Component library (new-york style, neutral base, Radix) initialized from preset `b7Br6guwa`
- **Tailwind CSS** 3.4.4 — Utility-first CSS
- **React Router DOM** 6.23.1 — Client-side routing
- **Axios** 1.7.2 — HTTP client (with interceptors)
- **Recharts** 2.12.7 — Dashboard charts
- **Lucide React** 0.383.0 — Icon library
- **Radix UI** — Accessible primitives (dialog, select, dropdown, tooltip, …)
- **Sonner** — Toast notifications

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

### Core Documentation
- [PROJECT_OVERVIEW2.md](PROJECT_OVERVIEW2.md) — Comprehensive codebase analysis
- [project-overview3.md](project-overview3.md) — Deep codebase review & reliability audit (SPEC2 source)
- [ProjectOverview.md](ProjectOverview.md) — Original project overview
- [SPEC/SPEC1.md](SPEC/SPEC1.md) — Phased improvement plan (original 6 phases)
- [SPEC/SPEC2.md](SPEC/SPEC2.md) — Reliability & quality plan (deep review fixes)
- [SPEC/SPEC3.md](SPEC/SPEC3.md) — Shadcn/ui migration plan (preset `b7Br6guwa`)

### Phase Documentation
Each phase includes detailed implementation notes, testing results, and commit history:

| Phase | File | Description |
|-------|------|-------------|
| Phase 1 | [docs/phase1-security-fixes.md](docs/phase1-security-fixes.md) | Critical security & core fixes |
| Phase 2 | [docs/phase2-user-management.md](docs/phase2-user-management.md) | User management system |
| Phase 3 | [docs/phase3-dashboard-improvements.md](docs/phase3-dashboard-improvements.md) | Dashboard with real data |
| Phase 4 | [docs/phase4-frontend-polish.md](docs/phase4-frontend-polish.md) | Frontend polish & error handling |
| Phase 5 | [docs/phase5-testing-documentation.md](docs/phase5-testing-documentation.md) | Testing & documentation |
| Phase 6 | [docs/phase6-advanced-features.md](docs/phase6-advanced-features.md) | Advanced features & dark mode |
| SPEC3 P1 | [docs/phase1-shadcn-foundation.md](docs/phase1-shadcn-foundation.md) | Shadcn foundation with preset `b7Br6guwa` |
| SPEC3 P2 | [docs/phase2-forms-controls.md](docs/phase2-forms-controls.md) | Forms & controls → shadcn Button/Input/Select/Switch |
| SPEC3 P3 | [docs/phase3-data-display.md](docs/phase3-data-display.md) | Data display → shadcn Table/Badge/Pagination/Card/Skeleton |
| SPEC3 P4 | [docs/phase4-overlays-feedback.md](docs/phase4-overlays-feedback.md) | Overlays & feedback → Dialog/AlertDialog/sonner |
| SPEC3 P5 | [docs/phase5-app-shell.md](docs/phase5-app-shell.md) | App shell & theme polish → tokens + shadcn components |
| SPEC3 P6 | [docs/phase6-shadcn-cleanup.md](docs/phase6-shadcn-cleanup.md) | Cleanup & final verification (7 tests) |

### Automation & Tools
- [docs/after-spec1-automation-script.md](docs/after-spec1-automation-script.md) — Makefile automation script documentation
- [docs/after-spec3-add-agency-agents-for-opencode.md](docs/after-spec3-add-agency-agents-for-opencode.md) — OpenCode agency agents library (269 subagents)

---

## 🤖 Automation Script

After completing all SPEC1 phases, a **Makefile** was created for unified development workflow:

```bash
# Quick start
make run-cgps-dev    # Start in development mode
make status          # Check service status
make stop-cgps       # Stop all services

# Full workflow
make test            # Run all tests
make build           # Build for production
make migrate         # Run database migrations
make seed            # Seed admin user
```

See [docs/after-spec1-automation-script.md](docs/after-spec1-automation-script.md) for complete documentation.

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
