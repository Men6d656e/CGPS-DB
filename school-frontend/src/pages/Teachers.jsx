import { useEffect, useState } from 'react'
import { Plus, Search, Users, Edit2, Trash2, Eye, Phone, Briefcase, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import { teachersApi } from '../api'
import {
  SectionHeader, Table, Modal, ConfirmModal, Pagination, Field, Select,
  PageLoader, EmptyState, Spinner
} from '../components/UI'

const STATUS_OPTIONS = ['active', 'inactive', 'resigned']

const emptyForm = {
  first_name: '', last_name: '', email: '', phone: '',
  subject: '', qualification: '', hire_date: '', salary: '',
  address: '', status: 'active'
}

export default function Teachers() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [skip, setSkip] = useState(0)
  const limit = 50

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [teacherToDelete, setTeacherToDelete] = useState(null)

  const [form, setForm] = useState(emptyForm)
  const [editForm, setEditForm] = useState({})
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await teachersApi.list({ status: statusFilter || undefined, search: search || undefined, skip, limit })
      setTeachers(res.data)
    } catch { toast.error('Failed to load teachers') }
    finally { setLoading(false) }
  }

  useEffect(() => { setSkip(0) }, [statusFilter, search])
  useEffect(() => { load() }, [statusFilter, search, skip])

  const handleCreate = async () => {
    if (!form.first_name || !form.last_name || !form.phone || !form.hire_date) {
      return toast.error('First name, last name, phone, and hire date are required')
    }
    setSaving(true)
    try {
      await teachersApi.create({
        ...form,
        salary: form.salary ? parseFloat(form.salary) : null,
        email: form.email || null,
        subject: form.subject || null,
        qualification: form.qualification || null,
        address: form.address || null,
      })
      toast.success('Teacher added!')
      setCreateOpen(false)
      setForm(emptyForm)
      load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to create teacher')
    } finally { setSaving(false) }
  }

  const handleEdit = async () => {
    if (!editForm.first_name || !editForm.last_name || !editForm.phone) {
      return toast.error('First name, last name, and phone are required')
    }
    setSaving(true)
    try {
      await teachersApi.update(selected.id, {
        ...editForm,
        salary: editForm.salary ? parseFloat(editForm.salary) : null,
      })
      toast.success('Teacher updated!')
      setEditOpen(false)
      load()
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  const handleDeleteClick = (teacher) => {
    setTeacherToDelete(teacher)
    setConfirmDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return
    try {
      await teachersApi.delete(teacherToDelete.id)
      toast.success('Teacher deleted')
      load()
    } catch { toast.error('Failed to delete') }
  }

  const statusColors = {
    active: 'badge-active',
    inactive: 'badge-withdrawn',
    resigned: 'badge-pending',
  }

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Teachers / Staff"
        description={`${teachers.length} teachers currently listed`}
        action={
          <button onClick={() => setCreateOpen(true)} className="btn-primary">
            <Plus size={16} /> Add Teacher
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 min-w-0">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9 pr-10"
            placeholder="Search by name, subject, phone..."
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
          <option value="inactive">Inactive</option>
          <option value="resigned">Resigned</option>
        </Select>
      </div>

      {loading ? <PageLoader /> : (
        <Table
          headers={['Name', 'Subject', 'Phone', 'Qualification', 'Hire Date', 'Status', 'Actions']}
          empty={teachers.length === 0 && (
            <EmptyState icon={Users} title="No teachers found"
              description="Add teaching staff to the system"
              action={
                <button onClick={() => setCreateOpen(true)} className="btn-primary">
                  <Plus size={15} />Add Teacher
                </button>
              }
            />
          )}
        >
          {teachers.map(t => (
            <tr key={t.id} className="table-row">
              <td className="td font-medium text-gray-700">{t.first_name} {t.last_name}</td>
              <td className="td text-gray-500">
                {t.subject ? (
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <Briefcase size={12} className="text-teal-500" />
                    {t.subject}
                  </span>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              <td className="td">
                <a href={`tel:${t.phone}`} className="flex items-center gap-1.5 text-teal-600 hover:text-teal-500 transition-colors">
                  <Phone size={13} />{t.phone}
                </a>
              </td>
              <td className="td text-gray-500 text-xs max-w-[140px] truncate">
                {t.qualification ? (
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap size={12} className="text-gray-400" />
                    {t.qualification}
                  </span>
                ) : '—'}
              </td>
              <td className="td text-gray-500 text-xs">{t.hire_date}</td>
              <td className="td">
                <span className={`${statusColors[t.status] || statusColors.active}`}>
                  {t.status}
                </span>
              </td>
              <td className="td">
                <div className="flex items-center gap-1">
                  <button onClick={() => { setSelected(t); setDetailOpen(true) }}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600" title="View">
                    <Eye size={14} />
                  </button>
                  <button onClick={() => { setSelected(t); setEditForm({
                    first_name: t.first_name, last_name: t.last_name,
                    email: t.email || '', phone: t.phone,
                    subject: t.subject || '', qualification: t.qualification || '',
                    salary: t.salary ? String(t.salary) : '',
                    address: t.address || '', status: t.status
                  }); setEditOpen(true) }}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600" title="Edit">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDeleteClick(t)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500" title="Delete">
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
          totalItemsInCurrentPage={teachers.length}
          onNext={() => setSkip(skip + limit)}
          onPrev={() => setSkip(Math.max(0, skip - limit))}
        />
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New Teacher" maxWidth="max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name">
            <input className="input" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} placeholder="Ayesha" />
          </Field>
          <Field label="Last Name">
            <input className="input" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} placeholder="Khan" />
          </Field>
          <Field label="Email">
            <input type="email" className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ayesha@school.edu" />
          </Field>
          <Field label="Phone">
            <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="03001234567" />
          </Field>
          <Field label="Subject">
            <input className="input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Mathematics" />
          </Field>
          <Field label="Qualification">
            <input className="input" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} placeholder="M.Sc. Mathematics" />
          </Field>
          <Field label="Hire Date">
            <input type="date" className="input" value={form.hire_date} onChange={e => setForm({ ...form, hire_date: e.target.value })} />
          </Field>
          <Field label="Salary (PKR)">
            <input type="number" className="input" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="50000" />
          </Field>
          <div className="col-span-2">
            <Field label="Address">
              <textarea className="input resize-none h-20" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="House #10, Street 5, Lahore" />
            </Field>
          </div>
          <Field label="Status">
            <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </Select>
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleCreate} disabled={saving} className="btn-primary">
            {saving ? <Spinner size={15} /> : <Plus size={15} />} Add Teacher
          </button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Teacher" maxWidth="max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name">
            <input className="input" value={editForm.first_name || ''} onChange={e => setEditForm({ ...editForm, first_name: e.target.value })} />
          </Field>
          <Field label="Last Name">
            <input className="input" value={editForm.last_name || ''} onChange={e => setEditForm({ ...editForm, last_name: e.target.value })} />
          </Field>
          <Field label="Email">
            <input type="email" className="input" value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
          </Field>
          <Field label="Phone">
            <input className="input" value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
          </Field>
          <Field label="Subject">
            <input className="input" value={editForm.subject || ''} onChange={e => setEditForm({ ...editForm, subject: e.target.value })} />
          </Field>
          <Field label="Qualification">
            <input className="input" value={editForm.qualification || ''} onChange={e => setEditForm({ ...editForm, qualification: e.target.value })} />
          </Field>
          <Field label="Salary (PKR)">
            <input type="number" className="input" value={editForm.salary || ''} onChange={e => setEditForm({ ...editForm, salary: e.target.value })} />
          </Field>
          <Field label="Status">
            <Select value={editForm.status || 'active'} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </Select>
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
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Teacher Details" maxWidth="max-w-xl">
        {selected && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Full Name', `${selected.first_name} ${selected.last_name}`],
              ['Email', selected.email || '—'],
              ['Phone', selected.phone],
              ['Subject', selected.subject || '—'],
              ['Qualification', selected.qualification || '—'],
              ['Hire Date', selected.hire_date],
              ['Salary', selected.salary ? `PKR ${Number(selected.salary).toLocaleString()}` : '—'],
              ['Status', selected.status],
              ['Address', selected.address || '—'],
            ].map(([k, v]) => (
              <div key={k} className={`${k === 'Address' ? 'col-span-2' : ''} bg-gray-50 rounded-xl px-4 py-3`}>
                <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                <p className="text-gray-700 font-medium capitalize">{v}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Teacher"
        message={teacherToDelete ? `Are you sure you want to delete ${teacherToDelete.first_name} ${teacherToDelete.last_name}? This action cannot be undone.` : ''}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  )
}
