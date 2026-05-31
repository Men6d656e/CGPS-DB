import { useEffect, useState } from 'react'
import { Plus, Search, UserCheck, Edit2, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { parentsApi } from '../api'
import { SectionHeader, Table, Modal, Field, PageLoader, EmptyState, Spinner } from '../components/UI'

const emptyForm = {
  guardian_name: '', cnic: '', contact_no: '',
  whatsapp_no: '', address: ''
}

export default function Parents() {
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await parentsApi.list({ limit: 200 })
      setParents(res.data)
    } catch { toast.error('Failed to load parents') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = parents.filter(p =>
    `${p.guardian_name} ${p.cnic} ${p.contact_no}`
      .toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async () => {
    setSaving(true)
    try {
      await parentsApi.create({ ...form, whatsapp_no: form.whatsapp_no || null, address: form.address || null })
      toast.success('Parent added!')
      setCreateOpen(false)
      setForm(emptyForm)
      load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to create parent')
    } finally { setSaving(false) }
  }

  const handleEdit = async () => {
    setSaving(true)
    try {
      await parentsApi.update(selected.id, editForm)
      toast.success('Parent updated!')
      setEditOpen(false)
      load()
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Parents / Guardians"
        description={`${parents.length} registered guardians`}
        action={
          <button onClick={() => setCreateOpen(true)} className="btn-primary">
            <Plus size={16} /> Add Parent
          </button>
        }
      />

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="input pl-9 max-w-sm"
          placeholder="Search by name, CNIC, phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? <PageLoader /> : (
        <Table
          headers={['Guardian Name', 'CNIC', 'Contact', 'WhatsApp', 'Address', 'Actions']}
          empty={filtered.length === 0 && (
            <EmptyState icon={UserCheck} title="No parents found"
              description="Add guardians to link them with students"
              action={<button onClick={() => setCreateOpen(true)} className="btn-primary"><Plus size={15} />Add Parent</button>}
            />
          )}
        >
          {filtered.map(p => (
            <tr key={p.id} className="table-row">
              <td className="td font-medium text-slate-200">{p.guardian_name}</td>
              <td className="td font-mono text-xs text-slate-400">{p.cnic}</td>
              <td className="td">
                <a href={`tel:${p.contact_no}`} className="flex items-center gap-1.5 text-brand-400 hover:text-brand-300 transition-colors">
                  <Phone size={13} />{p.contact_no}
                </a>
              </td>
              <td className="td text-slate-400">{p.whatsapp_no || '—'}</td>
              <td className="td text-slate-400 max-w-xs truncate">{p.address || '—'}</td>
              <td className="td">
                <button
                  onClick={() => { setSelected(p); setEditForm({ guardian_name: p.guardian_name, contact_no: p.contact_no, whatsapp_no: p.whatsapp_no || '', address: p.address || '' }); setEditOpen(true) }}
                  className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
                >
                  <Edit2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Parent / Guardian">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full Name">
            <input className="input" value={form.guardian_name} onChange={e => setForm({ ...form, guardian_name: e.target.value })} placeholder="Muhammad Tariq" />
          </Field>
          <Field label="CNIC">
            <input className="input" value={form.cnic} onChange={e => setForm({ ...form, cnic: e.target.value })} placeholder="3520112345671" />
          </Field>
          <Field label="Contact Number">
            <input className="input" value={form.contact_no} onChange={e => setForm({ ...form, contact_no: e.target.value })} placeholder="03001234567" />
          </Field>
          <Field label="WhatsApp (Optional)">
            <input className="input" value={form.whatsapp_no} onChange={e => setForm({ ...form, whatsapp_no: e.target.value })} placeholder="03001234567" />
          </Field>
          <div className="col-span-2">
            <Field label="Address (Optional)">
              <textarea className="input resize-none h-20" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="House #5, Street 3, Lahore" />
            </Field>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleCreate} disabled={saving} className="btn-primary">
            {saving ? <Spinner size={15} /> : <Plus size={15} />} Add Parent
          </button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Parent">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full Name">
            <input className="input" value={editForm.guardian_name || ''} onChange={e => setEditForm({ ...editForm, guardian_name: e.target.value })} />
          </Field>
          <Field label="Contact Number">
            <input className="input" value={editForm.contact_no || ''} onChange={e => setEditForm({ ...editForm, contact_no: e.target.value })} />
          </Field>
          <Field label="WhatsApp">
            <input className="input" value={editForm.whatsapp_no || ''} onChange={e => setEditForm({ ...editForm, whatsapp_no: e.target.value })} />
          </Field>
          <div className="col-span-2">
            <Field label="Address">
              <textarea className="input resize-none h-20" value={editForm.address || ''} onChange={e => setEditForm({ ...editForm, address: e.target.value })} />
            </Field>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setEditOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleEdit} disabled={saving} className="btn-primary">
            {saving ? <Spinner size={15} /> : null} Save Changes
          </button>
        </div>
      </Modal>
    </div>
  )
}
