import { useEffect, useState } from 'react'
import { Plus, Search, Users, Edit2, Trash2, Link, Eye, UserCheck, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { studentsApi, parentsApi } from '../api'
import { useDebouncedValue } from '../hooks/useDebounce'
import {
  SectionHeader, Table, Modal, ConfirmModal, Pagination, Field,
  PageLoader, EmptyState, Spinner, STATUS_STYLES
} from '../components/UI'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { TableRow, TableCell } from '../components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

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
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
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

  // Live search with debounce (SPEC2 Phase 6) — still works with Enter/button
  const debouncedSearch = useDebouncedValue(searchInput, 400)

  const load = async () => {
    setLoading(true)
    try {
      const res = await studentsApi.list({ status: statusFilter || undefined, search: search || undefined, skip, limit })
      setStudents(res.data)
    } catch { toast.error('Failed to load students') }
    finally { setLoading(false) }
  }

  useEffect(() => { setSearch(debouncedSearch) }, [debouncedSearch])

  useEffect(() => { 
    setSkip(0)
  }, [statusFilter, search])

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
      // Only send editable fields — CNIC is immutable after creation
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

  const handleStatusChange = async (student, status) => {
    try {
      await studentsApi.update(student.id, { status })
      toast.success('Student status updated!')
      load()
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="Students Directory"
        description={`${students.length} students currently listed`}
        action={
          isAdmin && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={16} /> Add Student
            </Button>
          )
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name or class..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') setSearch(searchInput) }}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearch(searchInput)}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            title="Search"
          >
            <Search size={14} />
          </Button>
        </div>
        <Select
          value={statusFilter === '' ? 'all' : statusFilter}
          onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="withdrawn">Withdrawn</SelectItem>
            <SelectItem value="graduated">Graduated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? <PageLoader /> : (
        <Table
          headers={['Name', 'Class', 'CNIC/B-Form', 'Admission', 'Status', 'Actions']}
          empty={students.length === 0 && (
            <EmptyState icon={Users} title="No students found"
              description="Start by adding your first student to the system"
              action={
                isAdmin && (
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus size={15} />Add Student
                  </Button>
                )
              }
            />
          )}
        >
          {students.map(s => (
            <TableRow key={s.id}>
              <TableCell className="font-medium text-slate-200">{s.first_name} {s.last_name}</TableCell>
              <TableCell>
                <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded-lg">Class {s.current_class}</span>
              </TableCell>
              <TableCell className="font-mono text-xs text-slate-400">{s.cnic_bform}</TableCell>
              <TableCell className="text-slate-400">{s.admission_date}</TableCell>
              <TableCell>
                {isAdmin ? (
                  <Select value={s.status} onValueChange={(val) => handleStatusChange(s, val)}>
                    <SelectTrigger className="h-7 w-[110px] rounded-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">active</SelectItem>
                      <SelectItem value="withdrawn">withdrawn</SelectItem>
                      <SelectItem value="graduated">graduated</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className={STATUS_STYLES[s.status]}>{s.status}</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail(s)} title="View">
                    <Eye size={14} />
                  </Button>
                  {isAdmin && (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openLink(s)} title="Link parent">
                        <Link size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelected(s); setEditForm({ first_name: s.first_name, last_name: s.last_name, current_class: s.current_class, status: s.status }); setEditOpen(true) }} title="Edit">
                        <Edit2 size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteClick(s)} title="Delete">
                        <Trash2 size={16} />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
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
            <Input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} placeholder="Ali" />
          </Field>
          <Field label="Last Name">
            <Input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} placeholder="Khan" />
          </Field>
          <Field label="CNIC / B-Form" >
            <Input value={form.cnic_bform} onChange={e => setForm({ ...form, cnic_bform: formatCNIC(e.target.value) })} maxLength={15} placeholder="34201-1234567-1" />
          </Field>
          <Field label="Date of Birth">
            <Input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
          </Field>
          <Field label="Admission Date">
            <Input type="date" value={form.admission_date} onChange={e => setForm({ ...form, admission_date: e.target.value })} />
          </Field>
          <Field label="Current Class">
            <Select value={form.current_class} onValueChange={v => setForm({ ...form, current_class: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLASSES.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? <Spinner size={15} /> : <Plus size={15} />} Create Student
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Student">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name">
            <Input value={editForm.first_name || ''} onChange={e => setEditForm({ ...editForm, first_name: e.target.value })} />
          </Field>
          <Field label="Last Name">
            <Input value={editForm.last_name || ''} onChange={e => setEditForm({ ...editForm, last_name: e.target.value })} />
          </Field>
          <Field label="Current Class">
            <Select value={editForm.current_class || 'Nursery'} onValueChange={v => setEditForm({ ...editForm, current_class: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLASSES.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={editForm.status || 'active'} onValueChange={v => setEditForm({ ...editForm, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEdit} disabled={saving}>
            {saving ? <Spinner size={15} /> : null} Save Changes
          </Button>
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
                <div key={k} className="bg-slate-800/40 rounded-xl px-4 py-3">
                  <p className="text-xs text-slate-500 mb-0.5">{k}</p>
                  <p className="text-slate-200 font-medium capitalize">{v}</p>
                </div>
              ))}
            </div>
            {/* Linked Parents */}
            {detailParents.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Parents / Guardians ({detailParents.length})</p>
                <div className="space-y-1.5">
                  {detailParents.map(p => (
                    <div key={p.id} className="flex items-center gap-3 bg-slate-800/40 rounded-xl px-4 py-2.5">
                      <UserCheck size={14} className="text-brand-400" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-slate-300 block truncate">{p.guardian_name}</span>
                        <span className="text-xs text-slate-500">{p.relationship || 'Guardian'} · <Phone size={10} className="inline" /> {p.contact_no}</span>
                      </div>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
                          title="Unlink parent"
                        >
                          <Trash2 size={13} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/30 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-500">No parents linked yet</p>
              </div>
            )}

            {siblings.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Siblings ({siblings.length})</p>
                <div className="space-y-1.5">
                  {siblings.map(sib => (
                    <div key={sib.id} className="flex items-center gap-3 bg-slate-800/40 rounded-xl px-4 py-2.5">
                      <Users size={14} className="text-brand-400" />
                      <span className="text-sm text-slate-300">{sib.first_name} {sib.last_name}</span>
                      <span className="text-xs text-slate-500 ml-auto">Class {sib.current_class}</span>
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
            <Select
              value={linkData.parent_id === '' ? 'none' : String(linkData.parent_id)}
              onValueChange={v => setLinkData({ ...linkData, parent_id: v === 'none' ? '' : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a parent..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Choose a parent...</SelectItem>
                {parents.map(p => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.guardian_name} — {p.cnic ? `${p.cnic.slice(0, 5)}-XXXXXXX-${p.cnic.slice(-1)}` : 'No CNIC'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Relationship">
            <Select value={linkData.relationship} onValueChange={v => setLinkData({ ...linkData, relationship: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Father">Father</SelectItem>
                <SelectItem value="Mother">Mother</SelectItem>
                <SelectItem value="Guardian">Guardian</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setLinkOpen(false)}>Cancel</Button>
          <Button onClick={handleLink} disabled={saving || !linkData.parent_id}>
            {saving ? <Spinner size={15} /> : <Link size={15} />} Link Parent
          </Button>
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
