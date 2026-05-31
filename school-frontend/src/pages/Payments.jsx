import { useEffect, useState } from 'react'
import { Plus, CreditCard, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { paymentsApi, invoicesApi } from '../api'
import { SectionHeader, Table, Modal, Field, Select, PageLoader, EmptyState, Spinner } from '../components/UI'

export default function Payments() {
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

  const load = async () => {
    setLoading(true)
    try {
      const res = await paymentsApi.list({ limit: 200 })
      setPayments(res.data)
    } catch { toast.error('Failed to load payments') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

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

  const totalCollected = payments.reduce((a, p) => a + Number(p.amount_paid), 0)

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Payments"
        description="Record fee payments against invoices"
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Record Payment
          </button>
        }
      />

      {/* Total collected card */}
      {payments.length > 0 && (
        <div className="card border-emerald-500/20 bg-emerald-500/5 px-5 py-4 flex items-center gap-4 mb-5">
          <CreditCard size={20} className="text-emerald-400" />
          <div>
            <p className="text-sm font-medium text-emerald-300">Total Collected</p>
            <p className="text-xs text-slate-400">PKR {totalCollected.toLocaleString()} across {payments.length} transactions</p>
          </div>
        </div>
      )}

      {loading ? <PageLoader /> : (
        <Table
          headers={['Payment #', 'Invoice #', 'Amount Paid', 'Payment Date', 'Notes', 'Recorded At']}
          empty={payments.length === 0 && (
            <EmptyState icon={CreditCard} title="No payments recorded"
              description="Record a payment against an invoice"
              action={<button onClick={openCreate} className="btn-primary"><Plus size={15} />Record Payment</button>}
            />
          )}
        >
          {payments.map(p => (
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
            </tr>
          ))}
        </Table>
      )}

      {/* Record Payment Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Record Payment">
        <div className="space-y-4">
          <Field label="Invoice">
            <Select value={form.invoice_id} onChange={e => setForm({ ...form, invoice_id: e.target.value })}>
              <option value="">Select invoice...</option>
              {invoices.map(inv => (
                <option key={inv.id} value={inv.id}>
                  INV-{String(inv.id).padStart(4, '0')} — {inv.billing_month} 
                  {inv.student ? ` (${inv.student.first_name} ${inv.student.last_name})` : ''}
                  {' '}· Balance PKR {Number(inv.balance_due || 0).toLocaleString()}
                </option>
              ))}
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
              <input type="number" className="input" value={form.amount_paid}
                onChange={e => setForm({ ...form, amount_paid: e.target.value })}
                placeholder={selectedInvoice ? Number(selectedInvoice.balance_due || 0).toString() : '0'}
              />
            </Field>
            <Field label="Payment Date">
              <input type="date" className="input" value={form.payment_date}
                onChange={e => setForm({ ...form, payment_date: e.target.value })} />
            </Field>
          </div>

          <Field label="Notes (Optional)">
            <input className="input" value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Cash payment, bank transfer..." />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleCreate} disabled={saving || !form.invoice_id || !form.amount_paid} className="btn-primary">
            {saving ? <Spinner size={15} /> : <CreditCard size={15} />} Record Payment
          </button>
        </div>
      </Modal>
    </div>
  )
}
