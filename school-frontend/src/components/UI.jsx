import { useEffect } from 'react'
import { Loader2, AlertCircle, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'
import { Label } from './ui/label'

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export function Spinner({ size = 20, className = '' }) {
  return <Loader2 size={size} className={`animate-spin text-brand-400 ${className}`} />
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner size={28} />
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-4 border border-slate-700/50">
        <Icon size={24} className="text-slate-500" />
      </div>
      <p className="font-medium text-slate-300 mb-1">{title}</p>
      <p className="text-sm text-slate-500 mb-5 max-w-xs">{description}</p>
      {action}
    </div>
  )
}

// ─── Error Alert ──────────────────────────────────────────────────────────────
export function ErrorAlert({ message }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      <AlertCircle size={16} className="flex-shrink-0" />
      {message}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  // A11y: close on Escape + lock body scroll while open (SPEC2 Phase 6)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} card border-slate-700/60 shadow-2xl animate-slide-up`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
          <h3 className="font-display font-semibold text-slate-100">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground" aria-label="Close dialog">
            <X size={18} />
          </Button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ─── Confirm Modal ─────────────────────────────────────────────────────────────
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmText = "Confirm", isDestructive = false }) {
  if (!open) return null
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-slate-400 text-sm mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          variant={isDestructive ? "destructive" : "default"}
          onClick={() => { onConfirm(); onClose(); }}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, color = 'brand', trend }) {
  const colorMap = {
    brand: 'from-brand-500/20 to-brand-600/5 border-brand-500/20 text-brand-400',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    gold: 'from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400',
    red: 'from-red-500/20 to-red-600/5 border-red-500/20 text-red-400',
  }
  const iconColor = {
    brand: 'bg-brand-500/20 text-brand-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    gold: 'bg-amber-500/20 text-amber-400',
    red: 'bg-red-500/20 text-red-400',
  }
  return (
    <div className={`card bg-gradient-to-br ${colorMap[color]} p-5`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconColor[color]} flex items-center justify-center`}>
          <Icon size={20} />
        </div>
        {trend && <span className="text-xs text-slate-500">{trend}</span>}
      </div>
      <p className="text-2xl font-display font-semibold text-slate-100 mb-0.5">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}

// ─── Form Field (shadcn Label) ─────────────────────────────────────────────────
export function Field({ label, error, children }) {
  return (
    <div>
      {label && <Label className="mb-1.5">{label}</Label>}
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
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
    <span className={map[status] || 'badge bg-slate-800 text-slate-400'}>
      {status}
    </span>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-slate-100">{title}</h2>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── Table Wrapper ────────────────────────────────────────────────────────────
export function Table({ headers, children, empty }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800/60 bg-slate-900/60">
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

// ─── Pagination ───────────────────────────────────────────────────────────────
export function Pagination({ skip, limit, totalItemsInCurrentPage, onNext, onPrev }) {
  const hasNext = totalItemsInCurrentPage === limit
  const hasPrev = skip > 0
  
  if (!hasNext && !hasPrev) return null

  return (
    <div className="flex items-center justify-between border-t border-slate-800/60 bg-slate-900/40 px-6 py-3">
      <div className="text-xs text-slate-500">
        Showing <span className="font-medium text-slate-300">{skip + 1}</span> to <span className="font-medium text-slate-300">{skip + totalItemsInCurrentPage}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={!hasPrev}
          className="h-8 px-3 text-xs"
        >
          <ChevronLeft size={14} /> Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNext}
          className="h-8 px-3 text-xs"
        >
          Next <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  )
}
