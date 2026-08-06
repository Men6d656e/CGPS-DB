import { useEffect } from 'react'
import { Loader2, X } from 'lucide-react'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import {
  Table as STable, TableHeader, TableBody, TableRow, TableHead,
} from './ui/table'
import {
  Pagination as SPagination, PaginationContent, PaginationItem,
  PaginationPrevious, PaginationNext,
} from './ui/pagination'

// Shared semantic badge styles (SPEC3 Phase 3)
export const STATUS_STYLES = {
  active: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
  paid: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
  withdrawn: 'bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/25',
  inactive: 'bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/25',
  resigned: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
  graduated: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/25',
  pending: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
  partial: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/25',
  overdue: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25',
}

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
    <div className="flex flex-col items-center justify-center py-16 text-center border-t">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4 border">
        <Icon size={24} className="text-muted-foreground" />
      </div>
      <p className="font-medium text-foreground mb-1">{title}</p>
      <p className="text-sm text-muted-foreground mb-5 max-w-xs">{description}</p>
      {action}
    </div>
  )
}

// ─── Error Alert ──────────────────────────────────────────────────────────────
export function ErrorAlert({ message }) {
  return (
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
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
      <div className={`relative w-full ${maxWidth} bg-card border border-border rounded-2xl shadow-2xl animate-slide-up`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-display font-semibold text-foreground">{title}</h3>
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
      <p className="text-muted-foreground text-sm mb-6">{message}</p>
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
  const iconColor = {
    brand: 'bg-brand-500/15 text-brand-500 dark:text-brand-400',
    emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    gold: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    red: 'bg-red-500/15 text-red-600 dark:text-red-400',
  }
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${iconColor[color]} flex items-center justify-center`}>
            <Icon size={20} />
          </div>
          {trend && <span className="text-xs text-muted-foreground">{trend}</span>}
        </div>
        <p className="text-2xl font-display font-semibold text-foreground mb-0.5">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
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

// ─── Badge (status mapping) ────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  return (
    <Badge variant="outline" className={STATUS_STYLES[status]}>
      {status}
    </Badge>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── Table Wrapper (shadcn Table) ──────────────────────────────────────────────
export function Table({ headers, children, empty }) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
      <div className="overflow-x-auto">
        <STable>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {headers.map((h) => (
                <TableHead key={h} className="text-xs uppercase tracking-wider text-muted-foreground">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>{children}</TableBody>
        </STable>
        {empty}
      </div>
    </div>
  )
}

// ─── Pagination (shadcn Pagination) ────────────────────────────────────────────
export function Pagination({ skip, limit, totalItemsInCurrentPage, onNext, onPrev }) {
  const hasNext = totalItemsInCurrentPage === limit
  const hasPrev = skip > 0
  
  if (!hasNext && !hasPrev) return null

  return (
    <SPagination className="justify-between border-t bg-muted/30 px-6 py-3">
      <div className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-foreground">{skip + 1}</span> to <span className="font-medium text-foreground">{skip + totalItemsInCurrentPage}</span>
      </div>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => { e.preventDefault(); onPrev() }}
            className={!hasPrev ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => { e.preventDefault(); onNext() }}
            className={!hasNext ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </SPagination>
  )
}

