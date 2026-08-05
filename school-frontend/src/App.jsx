import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserCheck, DollarSign,
  FileText, CreditCard, GraduationCap, Menu, X, Search,
  Bell, ChevronRight, Settings
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
import Login from './pages/Login'
import { PageLoader, UserCard } from './components/UI'

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/students',  icon: Users,           label: 'Students' },
  { to: '/teachers',  icon: GraduationCap,   label: 'Teachers' },
  { to: '/parents',   icon: UserCheck,       label: 'Parents' },
  { to: '/fees',      icon: DollarSign,      label: 'Fee Types' },
  { to: '/invoices',  icon: FileText,        label: 'Invoices' },
  { to: '/payments',  icon: CreditCard,      label: 'Payments' },
]

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#e8ecf1' }}>
        <PageLoader />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/*" element={<Login />} />
      </Routes>
    )
  }

  const currentPage = navItems.find(n =>
    n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to)
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#e8ecf1' }}>

      <aside className={`
        fixed top-6 left-6 bottom-6 z-50 w-[260px]
        sidebar-floating rounded-2xl
        flex flex-col
        transform transition-transform duration-300 ease-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
            <GraduationCap size={22} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm leading-tight">School</p>
            <p className="text-[11px] text-teal-300/70 leading-tight">Management System</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-teal-300/60 hover:text-white transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <UserCard />
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden p-4 lg:p-6 lg:ml-[316px]">
        <header className="topbar flex items-center gap-4 px-4 py-4 rounded-2xl mb-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-sm">
            <GraduationCap size={14} className="text-gray-400" />
            <ChevronRight size={12} className="text-gray-300" />
            <span className="font-medium text-gray-700">{currentPage?.label || 'Dashboard'}</span>
          </div>

          <div className="flex-1" />

          <div className="hidden md:flex items-center relative">
            <Search size={15} className="absolute left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-52 lg:w-64 bg-gray-100/80 border border-gray-200/60 rounded-xl pl-9 pr-3 py-2 text-sm text-gray-600 placeholder-gray-400 outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-50 transition-all"
            />
          </div>

          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white" />
          </button>

          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <Settings size={18} />
          </button>

          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6)' }}>
              <span className="text-[11px] font-bold text-white">
                {(user?.full_name || user?.username || '?').charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-600">{user?.full_name || user?.username}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="page-enter w-full max-w-[1600px] mx-auto">
            <Routes>
              <Route path="/"          element={<Dashboard />} />
              <Route path="/students"  element={<Students />} />
              <Route path="/teachers"  element={<Teachers />} />
              <Route path="/parents"   element={<Parents />} />
              <Route path="/fees"      element={<Fees />} />
              <Route path="/invoices"  element={<Invoices />} />
              <Route path="/payments"  element={<Payments />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}
