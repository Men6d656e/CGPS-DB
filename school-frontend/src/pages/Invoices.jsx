import { useEffect, useState } from 'react'
import { Plus, FileText, Eye, Trash2, Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { invoicesApi, studentsApi, feesApi } from '../api'
import {
  SectionHeader, Table, Modal, ConfirmModal, Pagination, Field, Select, StatusBadge,
  PageLoader, EmptyState, Spinner
} from '../components/UI'

export default function Invoices() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [skip, setSkip] = useState(0)
  const limit = 50
  const [createOpen, setCreateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [students, setStudents] = useState([])
  const [feeTypes, setFeeTypes] = useState([])
  const [saving, setSaving] = useState(false)
  const [confirmOverdueOpen, setConfirmOverdueOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [invoiceToAction, setInvoiceToAction] = useState(null)

  const [form, setForm] = useState({
    student_id: '',
    billing_month: new Date().toISOString().slice(0, 7),
    due_date: '',
    line_items: []
  })

  const load = async () => {
    setLoading(true)
    try {
      const res = await invoicesApi.list({ status: statusFilter || undefined, skip, limit })
      setInvoices(res.data)
    } catch { toast.error('Failed to load invoices') }
    finally { setLoading(false) }
  }

  useEffect(() => { setSkip(0) }, [statusFilter])
  
  useEffect(() => { load() }, [statusFilter, skip])

  const loadFormData = async () => {
    const [sRes, fRes] = await Promise.all([
      studentsApi.list({ status: 'active', limit: 200 }),
      feesApi.list()
    ])
    setStudents(sRes.data)
    setFeeTypes(fRes.data.filter(f => f.is_active))
    // Pre-populate line items with active fee types
    setForm(f => ({
      ...f,
      line_items: fRes.data.filter(ft => ft.is_active).map(ft => ({
        fee_type_id: ft.id,
        amount: ft.default_amount,
        enabled: true
      }))
    }))
  }

  const openCreate = async () => {
    await loadFormData()
    setCreateOpen(true)
  }

  const handleCreate = async () => {
    setSaving(true)
    try {
      const enabledItems = form.line_items.filter(i => i.enabled)
      if (enabledItems.length === 0) {
        toast.error('Add at least one fee item')
        setSaving(false)
        return
      }
      await invoicesApi.create({
        student_id: parseInt(form.student_id),
        billing_month: form.billing_month,
        due_date: form.due_date,
        line_items: enabledItems.map(i => ({
          fee_type_id: i.fee_type_id,
          amount: parseFloat(i.amount)
        }))
      })
      toast.success('Invoice created!')
      setCreateOpen(false)
      load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to create invoice')
    } finally { setSaving(false) }
  }

  const handleOverdueClick = (invoice) => {
    setInvoiceToAction(invoice)
    setConfirmOverdueOpen(true)
  }

  const handleConfirmOverdue = async () => {
    if (!invoiceToAction) return
    try {
      await invoicesApi.updateStatus(invoiceToAction.id, 'overdue')
      toast.success('Marked as overdue')
      load()
    } catch { toast.error('Failed to update status') }
  }

  const handleDeleteClick = (invoice) => {
    setInvoiceToAction(invoice)
    setConfirmDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!invoiceToAction) return
    try {
      await invoicesApi.delete(invoiceToAction.id)
      toast.success('Invoice deleted')
      load()
    } catch { toast.error('Failed to delete invoice') }
  }

  const handlePrint = (invoice) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${String(invoice.id).padStart(4, '0')}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .school-name { font-size: 24px; font-weight: bold; }
          .invoice-title { font-size: 20px; color: #666; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .info-box { background: #f5f5f5; padding: 15px; border-radius: 8px; }
          .info-label { font-size: 12px; color: #666; margin-bottom: 5px; }
          .info-value { font-size: 16px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f5f5f5; font-weight: bold; }
          .total-row { font-weight: bold; border-top: 2px solid #333; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="school-name">School Management System</div>
            <div style="color: #666;">Fee Invoice</div>
          </div>
          <div class="invoice-title">Invoice #${String(invoice.id).padStart(4, '0')}</div>
        </div>
        
        <div class="info-grid">
          <div class="info-box">
            <div class="info-label">Student</div>
            <div class="info-value">${invoice.student ? `${invoice.student.first_name} ${invoice.student.last_name}` : `Student #${invoice.student_id}`}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Class</div>
            <div class="info-value">${invoice.student?.current_class || 'N/A'}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Billing Month</div>
            <div class="info-value">${invoice.billing_month}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Due Date</div>
            <div class="info-value">${invoice.due_date}</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Fee Type</th>
              <th style="text-align: right;">Amount (PKR)</th>
            </tr>
          </thead>
          <tbody>
            ${(invoice.line_items || []).map(li => `
              <tr>
                <td>${li.fee_type?.fee_name || `Fee #${li.fee_type_id}`}</td>
                <td style="text-align: right;">${Number(li.amount).toLocaleString()}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td>Total</td>
              <td style="text-align: right;">${Number(invoice.total_amount || 0).toLocaleString()}</td>
            </tr>
            <tr>
              <td>Paid</td>
              <td style="text-align: right; color: green;">${Number(invoice.amount_paid || 0).toLocaleString()}</td>
            </tr>
            <tr class="total-row">
              <td>Balance Due</td>
              <td style="text-align: right; color: orange;">${Number(invoice.balance_due || 0).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <p>Status: ${invoice.status.toUpperCase()}</p>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const totalForInvoice = (inv) => Number(inv.total_amount || 0)
  const paidForInvoice = (inv) => Number(inv.amount_paid || 0)
  const balanceForInvoice = (inv) => Number(inv.balance_due || 0)

  const grandTotal = invoices.reduce((a, i) => a + totalForInvoice(i), 0)
  const grandPaid = invoices.reduce((a, i) => a + paidForInvoice(i), 0)
  const grandBalance = invoices.reduce((a, i) => a + balanceForInvoice(i), 0)

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Invoices & Billing"
        description="Manage student fee invoices"
        action={
          isAdmin && (
            <button onClick={openCreate} className="btn-primary">
              <Plus size={16} /> Create Invoice
            </button>
          )
        }
      />

      {/* Summary cards */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: 'Total Billed', value: grandTotal, color: 'text-slate-200' },
            { label: 'Total Collected', value: grandPaid, color: 'text-emerald-400' },
            { label: 'Outstanding', value: grandBalance, color: 'text-amber-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card px-4 py-3">
              <p className="text-xs text-slate-500 mb-0.5">{label}</p>
              <p className={`font-mono font-semibold ${color}`}>PKR {value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="mb-5">
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-44">
          <option value="">All Invoices</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </Select>
      </div>

      {loading ? <PageLoader /> : (
        <Table
          headers={['Invoice #', 'Student', 'Month', 'Total', 'Paid', 'Balance', 'Due Date', 'Status', 'Actions']}
          empty={invoices.length === 0 && (
            <EmptyState icon={FileText} title="No invoices found"
              description="Create an invoice to start billing"
              action={
                isAdmin && (
                  <button onClick={openCreate} className="btn-primary">
                    <Plus size={15} />Create Invoice
                  </button>
                )
              }
            />
          )}
        >
          {invoices.map(inv => (
            <tr key={inv.id} className="table-row">
              <td className="td font-mono text-xs text-slate-400">#{String(inv.id).padStart(4, '0')}</td>
              <td className="td text-slate-200">
                {inv.student ? `${inv.student.first_name} ${inv.student.last_name}` : `Student #${inv.student_id}`}
              </td>
              <td className="td font-mono text-xs">{inv.billing_month}</td>
              <td className="td font-mono text-sm">PKR {totalForInvoice(inv).toLocaleString()}</td>
              <td className="td font-mono text-sm text-emerald-400">PKR {paidForInvoice(inv).toLocaleString()}</td>
              <td className="td font-mono text-sm text-amber-400">PKR {balanceForInvoice(inv).toLocaleString()}</td>
              <td className="td text-slate-400 text-xs">{inv.due_date}</td>
              <td className="td"><StatusBadge status={inv.status} /></td>
              <td className="td">
                <div className="flex items-center gap-1">
                  <button onClick={() => { setSelected(inv); setDetailOpen(true) }}
                    className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-slate-200" title="View">
                    <Eye size={14} />
                  </button>
                  <button onClick={() => handlePrint(inv)}
                    className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-slate-200" title="Print">
                    <Printer size={14} />
                  </button>
                  {isAdmin && inv.status !== 'paid' && (
                    <button onClick={() => handleOverdueClick(inv)}
                      className="text-xs px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20">
                      Overdue
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => handleDeleteClick(inv)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {!loading && (
        <Pagination 
          skip={skip} 
          limit={limit} 
          totalItemsInCurrentPage={invoices.length} 
          onNext={() => setSkip(skip + limit)} 
          onPrev={() => setSkip(Math.max(0, skip - limit))} 
        />
      )}

      {/* Create Invoice Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Invoice" maxWidth="max-w-xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Student">
              <Select value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })}>
                <option value="">Select student...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.first_name} {s.last_name} — Class {s.current_class}</option>
                ))}
              </Select>
            </Field>
            <Field label="Billing Month">
              <input type="month" className="input" value={form.billing_month}
                onChange={e => setForm({ ...form, billing_month: e.target.value })} />
            </Field>
            <div className="col-span-2">
              <Field label="Due Date">
                <input type="date" className="input" value={form.due_date}
                  onChange={e => setForm({ ...form, due_date: e.target.value })} />
              </Field>
            </div>
          </div>

          {/* Fee Line Items */}
          <div>
            <label className="label">Fee Items</label>
            <div className="space-y-2">
              {form.line_items.map((item, i) => {
                const ft = feeTypes.find(f => f.id === item.fee_type_id)
                return (
                  <div key={i} className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-2.5">
                    <input type="checkbox" checked={item.enabled}
                      onChange={e => {
                        const items = [...form.line_items]
                        items[i] = { ...items[i], enabled: e.target.checked }
                        setForm({ ...form, line_items: items })
                      }}
                      className="w-4 h-4 accent-brand-500"
                    />
                    <span className="text-sm text-slate-300 flex-1">{ft?.fee_name}</span>
                    <span className="text-xs text-slate-500">PKR</span>
                    <input
                      type="number"
                      className="w-24 bg-slate-700/50 border border-slate-600/60 rounded-lg px-2 py-1 text-sm font-mono text-slate-200 outline-none focus:border-brand-500/60"
                      value={item.amount}
                      onChange={e => {
                        const items = [...form.line_items]
                        items[i] = { ...items[i], amount: e.target.value }
                        setForm({ ...form, line_items: items })
                      }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between items-center mt-3 px-4 py-2 bg-slate-800/30 rounded-xl">
              <span className="text-sm text-slate-400">Total</span>
              <span className="font-mono font-semibold text-slate-200">
                PKR {form.line_items.filter(i => i.enabled).reduce((a, i) => a + (parseFloat(i.amount) || 0), 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleCreate} disabled={saving || !form.student_id || !form.due_date} className="btn-primary">
            {saving ? <Spinner size={15} /> : <Plus size={15} />} Create Invoice
          </button>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`Invoice #${String(selected?.id || '').padStart(4, '0')}`} maxWidth="max-w-xl">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Student', selected.student ? `${selected.student.first_name} ${selected.student.last_name}` : `#${selected.student_id}`],
                ['Month', selected.billing_month],
                ['Due Date', selected.due_date],
                ['Status', selected.status],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-800/40 rounded-xl px-4 py-3">
                  <p className="text-xs text-slate-500 mb-0.5">{k}</p>
                  <p className="text-slate-200 font-medium capitalize">{v}</p>
                </div>
              ))}
            </div>

            {/* Line items */}
            <div>
              <p className="label mb-2">Fee Breakdown</p>
              <div className="space-y-1.5">
                {selected.line_items?.map(li => (
                  <div key={li.id} className="flex justify-between items-center py-2 border-b border-slate-800/60 last:border-0">
                    <span className="text-sm text-slate-400">{li.fee_type?.fee_name || `Fee #${li.fee_type_id}`}</span>
                    <span className="font-mono text-sm text-slate-200">PKR {Number(li.amount).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 font-semibold">
                  <span className="text-sm text-slate-300">Total</span>
                  <span className="font-mono text-slate-100">PKR {Number(selected.total_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-400">
                  <span className="text-sm">Paid</span>
                  <span className="font-mono text-sm">PKR {Number(selected.amount_paid || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-amber-400">
                  <span className="text-sm font-semibold">Balance</span>
                  <span className="font-mono font-semibold">PKR {Number(selected.balance_due || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Overdue Confirmation Modal */}
      <ConfirmModal
        open={confirmOverdueOpen}
        onClose={() => setConfirmOverdueOpen(false)}
        onConfirm={handleConfirmOverdue}
        title="Mark as Overdue"
        message={invoiceToAction ? `Are you sure you want to mark Invoice #${String(invoiceToAction.id).padStart(4, '0')} as overdue?` : ''}
        confirmText="Mark Overdue"
        isDestructive={true}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Invoice"
        message={invoiceToAction ? `Are you sure you want to delete Invoice #${String(invoiceToAction.id).padStart(4, '0')}? This action cannot be undone and will delete all associated payments.` : ''}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  )
}
