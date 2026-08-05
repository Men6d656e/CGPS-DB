import { Loader2, AlertCircle, X, ChevronDown, ChevronLeft, ChevronRight, Edit2, Save, LogOut } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { usersApi } from '../api'
import { useAuth } from '../contexts/AuthContext'

export function Spinner({ size = 20, className = '' }) {
  return <Loader2 size={size} className={`animate-spin text-teal-500 ${className}`} />
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <Spinner size={32} />
        <p className="text-sm text-gray-400 font-medium">Loading...</p>
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 stat-card-icon">
        <Icon size={26} className="text-teal-500" />
      </div>
      <p className="font-semibold text-gray-700 mb-1">{title}</p>
      <p className="text-sm text-gray-400 mb-5 max-w-xs">{description}</p>
      {action}
    </div>
  )
}

export function ErrorAlert({ message }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200/60 text-red-600 text-sm">
      <AlertCircle size={16} className="flex-shrink-0" />
      {message}
    </div>
  )
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} card shadow-2xl animate-fade-in`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmText = "Confirm", isDestructive = false }) {
  if (!open) return null
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={isDestructive ? "btn-danger" : "btn-primary"}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}

export function StatCard({ label, value, icon: Icon, color = 'brand', trend }) {
  return (
    <div className="card p-4 card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center stat-card-icon">
          <Icon size={20} className="text-teal-600" />
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
            trend.startsWith('+')
              ? 'text-emerald-600 bg-emerald-50'
              : 'text-red-500 bg-red-50'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  )
}

export function Field({ label, error, children }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      {children}
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  )
}

export function Select({ children, ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        className="input appearance-none pr-9 cursor-pointer"
      >
        {children}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}

export function StatusBadge({ status }) {
  const map = {
    active: 'badge-active',
    withdrawn: 'badge-withdrawn',
    graduated: 'badge-graduated',
    pending: 'badge-pending',
    partial: 'badge-partial',
    paid: 'badge-paid',
    overdue: 'badge-overdue',
  }
  return (
    <span className={map[status] || 'badge bg-gray-100 text-gray-500'}>
      {status}
    </span>
  )
}

export function SectionHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        {description && <p className="text-sm text-gray-400 mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function Table({ headers, children, empty }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {headers.map((h) => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
        {empty}
      </div>
    </div>
  )
}

export function Pagination({ skip, limit, totalItemsInCurrentPage, onNext, onPrev }) {
  const hasNext = totalItemsInCurrentPage === limit
  const hasPrev = skip > 0

  if (!hasNext && !hasPrev) return null

  return (
    <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/40 px-6 py-3 rounded-b-2xl">
      <div className="text-xs text-gray-400">
        Showing <span className="font-medium text-gray-500">{skip + 1}</span> to <span className="font-medium text-gray-500">{skip + totalItemsInCurrentPage}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <ChevronLeft size={14} /> Prev
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

export function UserCard() {
  const { user, logout, refreshUser } = useAuth()
  const [editOpen, setEditOpen] = useState(false)
  const [cardOpen, setCardOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '' })

  const openEdit = (e) => {
    e.stopPropagation()
    setForm({
      full_name: user?.full_name || '',
      email: user?.email || ''
    })
    setEditOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await usersApi.updateProfile({
        full_name: form.full_name || null,
        email: form.email || null
      })
      await refreshUser()
      toast.success('Profile updated!')
      setEditOpen(false)
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to update profile')
    } finally { setSaving(false) }
  }

  const userInitials = (user?.full_name || user?.username || '?')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <>
      <div className="border-t border-white/10 p-4">
        <div
          onClick={() => setCardOpen(!cardOpen)}
          className="w-full rounded-xl p-3 transition-all duration-200 group cursor-pointer text-left
                     bg-white/5 hover:bg-white/8 border border-white/5"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
              <span className="text-[11px] font-bold text-white">{userInitials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-white/90 truncate group-hover:text-white transition-colors">
                {user?.full_name || user?.username}
              </p>
              <p className="text-[11px] text-teal-300/50 truncate">{user?.email}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); openEdit(e); }}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/10 transition-all flex-shrink-0"
              title="Edit Profile"
            >
              <Edit2 size={13} />
            </button>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full mt-2 px-3 py-2 rounded-xl text-xs font-medium
                     text-white/40 hover:text-red-300 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut size={13} />
          Sign Out
        </button>
      </div>

      {cardOpen && (
        <div className="fixed inset-0 z-[60]" onClick={() => setCardOpen(false)}>
          <div
            className="absolute bottom-4 left-[248px] w-[280px] bg-white rounded-2xl shadow-2xl border border-gray-200/60 animate-fade-in overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-4 text-center" style={{ background: 'linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md mx-auto mb-3"
                   style={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6)' }}>
                <span className="text-lg font-bold text-white">{userInitials}</span>
              </div>
              <p className="text-[13px] font-bold text-gray-800">{user?.full_name || '—'}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">@{user?.username}</p>
            </div>

            <div className="px-4 pb-4 space-y-2">
              <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Email</p>
                <p className="text-[12px] text-gray-700 truncate">{user?.email || '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Full Name</p>
                <p className="text-[12px] text-gray-700 truncate">{user?.full_name || '—'}</p>
              </div>
            </div>

            <div className="px-4 pb-4 flex gap-2">
              <button
                onClick={(e) => { setCardOpen(false); openEdit(e); }}
                className="flex-1 flex items-center justify-center gap-1.5 btn-primary text-[12px] py-2"
              >
                <Edit2 size={13} /> Edit
              </button>
              <button
                onClick={logout}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium
                           text-gray-500 hover:text-red-500 hover:bg-red-50 border border-gray-200 transition-all"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile" maxWidth="max-w-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6)' }}>
              <span className="text-xs font-bold text-white">{userInitials}</span>
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-700">@{user?.username}</p>
            </div>
          </div>
          <Field label="Full Name">
            <input
              className="input"
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              placeholder="Your full name"
            />
          </Field>
          <Field label="Email Address">
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
            />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setEditOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Spinner size={15} /> : <Save size={15} />} Save
          </button>
        </div>
      </Modal>
    </>
  )
}
