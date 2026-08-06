import { Loader2 } from 'lucide-react'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from './ui/alert-dialog'
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

// Shared semantic badge styles (SPEC4 Phase 3 — token-based, theme-aware via CSS vars)
export const STATUS_STYLES = {
  active: 'bg-success/15 text-success border-success/25',
  paid: 'bg-success/15 text-success border-success/25',
  withdrawn: 'bg-muted/50 text-muted-foreground border-border',
  inactive: 'bg-muted/50 text-muted-foreground border-border',
  resigned: 'bg-warning/15 text-warning border-warning/25',
  graduated: 'bg-info/15 text-info border-info/25',
  pending: 'bg-warning/15 text-warning border-warning/25',
  partial: 'bg-partial/15 text-partial border-partial/25',
  overdue: 'bg-destructive/15 text-destructive border-destructive/25',
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export function Spinner({ size = 20, className = '' }) {
  return <Loader2 size={size} className={`animate-spin text-accent-brand ${className}`} />
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
      <div className="w-14 h-14 rounded-md bg-muted flex items-center justify-center mb-4 border">
        <Icon size={24} className="text-muted-foreground" />
      </div>
      <p className="font-display font-medium text-foreground mb-1">{title}</p>
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

// ─── Modal (shadcn Dialog) ────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className={maxWidth.replace('max-w-', 'sm:max-w-')}>
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>
        <div className="pt-2">{children}</div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Confirm Modal (shadcn AlertDialog) ────────────────────────────────────────
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmText = "Confirm", isDestructive = false }) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={isDestructive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, color = 'brand', trend }) {
  const iconColor = {
    brand: 'bg-accent-brand/15 text-accent-brand',
    emerald: 'bg-success/15 text-success',
    gold: 'bg-warning/15 text-warning',
    red: 'bg-destructive/15 text-destructive',
  }
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-md ${iconColor[color]} flex items-center justify-center`}>
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
    <div className="rounded-lg border bg-card text-card-foreground shadow overflow-hidden">
      <div className="overflow-x-auto">
        <STable>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {headers.map((h) => (
                <TableHead key={h} className="font-display text-xs uppercase tracking-wider text-muted-foreground">
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

