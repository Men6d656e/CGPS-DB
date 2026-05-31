import { useEffect, useState } from 'react'
import { Plus, DollarSign, Edit2, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { feesApi } from '../api'
import { SectionHeader, Modal, Field, PageLoader, EmptyState, Spinner } from '../components/UI'

const CLASSES = ['Nursery','KG','1','2','3','4','5','6','7','8','9','10']

export default function Fees() {
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

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Fee Structure"
        description="Define fee types and per-class overrides"
        action={
          <button onClick={() => setCreateOpen(true)} className="btn-primary">
            <Plus size={16} /> Add Fee Type
          </button>
        }
      />

      {loading ? <PageLoader /> : fees.length === 0 ? (
        <EmptyState icon={DollarSign} title="No fee types yet"
          description="Add tuition fee, library fee, etc."
          action={<button onClick={() => setCreateOpen(true)} className="btn-primary"><Plus size={15} />Add Fee Type</button>}
        />
      ) : (
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
                  <span 
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await feesApi.update(fee.id, { is_active: !fee.is_active });
                        toast.success('Fee status updated!');
                        load();
                      } catch (err) {
                        toast.error('Failed to update status');
                      }
                    }}
                    className={`badge ${fee.is_active ? 'badge-active' : 'badge-withdrawn'} cursor-pointer`}
                    title="Click to toggle status"
                  >
                    {fee.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={e => { e.stopPropagation(); setSelected(fee); setEditForm({ fee_name: fee.fee_name, default_amount: fee.default_amount, description: fee.description || '', is_active: fee.is_active }); setEditOpen(true) }}
                      className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
                    >
                      <Edit2 size={14} />
                    </button>
                    {expanded === fee.id ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                  </div>
                </div>
              </div>

              {/* Class Overrides Panel */}
              {expanded === fee.id && (
                <div className="border-t border-slate-800/60 bg-slate-900/50 px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Class-specific Overrides</p>
                    <button
                      onClick={() => { setSelected(fee); setOverrideOpen(true) }}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      <Plus size={12} /> Add Override
                    </button>
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
            <input className="input" value={form.fee_name} onChange={e => setForm({ ...form, fee_name: e.target.value })} placeholder="Tuition Fee" />
          </Field>
          <Field label="Default Amount (PKR)">
            <input type="number" className="input" value={form.default_amount} onChange={e => setForm({ ...form, default_amount: e.target.value })} placeholder="3500" />
          </Field>
          <Field label="Description (Optional)">
            <input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Monthly tuition fee" />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleCreate} disabled={saving} className="btn-primary">
            {saving ? <Spinner size={15} /> : <Plus size={15} />} Create
          </button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Fee Type">
        <div className="space-y-4">
          <Field label="Fee Name">
            <input className="input" value={editForm.fee_name || ''} onChange={e => setEditForm({ ...editForm, fee_name: e.target.value })} />
          </Field>
          <Field label="Default Amount (PKR)">
            <input type="number" className="input" value={editForm.default_amount || ''} onChange={e => setEditForm({ ...editForm, default_amount: e.target.value })} />
          </Field>
          <Field label="Description">
            <input className="input" value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
          </Field>
          <Field label="Status">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editForm.is_active} onChange={e => setEditForm({ ...editForm, is_active: e.target.checked })} className="w-4 h-4 accent-brand-500" />
              <span className="text-sm text-slate-300">Active</span>
            </label>
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setEditOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleEdit} disabled={saving} className="btn-primary">
            {saving ? <Spinner size={15} /> : null} Save
          </button>
        </div>
      </Modal>

      {/* Add Override Modal */}
      <Modal open={overrideOpen} onClose={() => setOverrideOpen(false)} title={`Class Override — ${selected?.fee_name}`}>
        <div className="space-y-4">
          <Field label="Class">
            <select className="input" value={overrideForm.class_name} onChange={e => setOverrideForm({ ...overrideForm, class_name: e.target.value })}>
              {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </Field>
          <Field label="Amount (PKR)">
            <input type="number" className="input" value={overrideForm.amount} onChange={e => setOverrideForm({ ...overrideForm, amount: e.target.value })} placeholder="4000" />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setOverrideOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleAddOverride} disabled={saving} className="btn-primary">
            {saving ? <Spinner size={15} /> : <Plus size={15} />} Add Override
          </button>
        </div>
      </Modal>
    </div>
  )
}
