import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserCheck, DollarSign,
  FileText, CreditCard, GraduationCap, Menu, X,
  LogOut, User as UserIcon, Shield, School
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Teachers from './pages/Teachers'
import Parents from './pages/Parents'
import Fees from './pages/Fees'
import Invoices from './pages/Invoices'
import Payments from './pages/Payments'
import UsersPage from './pages/Users'
import Login from './pages/Login'
import { PageLoader } from './components/UI'
import ThemeToggle from './components/ThemeToggle'

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
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <PageLoader />
      </div>
    )
  }

  // ─── Not authenticated — show login ─────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/*" element={<Login />} />
      </Routes>
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
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-xl
        border-r border-slate-800/60 flex flex-col
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/60">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <p className="font-display font-600 text-slate-100 text-sm leading-tight">School</p>
            <p className="text-xs text-slate-500 leading-tight">Management System</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-slate-500 hover:text-slate-300"
          >
            <X size={18} />
          </button>
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
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 group
                ${isActive
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }
              `}
            >
              <Icon size={17} className="flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info & Logout */}
        <div className="border-t border-slate-800/60 px-4 py-4 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
              <UserIcon size={15} className="text-brand-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.full_name || user?.username}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                user?.role === 'admin'
                  ? 'text-brand-400 bg-brand-500/10 border border-brand-500/20'
                  : 'text-slate-400 bg-slate-800/60 border border-slate-700/60'
              }`}>
                <Shield size={10} />
                {user?.role === 'admin' ? 'Admin' : 'Staff'}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
                       text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <LogOut size={16} className="flex-shrink-0" />
            Sign Out
          </button>
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
        <header className="flex items-center gap-4 px-6 py-4 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-slate-200"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="font-display text-lg font-semibold text-slate-100">
              {currentPage?.label || 'School MS'}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex-1" />
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {user?.username}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="page-enter max-w-7xl mx-auto">
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
          </div>
        </main>
      </div>
    </div>
  )
}
