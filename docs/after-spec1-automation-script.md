# 🚀 After-SPEC1 Automation Script

> **Created:** 2026-08-06 | **Branch:** `my-changes`
> **Purpose:** Makefile-based automation for development, testing, and deployment workflows

---

## 🎯 Overview

After completing all 6 SPEC1 phases, a comprehensive **Makefile** was created to automate common development tasks. This script provides a unified interface for managing both frontend and backend services, running tests, building for production, and managing the database.

---

## 📋 Available Commands

### Run Commands

| Command | Description |
|---------|-------------|
| `make run-cgps-dev` | Run application in development mode (background) |
| `make run-cgps-pro` | Run application in production mode (4 workers) |
| `make stop-cgps` | Stop all running services |
| `make restart` | Restart services in current mode |
| `make status` | Check service status (PID + port detection) |

### Setup & Maintenance

| Command | Description |
|---------|-------------|
| `make setup` | Install all dependencies (frontend + backend) |
| `make setup-frontend` | Install frontend dependencies only |
| `make setup-backend` | Install backend dependencies only |
| `make clean` | Clean build artifacts and temporary files |
| `make clean-all` | Clean everything (including node_modules) |

### Build Commands

| Command | Description |
|---------|-------------|
| `make build` | Build frontend for production |
| `make build-frontend` | Build frontend only |
| `make preview` | Preview production build locally |

### Test Commands

| Command | Description |
|---------|-------------|
| `make test` | Run all tests (frontend + backend) |
| `make test-frontend` | Run frontend tests only |
| `make test-backend` | Run backend tests only |
| `make lint` | Run linters on codebase |

### Monitoring

| Command | Description |
|---------|-------------|
| `make logs` | View application logs |
| `make logs-follow` | Follow logs in real-time |
| `make health` | Check backend health endpoint |

### Database

| Command | Description |
|---------|-------------|
| `make migrate` | Run database migrations |
| `make migrate-rollback` | Rollback last migration |
| `make seed` | Seed database with admin user |

---

## 🔧 Technical Implementation

### Key Features

1. **Process Detachment with `setsid`**
   - Uses `setsid` to properly detach background processes from Make's shell lifecycle
   - Ensures services survive after the Make command completes
   - Each process gets its own session ID for reliable tracking

2. **Python Virtual Environment Activation**
   - All backend commands automatically activate `.venv/bin/activate`
   - Ensures uvicorn, alembic, and other Python packages are available
   - Works with both development and production modes

3. **PID File Management**
   - PID files stored in `.pids/` directory
   - Frontend PID: `.pids/frontend.pid`
   - Backend PID: `.pids/backend.pid`
   - Status command checks both PID files AND active ports

4. **Dual Status Detection**
   - Primary: Check if PID file exists and process is alive
   - Fallback: Check if port is actively listening
   - Provides accurate status even if PID tracking has issues

### Architecture

```
Makefile
├── Configuration
│   ├── FRONTEND_DIR = school-frontend
│   ├── BACKEND_DIR = school-backend
│   ├── LOG_DIR = logs
│   └── PID_DIR = .pids
│
├── Run Commands
│   ├── stop-cgps (cleanup first)
│   ├── mkdir -p (ensure directories)
│   ├── cd + venv + setsid + nohup (backend)
│   └── cd + setsid + nohup (frontend)
│
├── Status Detection
│   ├── Check PID files
│   ├── Check if process alive (kill -0)
│   └── Fallback: Check active ports (ss -tlnp)
│
└── Cleanup
    ├── Kill by PID
    └── Kill by process name (pkill -f)
```

---

## 🚀 Usage Examples

### Starting Development Server

```bash
# Start both frontend and backend in development mode
make run-cgps-dev

# Output:
# 🚀 Starting CGPS in Development Mode...
# ▸ Starting backend in development mode...
# ▸ Starting frontend in development mode...
# ✅ CGPS is Ready & Running!
#   🌐 Frontend: http://localhost:5173
#   🔌 Backend:  http://localhost:8000
#   📚 API Docs: http://localhost:8000/docs
```

### Checking Service Status

```bash
make status

# Output:
# 📊 CGPS Service Status
#   ● Backend:    Running (port 8000 active)
#   ● Frontend:   Running (port 5173 active)
```

### Stopping Services

```bash
make stop-cgps

# Output:
# 🛑 Stopping CGPS Services...
# ▸ Cleaning up any orphaned processes...
# ✅ All Services Stopped
```

### Running Tests

```bash
# Run all tests
make test

# Run only backend tests
make test-backend

# Run only frontend tests
make test-frontend
```

### Database Management

```bash
# Run migrations
make migrate

# Seed admin user
make seed

# Rollback last migration
make migrate-rollback
```

---

## 🐛 Troubleshooting

### Issue: "Directory nonexistent" Error

**Cause:** The `.pids/` or `logs/` directory doesn't exist.

**Solution:** The Makefile now creates directories with `mkdir -p` before starting services. If you still see this error, manually create the directories:

```bash
mkdir -p .pids logs
```

### Issue: "uvicorn: command not found"

**Cause:** Python virtual environment is not activated.

**Solution:** The Makefile now activates `.venv/bin/activate` automatically. If uvicorn is not installed:

```bash
cd school-backend
. .venv/bin/activate
pip install -r requirements.txt
```

### Issue: Services Start But Die Immediately

**Cause:** Background processes are being killed when the shell exits.

**Solution:** The Makefile now uses `setsid` to properly detach processes. If services still die:

```bash
# Check if ports are already in use
ss -tlnp | grep -E '8000|5173'

# Kill any orphaned processes
pkill -f 'uvicorn'
pkill -f 'vite'

# Try starting again
make run-cgps-dev
```

### Issue: `make status` Shows "Stopped" But Services Are Running

**Cause:** PID files may not have been created correctly.

**Solution:** The status command now falls back to port detection. If you need PID tracking:

```bash
# Stop all services
make stop-cgps

# Clean and restart
rm -rf .pids logs
make run-cgps-dev
```

---

## 📁 Directory Structure

```
behzad_stuck/
├── Makefile              # Main automation script
├── .pids/                # Process ID files
│   ├── backend.pid       # Backend process PID
│   └── frontend.pid      # Frontend process PID
├── logs/                 # Application logs
│   ├── backend.log       # Backend output
│   └── frontend.log      # Frontend output
├── school-backend/
│   └── .venv/            # Python virtual environment
└── school-frontend/
    └── dist/             # Production build output
```

---

## 🔄 Workflow Integration

### Daily Development Workflow

```bash
# 1. Start services
make run-cgps-dev

# 2. Make changes to code...

# 3. Check logs if needed
make logs

# 4. Run tests
make test-backend

# 5. Stop services when done
make stop-cgps
```

### Production Deployment Workflow

```bash
# 1. Build frontend
make build

# 2. Run database migrations
make migrate

# 3. Seed admin user (if needed)
make seed

# 4. Start production services
make run-cgps-pro

# 5. Verify health
make health
```

### Release Workflow

```bash
# 1. Run all tests
make test

# 2. Clean build artifacts
make clean

# 3. Build for production
make build

# 4. Commit changes
git add .
git commit -m "release: version x.y.z"

# 5. Push to branch
git push origin my-changes
```

---

## 📊 Performance Notes

- **Development Mode:** Uses hot-reload for both frontend (Vite) and backend (uvicorn --reload)
- **Production Mode:** Uses 4 uvicorn workers and static frontend build
- **PID Tracking:** Dual detection (PID files + port scanning) ensures accurate status
- **Process Cleanup:** `pkill -f` patterns catch any orphaned processes

---

## 🎯 Benefits

1. **Consistency** — Same commands work across all environments
2. **Reliability** — Proper process detachment ensures services stay running
3. **Observability** — Centralized logs and status checking
4. **Efficiency** — Single command to start/stop/test the entire stack
5. **Safety** — Automatic cleanup prevents port conflicts and zombie processes

---

## 📚 Related Documentation

- [Phase 1: Security Fixes](phase1-security-fixes.md)
- [Phase 2: User Management](phase2-user-management.md)
- [Phase 3: Dashboard](phase3-dashboard-improvements.md)
- [Phase 4: Frontend Polish](phase4-frontend-polish.md)
- [Phase 5: Testing](phase5-testing-documentation.md)
- [Phase 6: Advanced Features](phase6-advanced-features.md)
- [SPEC1 Improvement Plan](../SPEC/SPEC1.md)

---

*This document describes the automation infrastructure created after completing all SPEC1 phases.*
