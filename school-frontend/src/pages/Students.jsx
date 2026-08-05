import { useEffect, useState } from 'react'
import { Plus, Search, Users, Edit2, Trash2, Link, Eye, UserCheck, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { studentsApi, parentsApi } from '../api'
import {
  SectionHeader, Table, Modal, ConfirmModal, Pagination, Field, Select, StatusBadge,
  PageLoader, EmptyState, Spinner
} from '../components/UI'

const CLASSES = ['Nursery','KG','1','2','3','4','5','6','7','8','9','10']

const formatCNIC = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 13)
  if (digits.length > 12) return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return digits
}

const emptyForm = {
  first_name: '', last_name: '', cnic_bform: '',
  dob: '', admission_date: '', current_class: 'Nursery', status: 'active'
}

export default function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [skip, setSkip] = useState(0)
  const limit = 50

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)

  const [form, setForm] = useState(emptyForm)
  const [editForm, setEditForm] = useState({})
  const [selected, setSelected] = useState(null)
  const [siblings, setSiblings] = useState([])
  const [parents, setParents] = useState([])
  const [linkData, setLinkData] = useState({ parent_id: '', relationship: 'Father' })
  const [detailParents, setDetailParents] = useState([])
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await studentsApi.list({ status: statusFilter || undefined, search: search || undefined, skip, limit })
      setStudents(res.data)
    } catch { toast.error('Failed to load students') }
    finally { setLoading(false) }
  }

  useEffect(() => { setSkip(0) }, [statusFilter, search])
  useEffect(() => { load() }, [statusFilter, search, skip])

  const validateCnicBform = (val) => /^\d{5}-\d{7}-\d$/.test(val)

  const handleCreate = async () => {
    if (!form.first_name || !form.last_name || !form.cnic_bform || !form.dob || !form.admission_date) {
      return toast.error('Please fill all required fields')
    }
    if (!validateCnicBform(form.cnic_bform)) {
      return toast.error('CNIC/B-Form must follow 00000-0000000-0 format (13 digits)')
    }
    setSaving(true)
    try {
      await studentsApi.create(form)
      toast.success('Student created!')
      setCreateOpen(false)
      setForm(emptyForm)
      load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to create student')
    } finally { setSaving(false) }
  }

  const handleEdit = async () => {
    if (!editForm.first_name || !editForm.last_name) {
      return toast.error('First name and last name are required')
    }
    setSaving(true)
    try {
      await studentsApi.update(selected.id, {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        current_class: editForm.current_class,
        status: editForm.status,
      })
      toast.success('Student updated!')
      setEditOpen(false)
      load()
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  const handleDeleteClick = (student) => {
    setStudentToDelete(student)
    setConfirmDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return
    try {
      await studentsApi.delete(studentToDelete.id)
      toast.success('Student deleted')
      load()
    } catch { toast.error('Failed to delete') }
  }

  const openDetail = async (student) => {
    setSelected(student)
    setDetailOpen(true)
    const [sibRes, stuRes] = await Promise.all([
      studentsApi.getSiblings(student.id),
      studentsApi.get(student.id),
    ])
    setSiblings(sibRes.data)
    setDetailParents(stuRes.data.parents || [])
  }

  const openLink = async (student) => {
    setSelected(student)
    const res = await parentsApi.list({ limit: 200 })
    setParents(res.data)
    setLinkOpen(true)
  }

  const handleLink = async () => {
    setSaving(true)
    try {
      await studentsApi.linkParent(selected.id, {
        parent_id: parseInt(linkData.parent_id),
        relationship: linkData.relationship
      })
      toast.success('Parent linked!')
      setLinkOpen(false)
      load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to link parent')
    } finally { setSaving(false) }
  }

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Students Directory"
        description={`${students.length} students currently listed`}
        action={
          <button onClick={() => setCreateOpen(true)} className="btn-primary">
            <Plus size={16} /> Add Student
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 min-w-0">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9 pr-10"
            placeholder="Search by name or class..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') setSearch(searchInput) }}
          />
          <button
            onClick={() => setSearch(searchInput)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
            title="Search"
          >
            <Search size={14} />
          </button>
        </div>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-40">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="graduated">Graduated</option>
        </Select>
      </div>

      {loading ? <PageLoader /> : (
        <Table
          headers={['Name', 'Class', 'CNIC/B-Form', 'Admission', 'Status', 'Actions']}
          empty={students.length === 0 && (
            <EmptyState icon={Users} title="No students found"
              description="Start by adding your first student to the system"
              action={
                <button onClick={() => setCreateOpen(true)} className="btn-primary">
                  <Plus size={15} />Add Student
                </button>
              }
            />
          )}
        >
          {students.map(s => (
            <tr key={s.id} className="table-row">
              <td className="td font-medium text-gray-700">{s.first_name} {s.last_name}</td>
              <td className="td">
                <span className="font-mono text-xs bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600">Class {s.current_class}</span>
              </td>
              <td className="td font-mono text-xs text-gray-400">{s.cnic_bform}</td>
              <td className="td text-gray-500 text-sm">{s.admission_date}</td>
              <td className="td">
                <select
                  value={s.status}
                  onChange={async (e) => {
                    try {
                      await studentsApi.update(s.id, { status: e.target.value });
                      toast.success('Student status updated!');
                      load();
                    } catch (err) {
                      toast.error('Failed to update status');
                    }
                  }}
                  className={`badge badge-${s.status} cursor-pointer appearance-none outline-none`}
                  style={{ paddingRight: '0.5rem' }}
                >
                  <option value="active" className="bg-white text-teal-600">active</option>
                  <option value="withdrawn" className="bg-white text-red-400">withdrawn</option>
                  <option value="graduated" className="bg-white text-teal-600">graduated</option>
                </select>
              </td>
              <td className="td">
                <div className="flex items-center gap-1">
                  <button onClick={() => openDetail(s)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600" title="View">
                    <Eye size={14} />
                  </button>
                  <button onClick={() => openLink(s)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600" title="Link parent">
                    <Link size={14} />
                  </button>
                  <button onClick={() => { setSelected(s); setEditForm({ first_name: s.first_name, last_name: s.last_name, current_class: s.current_class, status: s.status }); setEditOpen(true) }}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600" title="Edit">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDeleteClick(s)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500" title="Delete">
                    <Trash2 size={14} />
                  </button>
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
          totalItemsInCurrentPage={students.length}
          onNext={() => setSkip(skip + limit)}
          onPrev={() => setSkip(Math.max(0, skip - limit))}
        />
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New Student">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name">
            <input className="input" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} placeholder="Ali" />
          </Field>
          <Field label="Last Name">
            <input className="input" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} placeholder="Khan" />
          </Field>
          <Field label="CNIC / B-Form">
            <input className="input" value={form.cnic_bform} onChange={e => setForm({ ...form, cnic_bform: formatCNIC(e.target.value) })} maxLength={15} placeholder="34201-1234567-1" />
          </Field>
          <Field label="Date of Birth">
            <input type="date" className="input" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
          </Field>
          <Field label="Admission Date">
            <input type="date" className="input" value={form.admission_date} onChange={e => setForm({ ...form, admission_date: e.target.value })} />
          </Field>
          <Field label="Current Class">
            <Select value={form.current_class} onChange={e => setForm({ ...form, current_class: e.target.value })}>
              {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
            </Select>
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleCreate} disabled={saving} className="btn-primary">
            {saving ? <Spinner size={15} /> : <Plus size={15} />} Create Student
          </button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Student">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name">
            <input className="input" value={editForm.first_name || ''} onChange={e => setEditForm({ ...editForm, first_name: e.target.value })} />
          </Field>
          <Field label="Last Name">
            <input className="input" value={editForm.last_name || ''} onChange={e => setEditForm({ ...editForm, last_name: e.target.value })} />
          </Field>
          <Field label="Current Class">
            <Select value={editForm.current_class || ''} onChange={e => setEditForm({ ...editForm, current_class: e.target.value })}>
              {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={editForm.status || ''} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="graduated">Graduated</option>
            </Select>
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setEditOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleEdit} disabled={saving} className="btn-primary">
            {saving ? <Spinner size={15} /> : null} Save Changes
          </button>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Student Details" maxWidth="max-w-xl">
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Full Name', `${selected.first_name} ${selected.last_name}`],
                ['CNIC/B-Form', selected.cnic_bform],
                ['Class', `Class ${selected.current_class}`],
                ['Date of Birth', selected.dob],
                ['Admission Date', selected.admission_date],
                ['Status', selected.status],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                  <p className="text-gray-700 font-medium capitalize">{v}</p>
                </div>
              ))}
            </div>
            {/* Linked Parents */}
            {detailParents.length > 0 ? (
              <div>
                <p className="label mb-2">Parents / Guardians ({detailParents.length})</p>
                <div className="space-y-1.5">
                  {detailParents.map(p => (
                    <div key={p.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                      <UserCheck size={14} className="text-teal-500" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-600 block truncate">{p.guardian_name}</span>
                        <span className="text-xs text-gray-400">{p.relationship || 'Guardian'} · <Phone size={10} className="inline" /> {p.contact_no}</span>
                      </div>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation()
                          try {
                            await studentsApi.unlinkParent(selected.id, p.id)
                            toast.success('Parent unlinked')
                            const stuRes = await studentsApi.get(selected.id)
                            setDetailParents(stuRes.data.parents || [])
                            load()
                          } catch { toast.error('Failed to unlink parent') }
                        }}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                        title="Unlink parent"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-400">No parents linked yet</p>
              </div>
            )}

            {siblings.length > 0 && (
              <div>
                <p className="label mb-2">Siblings ({siblings.length})</p>
                <div className="space-y-1.5">
                  {siblings.map(sib => (
                    <div key={sib.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                      <Users size={14} className="text-teal-500" />
                      <span className="text-sm text-gray-600">{sib.first_name} {sib.last_name}</span>
                      <span className="text-xs text-gray-400 ml-auto">Class {sib.current_class}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Link Parent Modal */}
      <Modal open={linkOpen} onClose={() => setLinkOpen(false)} title="Link Parent to Student">
        <div className="space-y-4">
          <Field label="Select Parent">
            <Select value={linkData.parent_id} onChange={e => setLinkData({ ...linkData, parent_id: e.target.value })}>
              <option value="">Choose a parent...</option>
              {parents.map(p => (
                <option key={p.id} value={p.id}>
                  {p.guardian_name} — {p.cnic ? `${p.cnic.slice(0, 5)}-XXXXXXX-${p.cnic.slice(-1)}` : 'No CNIC'}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Relationship">
            <Select value={linkData.relationship} onChange={e => setLinkData({ ...linkData, relationship: e.target.value })}>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Guardian">Guardian</option>
              <option value="Other">Other</option>
            </Select>
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setLinkOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleLink} disabled={saving || !linkData.parent_id} className="btn-primary">
            {saving ? <Spinner size={15} /> : <Link size={15} />} Link Parent
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Student"
        message={studentToDelete ? `Are you sure you want to delete ${studentToDelete.first_name} ${studentToDelete.last_name}? This action cannot be undone.` : ''}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  )
}
