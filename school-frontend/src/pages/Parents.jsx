import { useEffect, useState } from 'react'
import { Plus, Search, UserCheck, Edit2, Phone, Trash2, Eye, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { parentsApi } from '../api'
import { useDebouncedValue } from '../hooks/useDebounce'
import { SectionHeader, Table, Modal, ConfirmModal, Pagination, Field, PageLoader, EmptyState, Spinner } from '../components/UI'

const formatCNIC = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 13)
  if (digits.length > 12) return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return digits
}

const emptyForm = {
  guardian_name: '', cnic: '', contact_no: '',
  whatsapp_no: '', address: ''
}

export default function Parents() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [skip, setSkip] = useState(0)
  const limit = 50
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [linkedStudents, setLinkedStudents] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [parentToDelete, setParentToDelete] = useState(null)

  // Live search with debounce (SPEC2 Phase 6)
  const debouncedSearch = useDebouncedValue(searchInput, 400)

  const load = async () => {
    setLoading(true)
    try {
      const res = await parentsApi.list({ search: search || undefined, skip, limit })
      setParents(res.data)
    } catch { toast.error('Failed to load parents') }
    finally { setLoading(false) }
  }

  useEffect(() => { setSearch(debouncedSearch) }, [debouncedSearch])

  useEffect(() => { 
    setSkip(0)
  }, [search])

  useEffect(() => { load() }, [search, skip])

  const handleCreate = async () => {
    if (!form.guardian_name || !form.contact_no) {
      return toast.error('Name and Contact Number are required')
    }
    if (form.cnic && !/^\d{5}-\d{7}-\d$/.test(form.cnic)) {
      return toast.error('CNIC must follow 00000-0000000-0 format')
    }
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
    if (!editForm.guardian_name || !editForm.contact_no) {
      return toast.error('Name and Contact Number are required')
    }
    setSaving(true)
    try {
      await parentsApi.update(selected.id, editForm)
      toast.success('Parent updated!')
      setEditOpen(false)
      load()
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  const handleDeleteClick = (parent) => {
    setParentToDelete(parent)
    setConfirmDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!parentToDelete) return
    try {
      await parentsApi.delete(parentToDelete.id)
      toast.success('Parent deleted')
      load()
    } catch { toast.error('Failed to delete parent (may be linked to students)') }
  }

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Parents / Guardians"
        description={`${parents.length} registered guardians`}
        action={
          isAdmin && (
            <button onClick={() => setCreateOpen(true)} className="btn-primary">
              <Plus size={16} /> Add Parent
            </button>
          )
        }
      />

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="input pl-9 pr-10"
          placeholder="Search by name, phone, WhatsApp, or CNIC..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') setSearch(searchInput) }}
        />
        <button
          onClick={() => setSearch(searchInput)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 transition-colors"
          title="Search"
        >
          <Search size={14} />
        </button>
      </div>

      {loading ? <PageLoader /> : (
        <Table
          headers={['Guardian Name', 'CNIC', 'Contact', 'WhatsApp', 'Address', 'Actions']}
          empty={parents.length === 0 && (
            <EmptyState icon={UserCheck} title="No parents found"
              description="Add guardians to link them with students"
              action={
                isAdmin && (
                  <button onClick={() => setCreateOpen(true)} className="btn-primary">
                    <Plus size={15} />Add Parent
                  </button>
                )
              }
            />
          )}
        >
          {parents.map(p => (
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
                <div className="flex items-center gap-1">
                  <button
                    onClick={async () => {
                      setSelected(p)
                      try {
                        const res = await parentsApi.get(p.id)
                        setLinkedStudents(res.data.students || [])
                      } catch { setLinkedStudents([]) }
                      setDetailOpen(true)
                    }}
                    className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
                    title="View details"
                  >
                    <Eye size={14} />
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => { setSelected(p); setEditForm({ guardian_name: p.guardian_name, contact_no: p.contact_no, whatsapp_no: p.whatsapp_no || '', address: p.address || '' }); setEditOpen(true) }}
                        className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(p)} 
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors" 
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
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
          totalItemsInCurrentPage={parents.length} 
          onNext={() => setSkip(skip + limit)} 
          onPrev={() => setSkip(Math.max(0, skip - limit))} 
        />
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Parent / Guardian">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full Name">
            <input className="input" value={form.guardian_name} onChange={e => setForm({ ...form, guardian_name: e.target.value })} placeholder="Muhammad Tariq" />
          </Field>
          <Field label="CNIC">
            <input className="input" value={form.cnic} onChange={e => setForm({ ...form, cnic: formatCNIC(e.target.value) })} maxLength={15} placeholder="35201-1234567-1" />
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

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={selected?.guardian_name || 'Parent Details'} maxWidth="max-w-xl">
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Guardian Name', selected.guardian_name],
                ['CNIC', selected.cnic],
                ['Contact', selected.contact_no],
                ['WhatsApp', selected.whatsapp_no || '—'],
                ['Address', selected.address || '—'],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-800/40 rounded-xl px-4 py-3">
                  <p className="text-xs text-slate-500 mb-0.5">{k}</p>
                  <p className="text-slate-200 font-medium capitalize">{v}</p>
                </div>
              ))}
            </div>
            {/* Linked Students */}
            <div>
              <p className="label mb-2">Linked Students {linkedStudents.length > 0 ? `(${linkedStudents.length})` : ''}</p>
              {linkedStudents.length > 0 ? (
                <div className="space-y-1.5">
                  {linkedStudents.map(s => (
                    <div key={s.id} className="flex items-center gap-3 bg-slate-800/40 rounded-xl px-4 py-2.5">
                      <GraduationCap size={14} className="text-brand-400" />
                      <span className="text-sm text-slate-300">{s.first_name} {s.last_name}</span>
                      <span className="text-xs text-slate-500 ml-auto">Class {s.current_class}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No students linked to this guardian</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Parent"
        message={parentToDelete ? `Are you sure you want to delete ${parentToDelete.guardian_name}?` : ''}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  )
}
