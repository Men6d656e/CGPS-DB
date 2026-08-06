import { useEffect, useState } from 'react'
import { Plus, DollarSign, Edit2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { feesApi } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { SectionHeader, Modal, Field, PageLoader, EmptyState, Spinner, ConfirmModal } from '../components/UI'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Switch } from '../components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

const CLASSES = ['Nursery','KG','1','2','3','4','5','6','7','8','9','10']

export default function Fees() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [overrideOpen, setOverrideOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ fee_name: '', default_amount: '', description: '' })
  const [editForm, setEditForm] = useState({})
  const [overrideForm, setOverrideForm] = useState({ class_name: 'Nursery', amount: '' })
  const [saving, setSaving] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [feeToDelete, setFeeToDelete] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await feesApi.list()
      setFees(res.data)
    } catch { toast.error('Failed to load fee types') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    setSaving(true)
    try {
      await feesApi.create({ ...form, default_amount: parseFloat(form.default_amount) })
      toast.success('Fee type created!')
      setCreateOpen(false)
      setForm({ fee_name: '', default_amount: '', description: '' })
      load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to create')
    } finally { setSaving(false) }
  }

  const handleEdit = async () => {
    setSaving(true)
    try {
      await feesApi.update(selected.id, {
        ...editForm,
        default_amount: editForm.default_amount ? parseFloat(editForm.default_amount) : undefined
      })
      toast.success('Updated!')
      setEditOpen(false)
      load()
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  const handleAddOverride = async () => {
    setSaving(true)
    try {
      await feesApi.addOverride(selected.id, { class_name: overrideForm.class_name, amount: parseFloat(overrideForm.amount) })
      toast.success('Override added!')
      setOverrideOpen(false)
      load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to add override')
    } finally { setSaving(false) }
  }

  const handleDeleteClick = (fee) => {
    setFeeToDelete(fee)
    setConfirmDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!feeToDelete) return
    try {
      await feesApi.delete(feeToDelete.id)
      toast.success('Fee type deleted')
      load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to delete fee type (may be used in invoices)')
    }
  }

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Fee Structure"
        description="Define fee types and per-class overrides"
        action={
          isAdmin && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={16} /> Add Fee Type
            </Button>
          )
        }
      />

      {loading ? <PageLoader /> : fees.length === 0 ? (
        <EmptyState icon={DollarSign} title="No fee types yet"
          description="Add tuition fee, library fee, etc."
          action={isAdmin && <Button onClick={() => setCreateOpen(true)}><Plus size={15} />Add Fee Type</Button>}
        />) : (
        <div className="space-y-3">
          {fees.map(fee => (
            <div key={fee.id} className="card overflow-hidden">
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                onClick={() => setExpanded(expanded === fee.id ? null : fee.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                    <DollarSign size={16} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">{fee.fee_name}</p>
                    {fee.description && <p className="text-xs text-slate-500 mt-0.5">{fee.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-mono font-medium text-slate-200">PKR {Number(fee.default_amount).toLocaleString()}</p>
                    <p className="text-xs text-slate-500">default / month</p>
                  </div>
                  {isAdmin ? (
                    <span 
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await feesApi.update(fee.id, { is_active: !fee.is_active });
                          toast.success('Fee status updated!');
                          load();
                        } catch {
                          toast.error('Failed to update status');
                        }
                      }}
                      className={`badge ${fee.is_active ? 'badge-active' : 'badge-withdrawn'} cursor-pointer`}
                      title="Click to toggle status"
                    >
                      {fee.is_active ? 'Active' : 'Inactive'}
                    </span>
                  ) : (
                    <span className={`badge ${fee.is_active ? 'badge-active' : 'badge-withdrawn'}`}>
                      {fee.is_active ? 'Active' : 'Inactive'}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={e => { e.stopPropagation(); setSelected(fee); setEditForm({ fee_name: fee.fee_name, default_amount: fee.default_amount, description: fee.description || '', is_active: fee.is_active }); setEditOpen(true) }}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={e => { e.stopPropagation(); handleDeleteClick(fee) }}
                          title="Delete fee type"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </>
                    )}
                    {expanded === fee.id ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                  </div>
                </div>
              </div>

              {/* Class Overrides Panel */}
              {expanded === fee.id && (
                <div className="border-t border-slate-800/60 bg-slate-900/50 px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Class-specific Overrides</p>
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelected(fee); setOverrideOpen(true) }}
                        className="h-8 text-xs"
                      >
                        <Plus size={12} /> Add Override
                      </Button>
                    )}
                  </div>
                  {fee.class_overrides.length === 0 ? (
                    <p className="text-sm text-slate-500">No overrides — all classes use default amount</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {fee.class_overrides.map(ov => (
                        <div key={ov.id} className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2">
                          <span className="text-xs text-slate-400">Class {ov.class_name}</span>
                          <span className="text-xs font-mono text-slate-200 font-medium">PKR {Number(ov.amount).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Fee Type">
        <div className="space-y-4">
          <Field label="Fee Name">
            <Input value={form.fee_name} onChange={e => setForm({ ...form, fee_name: e.target.value })} placeholder="Tuition Fee" />
          </Field>
          <Field label="Default Amount (PKR)">
            <Input type="number" value={form.default_amount} onChange={e => setForm({ ...form, default_amount: e.target.value })} placeholder="3500" />
          </Field>
          <Field label="Description (Optional)">
            <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Monthly tuition fee" />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? <Spinner size={15} /> : <Plus size={15} />} Create
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Fee Type">
        <div className="space-y-4">
          <Field label="Fee Name">
            <Input value={editForm.fee_name || ''} onChange={e => setEditForm({ ...editForm, fee_name: e.target.value })} />
          </Field>
          <Field label="Default Amount (PKR)">
            <Input type="number" value={editForm.default_amount || ''} onChange={e => setEditForm({ ...editForm, default_amount: e.target.value })} />
          </Field>
          <Field label="Description">
            <Input value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
          </Field>
          <Field label="Status">
            <div className="flex items-center gap-2">
              <Switch checked={!!editForm.is_active} onCheckedChange={v => setEditForm({ ...editForm, is_active: v })} />
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEdit} disabled={saving}>
            {saving ? <Spinner size={15} /> : null} Save
          </Button>
        </div>
      </Modal>

      {/* Add Override Modal */}
      <Modal open={overrideOpen} onClose={() => setOverrideOpen(false)} title={`Class Override — ${selected?.fee_name}`}>
        <div className="space-y-4">
          <Field label="Class">
            <Select value={overrideForm.class_name} onValueChange={v => setOverrideForm({ ...overrideForm, class_name: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLASSES.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Amount (PKR)">
            <Input type="number" value={overrideForm.amount} onChange={e => setOverrideForm({ ...overrideForm, amount: e.target.value })} placeholder="4000" />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setOverrideOpen(false)}>Cancel</Button>
          <Button onClick={handleAddOverride} disabled={saving}>
            {saving ? <Spinner size={15} /> : <Plus size={15} />} Add Override
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Fee Type"
        message={feeToDelete ? `Are you sure you want to delete ${feeToDelete.fee_name}? This action cannot be undone.` : ''}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  )
}
