import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserCheck, DollarSign,
  FileText, CreditCard, GraduationCap, Menu, X,
  LogOut, User as UserIcon, Shield, School
} from 'lucide-react'
import { useState, lazy, Suspense } from 'react'
import { useAuth } from './contexts/AuthContext'
import { PageLoader } from './components/UI'
import ThemeToggle from './components/ThemeToggle'
import { Button } from './components/ui/button'
import { Separator } from './components/ui/separator'

// Lazy-loaded routes — split the bundle per page (SPEC2 Phase 6)
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Students = lazy(() => import('./pages/Students'))
const Teachers = lazy(() => import('./pages/Teachers'))
const Parents = lazy(() => import('./pages/Parents'))
const Fees = lazy(() => import('./pages/Fees'))
const Invoices = lazy(() => import('./pages/Invoices'))
const Payments = lazy(() => import('./pages/Payments'))
const UsersPage = lazy(() => import('./pages/Users'))
const Login = lazy(() => import('./pages/Login'))

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/students',  icon: Users,           label: 'Students' },
  { to: '/teachers',  icon: School, label: 'Teachers' },
  { to: '/parents',   icon: UserCheck,       label: 'Parents' },
  { to: '/fees',      icon: DollarSign,      label: 'Fee Types' },
  { to: '/invoices',  icon: FileText,        label: 'Invoices' },
  { to: '/payments',  icon: CreditCard,      label: 'Payments' },
  { to: '/users',     icon: Shield,          label: 'Users', adminOnly: true },
]

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated, loading, user, logout } = useAuth()

  // ─── Loading screen ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <PageLoader />
      </div>
    )
  }

  // ─── Not authenticated — show login ─────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><PageLoader /></div>}>
        <Routes>
          <Route path="/*" element={<Login />} />
        </Routes>
      </Suspense>
    )
  }

  // ─── Authenticated — show app ───────────────────────────────────────────
  const currentPage = navItems.find(n =>
    n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to)
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <p className="font-display font-semibold text-foreground text-sm leading-tight">School</p>
            <p className="text-xs text-muted-foreground leading-tight">Management System</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden h-8 w-8 text-muted-foreground"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems
            .filter(item => !item.adminOnly || user?.role === 'admin')
            .map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium
                transition-colors duration-150 group
                ${isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }
              `}
            >
              <Icon size={17} className="flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info & Logout */}
        <div className="px-4 py-4 space-y-3">
          <Separator />
          <div className="flex items-center gap-3 px-2 pt-2">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <UserIcon size={15} className="text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{user?.full_name || user?.username}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                user?.role === 'admin'
                  ? 'text-foreground bg-accent'
                  : 'text-muted-foreground bg-muted'
              }`}>
                <Shield size={10} />
                {user?.role === 'admin' ? 'Admin' : 'Staff'}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={logout}
            className="flex items-center gap-3 w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut size={16} className="flex-shrink-0" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden h-9 w-9 text-muted-foreground"
          >
            <Menu size={20} />
          </Button>
          <div>
            <h1 className="font-display text-lg font-semibold text-foreground">
              {currentPage?.label || 'School MS'}
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex-1" />
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {user?.username}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="page-enter max-w-7xl mx-auto">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/"          element={<Dashboard />} />
                <Route path="/students"  element={<Students />} />
                <Route path="/teachers"  element={<Teachers />} />
                <Route path="/parents"   element={<Parents />} />
                <Route path="/fees"      element={<Fees />} />
                <Route path="/invoices"  element={<Invoices />} />
                <Route path="/payments"  element={<Payments />} />
                <Route path="/users"     element={<UsersPage />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
