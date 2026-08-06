import { useEffect, useState } from 'react'
import { Plus, CreditCard, Search, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { paymentsApi, invoicesApi } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { SectionHeader, Table, Modal, ConfirmModal, Pagination, Field, PageLoader, EmptyState, Spinner } from '../components/UI'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

export default function Payments() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [invoices, setInvoices] = useState([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    invoice_id: '',
    amount_paid: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  })
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [skip, setSkip] = useState(0)
  const limit = 50
  const [confirmVoidOpen, setConfirmVoidOpen] = useState(false)
  const [paymentToVoid, setPaymentToVoid] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await paymentsApi.list({ skip, limit })
      setPayments(res.data)
    } catch { toast.error('Failed to load payments') }
    finally { setLoading(false) }
  }

  useEffect(() => { setSkip(0) }, [search, dateFilter])
  useEffect(() => { load() }, [skip])

  const openCreate = async () => {
    try {
      const res = await invoicesApi.list({ limit: 200 })
      // Only show unpaid/partial invoices
      setInvoices(res.data.filter(i => i.status !== 'paid'))
    } catch { toast.error('Failed to load invoices') }
    setCreateOpen(true)
  }

  const selectedInvoice = invoices.find(i => i.id === parseInt(form.invoice_id))

  const handleCreate = async () => {
    setSaving(true)
    try {
      await paymentsApi.create({
        invoice_id: parseInt(form.invoice_id),
        amount_paid: parseFloat(form.amount_paid),
        payment_date: form.payment_date,
        notes: form.notes || null
      })
      toast.success('Payment recorded!')
      setCreateOpen(false)
      setForm({ invoice_id: '', amount_paid: '', payment_date: new Date().toISOString().split('T')[0], notes: '' })
      load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to record payment')
    } finally { setSaving(false) }
  }

  const handleVoidClick = (payment) => {
    setPaymentToVoid(payment)
    setConfirmVoidOpen(true)
  }

  const handleConfirmVoid = async () => {
    if (!paymentToVoid) return
    try {
      await paymentsApi.delete(paymentToVoid.id)
      toast.success('Payment voided and invoice balance updated')
      load()
    } catch { toast.error('Failed to void payment') }
  }

  const filtered = payments.filter(p => {
    const matchesSearch = `INV-${String(p.invoice_id).padStart(4, '0')} ${p.notes || ''}`
      .toLowerCase().includes(search.toLowerCase())
    const matchesDate = dateFilter ? p.payment_date === dateFilter : true
    return matchesSearch && matchesDate
  })

  const totalCollected = filtered.reduce((a, p) => a + Number(p.amount_paid), 0)

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Payments"
        description="Record fee payments against invoices"
        action={
          isAdmin && (
            <Button onClick={openCreate}>
              <Plus size={16} /> Record Payment
            </Button>
          )
        }
      />

      {/* Total collected card */}
      {filtered.length > 0 && (
        <div className="card border-emerald-500/20 bg-emerald-500/5 px-5 py-4 flex items-center gap-4 mb-5">
          <CreditCard size={20} className="text-emerald-400" />
          <div>
            <p className="text-sm font-medium text-emerald-300">Total Collected</p>
            <p className="text-xs text-slate-400">PKR {totalCollected.toLocaleString()} across {filtered.length} transactions</p>
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by invoice # or notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Input
          type="date"
          className="w-40"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          title="Filter by payment date"
        />
        {(search || dateFilter) && (
          <Button variant="outline" onClick={() => { setSearch(''); setDateFilter('') }}>
            Clear
          </Button>
        )}
      </div>

      {loading ? <PageLoader /> : (
        <Table
          headers={['Payment #', 'Invoice #', 'Amount Paid', 'Payment Date', 'Notes', 'Recorded At', 'Actions']}
          empty={filtered.length === 0 && (
            <EmptyState icon={CreditCard} title="No payments recorded"
              description="Record a payment against an invoice"
              action={isAdmin && <Button onClick={openCreate}><Plus size={15} />Record Payment</Button>}
          />)}
        >
          {filtered.map(p => (
            <tr key={p.id} className="table-row">
              <td className="td font-mono text-xs text-slate-400">#{String(p.id).padStart(4, '0')}</td>
              <td className="td font-mono text-xs">
                <span className="bg-slate-800 px-2 py-1 rounded-lg">INV-{String(p.invoice_id).padStart(4, '0')}</span>
              </td>
              <td className="td font-mono font-semibold text-emerald-400">
                PKR {Number(p.amount_paid).toLocaleString()}
              </td>
              <td className="td text-slate-300">{p.payment_date}</td>
              <td className="td text-slate-400 max-w-xs truncate">{p.notes || '—'}</td>
              <td className="td text-xs text-slate-500">
                {new Date(p.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
              </td>
              <td className="td">
                {isAdmin && (
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleVoidClick(p)} 
                    title="Void Payment"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      {!loading && (
        <Pagination 
          skip={skip} 
          limit={limit} 
          totalItemsInCurrentPage={payments.length} 
          onNext={() => setSkip(skip + limit)} 
          onPrev={() => setSkip(Math.max(0, skip - limit))} 
        />
      )}

      {/* Record Payment Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Record Payment">
        <div className="space-y-4">
          <Field label="Invoice">
            <Select
              value={form.invoice_id === '' ? 'none' : String(form.invoice_id)}
              onValueChange={v => setForm({ ...form, invoice_id: v === 'none' ? '' : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select invoice..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select invoice...</SelectItem>
                {invoices.map(inv => (
                  <SelectItem key={inv.id} value={String(inv.id)}>
                    INV-{String(inv.id).padStart(4, '0')} — {inv.billing_month} 
                    {inv.student ? ` (${inv.student.first_name} ${inv.student.last_name})` : ''}
                    {' '}· Balance PKR {Number(inv.balance_due || 0).toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Invoice balance info */}
          {selectedInvoice && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Total', value: selectedInvoice.total_amount, color: 'text-slate-200' },
                { label: 'Paid', value: selectedInvoice.amount_paid, color: 'text-emerald-400' },
                { label: 'Balance', value: selectedInvoice.balance_due, color: 'text-amber-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-800/50 rounded-xl px-3 py-2 text-center">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className={`text-sm font-mono font-medium ${color}`}>PKR {Number(value || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Amount (PKR)">
              <Input type="number" value={form.amount_paid}
                onChange={e => setForm({ ...form, amount_paid: e.target.value })}
                placeholder={selectedInvoice ? Number(selectedInvoice.balance_due || 0).toString() : '0'}
              />
            </Field>
            <Field label="Payment Date">
              <Input type="date" value={form.payment_date}
                onChange={e => setForm({ ...form, payment_date: e.target.value })} />
            </Field>
          </div>

          <Field label="Notes (Optional)">
            <Input value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Cash payment, bank transfer..." />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={saving || !form.invoice_id || !form.amount_paid}>
            {saving ? <Spinner size={15} /> : <CreditCard size={15} />} Record Payment
          </Button>
        </div>
      </Modal>

      {/* Void Confirmation Modal */}
      <ConfirmModal
        open={confirmVoidOpen}
        onClose={() => setConfirmVoidOpen(false)}
        onConfirm={handleConfirmVoid}
        title="Void Payment"
        message={paymentToVoid ? `Are you sure you want to void this payment of PKR ${Number(paymentToVoid.amount_paid).toLocaleString()}? This will update the invoice balance.` : ''}
        confirmText="Void Payment"
        isDestructive={true}
      />
    </div>
  )
}
