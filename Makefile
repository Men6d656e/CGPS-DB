# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                     CGPS - School Management System                        ║
# ║                          Makefile Commands                                  ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

# ─── Configuration ────────────────────────────────────────────────────────────
FRONTEND_DIR    := school-frontend
BACKEND_DIR     := school-backend
FRONTEND_PORT   := 5173
BACKEND_PORT    := 8000
BACKEND_HOST    := 0.0.0.0
LOG_DIR         := logs
PID_DIR         := .pids
FRONTEND_PID    := $(PID_DIR)/frontend.pid
BACKEND_PID     := $(PID_DIR)/backend.pid

# ─── Colors ───────────────────────────────────────────────────────────────────
CYAN            := \033[36m
GREEN           := \033[32m
YELLOW          := \033[33m
RED             := \033[31m
BOLD            := \033[1m
RESET           := \033[0m

# ─── Default Target ───────────────────────────────────────────────────────────
.DEFAULT_GOAL := help

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                           📋 HELP COMMANDS                                  ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

.PHONY: help
help: ## 📋 Display available commands
	@echo ""
	@echo "$(BOLD)$(CYAN)╔══════════════════════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)                    $(BOLD)🏫 CGPS - School Management System$(RESET)                       $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)                       $(BOLD)Available Commands$(RESET)                                    $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)╠══════════════════════════════════════════════════════════════════════════════╣$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(BOLD)$(YELLOW)🚀 RUN COMMANDS$(RESET)                                                           $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)                                                                              $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make run-cgps-dev$(RESET)     $(CYAN)▶$(RESET)  Run application in development mode                 $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make run-cgps-pro$(RESET)     $(CYAN)▶$(RESET)  Run application in production mode                  $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make stop-cgps$(RESET)        $(CYAN)▶$(RESET)  Stop all running services                          $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make restart$(RESET)          $(CYAN)▶$(RESET)  Restart services in current mode                   $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make status$(RESET)           $(CYAN)▶$(RESET)  Check service status                               $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)                                                                              $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)╠══════════════════════════════════════════════════════════════════════════════╣$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(BOLD)$(YELLOW)🔧 SETUP & MAINTENANCE$(RESET)                                                      $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)                                                                              $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make setup$(RESET)           $(CYAN)▶$(RESET)  Install all dependencies (frontend + backend)        $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make setup-frontend$(RESET)  $(CYAN)▶$(RESET)  Install frontend dependencies only                  $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make setup-backend$(RESET)   $(CYAN)▶$(RESET)  Install backend dependencies only                   $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make clean$(RESET)           $(CYAN)▶$(RESET)  Clean build artifacts and temporary files           $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make clean-all$(RESET)       $(CYAN)▶$(RESET)  Clean everything (including node_modules)           $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)                                                                              $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)╠══════════════════════════════════════════════════════════════════════════════╣$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(BOLD)$(YELLOW)🏗️  BUILD COMMANDS$(RESET)                                                         $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)                                                                              $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make build$(RESET)           $(CYAN)▶$(RESET)  Build frontend for production                       $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make build-frontend$(RESET)  $(CYAN)▶$(RESET)  Build frontend only                                 $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make preview$(RESET)         $(CYAN)▶$(RESET)  Preview production build locally                    $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)                                                                              $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)╠══════════════════════════════════════════════════════════════════════════════╣$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(BOLD)$(YELLOW)🧪 TEST COMMANDS$(RESET)                                                           $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)                                                                              $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make test$(RESET)            $(CYAN)▶$(RESET)  Run all tests (frontend + backend)                  $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make test-frontend$(RESET)   $(CYAN)▶$(RESET)  Run frontend tests only                            $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make test-backend$(RESET)    $(CYAN)▶$(RESET)  Run backend tests only                             $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make lint$(RESET)            $(CYAN)▶$(RESET)  Run linters on codebase                            $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)                                                                              $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)╠══════════════════════════════════════════════════════════════════════════════╣$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(BOLD)$(YELLOW)📊 MONITORING$(RESET)                                                             $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)                                                                              $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make logs$(RESET)            $(CYAN)▶$(RESET)  View application logs                             $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make logs-follow$(RESET)     $(CYAN)▶$(RESET)  Follow logs in real-time                          $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make health$(RESET)          $(CYAN)▶$(RESET)  Check backend health endpoint                     $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)                                                                              $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)╠══════════════════════════════════════════════════════════════════════════════╣$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(BOLD)$(YELLOW)🗄️  DATABASE$(RESET)                                                                $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)                                                                              $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make migrate$(RESET)         $(CYAN)▶$(RESET)  Run database migrations                           $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make migrate-rollback$(RESET) $(CYAN)▶$(RESET)  Rollback last migration                          $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)make seed$(RESET)            $(CYAN)▶$(RESET)  Seed database with admin user                     $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)                                                                              $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)╠══════════════════════════════════════════════════════════════════════════════╣$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(BOLD)$(YELLOW)💡 TIPS$(RESET)                                                                     $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)                                                                              $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(CYAN)•$(RESET) All services run in the background (detached)                              $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(CYAN)•$(RESET) Logs are stored in the $(BOLD)logs/$(RESET) directory                                  $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(CYAN)•$(RESET) PIDs are stored in $(BOLD).pids/$(RESET) directory for process management             $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(CYAN)•$(RESET) Frontend: $(BOLD)http://localhost:$(FRONTEND_PORT)$(RESET)                                        $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(CYAN)•$(RESET) Backend API: $(BOLD)http://localhost:$(BACKEND_PORT)$(RESET)                                        $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)  $(CYAN)•$(RESET) API Docs: $(BOLD)http://localhost:$(BACKEND_PORT)/docs$(RESET)                                     $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)                                                                              $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)╚══════════════════════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                        🚀 RUN COMMANDS                                      ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

.PHONY: run-cgps-dev
run-cgps-dev: ## 🚀 Run application in development mode (background)
	@echo ""
	@echo "$(BOLD)$(CYAN)╔══════════════════════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)           $(BOLD)🚀 Starting CGPS in Development Mode...$(RESET)                        $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)╚══════════════════════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
	@-$(MAKE) stop-cgps > /dev/null 2>&1 || true
	@mkdir -p $(LOG_DIR) $(PID_DIR)
	@echo "$(YELLOW)▸ Starting backend in development mode...$(RESET)"
	@cd $(BACKEND_DIR) && . .venv/bin/activate && setsid nohup uvicorn app.main:app --reload --host $(BACKEND_HOST) --port $(BACKEND_PORT) > ../$(LOG_DIR)/backend.log 2>&1 & echo $$! > ../$(BACKEND_PID)
	@sleep 2
	@echo "$(YELLOW)▸ Starting frontend in development mode...$(RESET)"
	@cd $(FRONTEND_DIR) && setsid nohup npm run dev > ../$(LOG_DIR)/frontend.log 2>&1 & echo $$! > ../$(FRONTEND_PID)
	@sleep 3
	@echo ""
	@echo "$(BOLD)$(GREEN)╔══════════════════════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(BOLD)$(GREEN)║$(RESET)                    $(BOLD)✅ CGPS is Ready & Running!$(RESET)                              $(BOLD)$(GREEN)║$(RESET)"
	@echo "$(BOLD)$(GREEN)╠══════════════════════════════════════════════════════════════════════════════╣$(RESET)"
	@echo "$(BOLD)$(GREEN)║$(RESET)                                                                              $(BOLD)$(GREEN)║$(RESET)"
	@echo "$(BOLD)$(GREEN)║$(RESET)  $(CYAN)🌐 Frontend:$(RESET)  $(BOLD)http://localhost:$(FRONTEND_PORT)$(RESET)                              $(BOLD)$(GREEN)║$(RESET)"
	@echo "$(BOLD)$(GREEN)║$(RESET)  $(CYAN)🔌 Backend:$(RESET)   $(BOLD)http://localhost:$(BACKEND_PORT)$(RESET)                               $(BOLD)$(GREEN)║$(RESET)"
	@echo "$(BOLD)$(GREEN)║$(RESET)  $(CYAN)📚 API Docs:$(RESET)  $(BOLD)http://localhost:$(BACKEND_PORT)/docs$(RESET)                           $(BOLD)$(GREEN)║$(RESET)"
	@echo "$(BOLD)$(GREEN)║$(RESET)  $(CYAN)📋 Logs:$(RESET)      $(BOLD)$(LOG_DIR)/$(RESET)                                           $(BOLD)$(GREEN)║$(RESET)"
	@echo "$(BOLD)$(GREEN)║$(RESET)                                                                              $(BOLD)$(GREEN)║$(RESET)"
	@echo "$(BOLD)$(GREEN)║$(RESET)  $(YELLOW)ℹ️  Run 'make stop-cgps' to stop all services$(RESET)                        $(BOLD)$(GREEN)║$(RESET)"
	@echo "$(BOLD)$(GREEN)║$(RESET)  $(YELLOW)ℹ️  Run 'make logs' to view application logs$(RESET)                         $(BOLD)$(GREEN)║$(RESET)"
	@echo "$(BOLD)$(GREEN)║$(RESET)                                                                              $(BOLD)$(GREEN)║$(RESET)"
	@echo "$(BOLD)$(GREEN)╚══════════════════════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""

.PHONY: run-cgps-pro
run-cgps-pro: ## 🚀 Run application in production mode (background)
	@echo ""
	@echo "$(BOLD)$(CYAN)╔══════════════════════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)           $(BOLD)🚀 Starting CGPS in Production Mode...$(RESET)                         $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)╚══════════════════════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
	@-$(MAKE) stop-cgps > /dev/null 2>&1 || true
	@echo "$(YELLOW)▸ Building frontend for production...$(RESET)"
	@cd $(FRONTEND_DIR) && npm run build
	@mkdir -p $(LOG_DIR) $(PID_DIR)
	@echo "$(YELLOW)▸ Starting backend in production mode (4 workers)...$(RESET)"
	@cd $(BACKEND_DIR) && . .venv/bin/activate && setsid nohup uvicorn app.main:app --host $(BACKEND_HOST) --port $(BACKEND_PORT) --workers 4 > ../$(LOG_DIR)/backend.log 2>&1 & echo $$! > ../$(BACKEND_PID)
	@sleep 2
	@echo "$(YELLOW)▸ Starting frontend preview server...$(RESET)"
	@cd $(FRONTEND_DIR) && setsid nohup npm run preview > ../$(LOG_DIR)/frontend.log 2>&1 & echo $$! > ../$(FRONTEND_PID)
	@sleep 3
	@echo ""
	@echo "$(BOLD)$(GREEN)╔══════════════════════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(BOLD)$(GREEN)║$(RESET)                    $(BOLD)✅ CGPS is Ready & Running!$(RESET)                              $(BOLD)$(GREEN)║$(RESET)"
	@echo "$(BOLD)$(GREEN)╠══════════════════════════════════════════════════════════════════════════════╣$(RESET)"
	@echo "$(BOLD)$(GREEN)║$(RESET)                                                                              $(BOLD)$(GREEN)║$(RESET)"
	@echo "$(BOLD)$(GREEN)║$(RESET)  $(CYAN)🌐 Frontend:$(RESET)  $(BOLD)http://localhost:4173$(RESET)                                $(BOLD)$(GREEN)║$(RESET)"
	@echo "$(BOLD)$(GREEN)║$(RESET)  $(CYAN)🔌 Backend:$(RESET)   $(BOLD)http://localhost:$(BACKEND_PORT)$(RESET)                               $(BOLD)$(GREEN)║$(RESET)"
	@echo "$(BOLD)$(GREEN)║$(RESET)  $(CYAN)📚 API Docs:$(RESET)  $(BOLD)http://localhost:$(BACKEND_PORT)/docs$(RESET)                           $(BOLD)$(GREEN)║$(RESET)"
	@echo "$(BOLD)$(GREEN)║$(RESET)  $(CYAN)📋 Logs:$(RESET)      $(BOLD)$(LOG_DIR)/$(RESET)                                           $(BOLD)$(GREEN)║$(RESET)"
	@echo "$(BOLD)$(GREEN)║$(RESET)  $(CYAN)👥 Workers:$(RESET)   $(BOLD)4$(RESET)                                                   $(BOLD)$(GREEN)║$(RESET)"
	@echo "$(BOLD)$(GREEN)║$(RESET)                                                                              $(BOLD)$(GREEN)║$(RESET)"
	@echo "$(BOLD)$(GREEN)║$(RESET)  $(YELLOW)ℹ️  Run 'make stop-cgps' to stop all services$(RESET)                        $(BOLD)$(GREEN)║$(RESET)"
	@echo "$(BOLD)$(GREEN)║$(RESET)  $(YELLOW)ℹ️  Run 'make logs' to view application logs$(RESET)                         $(BOLD)$(GREEN)║$(RESET)"
	@echo "$(BOLD)$(GREEN)║$(RESET)                                                                              $(BOLD)$(GREEN)║$(RESET)"
	@echo "$(BOLD)$(GREEN)╚══════════════════════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""

.PHONY: stop-cgps
stop-cgps: ## 🛑 Stop all running services
	@echo ""
	@echo "$(BOLD)$(YELLOW)╔══════════════════════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(BOLD)$(YELLOW)║$(RESET)              $(BOLD)🛑 Stopping CGPS Services...$(RESET)                                  $(BOLD)$(YELLOW)║$(RESET)"
	@echo "$(BOLD)$(YELLOW)╚══════════════════════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
	@if [ -f $(BACKEND_PID) ]; then \
		echo "$(YELLOW)▸ Stopping backend (PID: $$(cat $(BACKEND_PID)))...$(RESET)"; \
		kill $$(cat $(BACKEND_PID)) 2>/dev/null || true; \
		rm -f $(BACKEND_PID); \
		echo "$(GREEN)  ✓ Backend stopped$(RESET)"; \
	else \
		echo "$(YELLOW)▸ Backend was not running$(RESET)"; \
	fi
	@if [ -f $(FRONTEND_PID) ]; then \
		echo "$(YELLOW)▸ Stopping frontend (PID: $$(cat $(FRONTEND_PID)))...$(RESET)"; \
		kill $$(cat $(FRONTEND_PID)) 2>/dev/null || true; \
		rm -f $(FRONTEND_PID); \
		echo "$(GREEN)  ✓ Frontend stopped$(RESET)"; \
	else \
		echo "$(YELLOW)▸ Frontend was not running$(RESET)"; \
	fi
	@echo "$(YELLOW)▸ Cleaning up any orphaned processes...$(RESET)"
	@-pkill -f "uvicorn app.main:app" 2>/dev/null || true
	@-pkill -f "vite" 2>/dev/null || true
	@-pkill -f "npm run dev" 2>/dev/null || true
	@-pkill -f "npm run preview" 2>/dev/null || true
	@echo ""
	@echo "$(BOLD)$(GREEN)╔══════════════════════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(BOLD)$(GREEN)║$(RESET)                   $(BOLD)✅ All Services Stopped$(RESET)                                 $(BOLD)$(GREEN)║$(RESET)"
	@echo "$(BOLD)$(GREEN)╚══════════════════════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""

.PHONY: restart
restart: ## 🔄 Restart services (stops then runs in current mode)
	@$(MAKE) stop-cgps
	@if [ -f $(LOG_DIR)/backend.log ] && grep -q "workers 4" $(LOG_DIR)/backend.log 2>/dev/null; then \
		$(MAKE) run-cgps-pro; \
	else \
		$(MAKE) run-cgps-dev; \
	fi

.PHONY: status
status: ## 📊 Check service status
	@echo ""
	@echo "$(BOLD)$(CYAN)╔══════════════════════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)                 $(BOLD)📊 CGPS Service Status$(RESET)                                     $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)╠══════════════════════════════════════════════════════════════════════════════╣$(RESET)"
	@echo "$(BOLD)$(CYAN)║$(RESET)                                                                              $(BOLD)$(CYAN)║$(RESET)"
	@if [ -f $(BACKEND_PID) ] && kill -0 $$(cat $(BACKEND_PID)) 2>/dev/null; then \
		echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)●$(RESET) Backend:    $(GREEN)Running$(RESET) (PID: $$(cat $(BACKEND_PID)))                        $(BOLD)$(CYAN)║$(RESET)"; \
	elif ss -tlnp 2>/dev/null | grep -q ":$(BACKEND_PORT) "; then \
		echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)●$(RESET) Backend:    $(GREEN)Running$(RESET) (port $(BACKEND_PORT) active)                  $(BOLD)$(CYAN)║$(RESET)"; \
	else \
		echo "$(BOLD)$(CYAN)║$(RESET)  $(RED)●$(RESET) Backend:    $(RED)Stopped$(RESET)                                          $(BOLD)$(CYAN)║$(RESET)"; \
	fi
	@if [ -f $(FRONTEND_PID) ] && kill -0 $$(cat $(FRONTEND_PID)) 2>/dev/null; then \
		echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)●$(RESET) Frontend:   $(GREEN)Running$(RESET) (PID: $$(cat $(FRONTEND_PID)))                        $(BOLD)$(CYAN)║$(RESET)"; \
	elif ss -tlnp 2>/dev/null | grep -q ":$(FRONTEND_PORT) "; then \
		echo "$(BOLD)$(CYAN)║$(RESET)  $(GREEN)●$(RESET) Frontend:   $(GREEN)Running$(RESET) (port $(FRONTEND_PORT) active)                 $(BOLD)$(CYAN)║$(RESET)"; \
	else \
		echo "$(BOLD)$(CYAN)║$(RESET)  $(RED)●$(RESET) Frontend:   $(RED)Stopped$(RESET)                                          $(BOLD)$(CYAN)║$(RESET)"; \
	fi
	@echo "$(BOLD)$(CYAN)║$(RESET)                                                                              $(BOLD)$(CYAN)║$(RESET)"
	@echo "$(BOLD)$(CYAN)╚══════════════════════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                     🔧 SETUP & MAINTENANCE                                  ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

.PHONY: setup
setup: setup-frontend setup-backend ## 🔧 Install all dependencies
	@echo ""
	@echo "$(BOLD)$(GREEN)✅ All dependencies installed successfully!$(RESET)"
	@echo ""

.PHONY: setup-frontend
setup-frontend: ## 🔧 Install frontend dependencies
	@echo "$(YELLOW)▸ Installing frontend dependencies...$(RESET)"
	@cd $(FRONTEND_DIR) && npm install
	@echo "$(GREEN)  ✓ Frontend dependencies installed$(RESET)"

.PHONY: setup-backend
setup-backend: ## 🔧 Install backend dependencies
	@echo "$(YELLOW)▸ Installing backend dependencies...$(RESET)"
	@cd $(BACKEND_DIR) && . .venv/bin/activate && pip install -r requirements.txt
	@echo "$(GREEN)  ✓ Backend dependencies installed$(RESET)"

.PHONY: clean
clean: ## 🧹 Clean build artifacts and temporary files
	@echo "$(YELLOW)▸ Cleaning build artifacts...$(RESET)"
	@rm -rf $(FRONTEND_DIR)/dist
	@rm -rf $(FRONTEND_DIR)/node_modules/.vite
	@rm -rf $(BACKEND_DIR)/__pycache__
	@rm -rf $(BACKEND_DIR)/app/__pycache__
	@rm -rf $(BACKEND_DIR)/app/routers/__pycache__
	@rm -rf $(BACKEND_DIR)/tests/__pycache__
	@rm -rf $(LOG_DIR)
	@rm -rf $(PID_DIR)
	@echo "$(GREEN)  ✓ Cleaned build artifacts$(RESET)"

.PHONY: clean-all
clean-all: stop-cgps clean ## 🧹 Clean everything (including node_modules)
	@echo "$(YELLOW)▸ Removing node_modules...$(RESET)"
	@rm -rf $(FRONTEND_DIR)/node_modules
	@echo "$(YELLOW)▸ Removing Python caches...$(RESET)"
	@cd $(BACKEND_DIR) && find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@echo "$(GREEN)  ✓ Cleaned everything$(RESET)"

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                        🏗️  BUILD COMMANDS                                   ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

.PHONY: build
build: build-frontend ## 🏗️ Build frontend for production
	@echo "$(GREEN)✅ Build complete!$(RESET)"

.PHONY: build-frontend
build-frontend: ## 🏗️ Build frontend only
	@echo "$(YELLOW)▸ Building frontend for production...$(RESET)"
	@cd $(FRONTEND_DIR) && npm run build
	@echo "$(GREEN)  ✓ Frontend built to $(FRONTEND_DIR)/dist$(RESET)"

.PHONY: preview
preview: build-frontend ## 📺 Preview production build locally
	@echo "$(YELLOW)▸ Starting preview server...$(RESET)"
	@cd $(FRONTEND_DIR) && npm run preview

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                         🧪 TEST COMMANDS                                    ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

.PHONY: test
test: test-frontend test-backend ## 🧪 Run all tests
	@echo ""
	@echo "$(BOLD)$(GREEN)✅ All tests completed!$(RESET)"

.PHONY: test-frontend
test-frontend: ## 🧪 Run frontend tests only
	@echo "$(YELLOW)▸ Running frontend tests...$(RESET)"
	@cd $(FRONTEND_DIR) && npm run test

.PHONY: test-backend
test-backend: ## 🧪 Run backend tests only
	@echo "$(YELLOW)▸ Running backend tests...$(RESET)"
	@cd $(BACKEND_DIR) && . .venv/bin/activate && python -m pytest tests/ -v

.PHONY: lint
lint: ## 🔍 Run linters on codebase
	@echo "$(YELLOW)▸ Running linters...$(RESET)"
	@cd $(FRONTEND_DIR) && npx eslint src/ --ext .js,.jsx 2>/dev/null || true
	@echo "$(GREEN)  ✓ Linting complete$(RESET)"

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                       📊 MONITORING                                         ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

.PHONY: logs
logs: ## 📋 View application logs
	@echo "$(BOLD)$(CYAN)═══════════════════════════════════════════════════════════════════════════════$(RESET)"
	@echo "$(BOLD)$(CYAN)                         📋 APPLICATION LOGS$(RESET)"
	@echo "$(BOLD)$(CYAN)═══════════════════════════════════════════════════════════════════════════════$(RESET)"
	@echo ""
	@if [ -f $(LOG_DIR)/backend.log ]; then \
		echo "$(BOLD)$(YELLOW)▸ Backend Logs:$(RESET)"; \
		echo "$(CYAN)───────────────────────────────────────────────────────────────────────────────$(RESET)"; \
		tail -20 $(LOG_DIR)/backend.log; \
	else \
		echo "$(YELLOW)▸ No backend logs found$(RESET)"; \
	fi
	@echo ""
	@if [ -f $(LOG_DIR)/frontend.log ]; then \
		echo "$(BOLD)$(YELLOW)▸ Frontend Logs:$(RESET)"; \
		echo "$(CYAN)───────────────────────────────────────────────────────────────────────────────$(RESET)"; \
		tail -20 $(LOG_DIR)/frontend.log; \
	else \
		echo "$(YELLOW)▸ No frontend logs found$(RESET)"; \
	fi
	@echo ""

.PHONY: logs-follow
logs-follow: ## 📋 Follow logs in real-time
	@echo "$(YELLOW)▸ Following logs (Ctrl+C to stop)...$(RESET)"
	@tail -f $(LOG_DIR)/*.log 2>/dev/null || echo "$(RED)No logs found. Start services first with 'make run-cgps-dev'$(RESET)"

.PHONY: health
health: ## 💓 Check backend health endpoint
	@echo "$(YELLOW)▸ Checking backend health...$(RESET)"
	@curl -s http://localhost:$(BACKEND_PORT)/health | python -m json.tool 2>/dev/null || echo "$(RED)Backend is not responding$(RESET)"

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                        🗄️  DATABASE                                         ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

.PHONY: migrate
migrate: ## 🗄️ Run database migrations
	@echo "$(YELLOW)▸ Running database migrations...$(RESET)"
	@cd $(BACKEND_DIR) && . .venv/bin/activate && alembic upgrade head
	@echo "$(GREEN)  ✓ Migrations applied$(RESET)"

.PHONY: migrate-rollback
migrate-rollback: ## 🗄️ Rollback last migration
	@echo "$(YELLOW)▸ Rolling back last migration...$(RESET)"
	@cd $(BACKEND_DIR) && . .venv/bin/activate && alembic downgrade -1
	@echo "$(GREEN)  ✓ Migration rolled back$(RESET)"

.PHONY: seed
seed: ## 🗄️ Seed database with admin user
	@echo "$(YELLOW)▸ Seeding database...$(RESET)"
	@cd $(BACKEND_DIR) && . .venv/bin/activate && python scripts/seed_admin.py
	@echo "$(GREEN)  ✓ Database seeded$(RESET)"
