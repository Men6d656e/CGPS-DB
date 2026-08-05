import { useEffect, useState } from 'react'
import { Plus, Users as UsersIcon, Shield, ShieldOff, Key, Search, ChevronDown, ShieldX } from 'lucide-react'
import toast from 'react-hot-toast'
import { usersApi } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { SectionHeader, Table, Modal, Field, PageLoader, EmptyState, Spinner } from '../components/UI'

const ROLE_OPTIONS = [
  { value: 'staff', label: 'Staff', icon: ShieldOff, color: 'text-gray-500 bg-gray-100 border-gray-200' },
  { value: 'admin', label: 'Admin', icon: Shield, color: 'text-teal-600 bg-teal-50 border-teal-200' },
]

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [resetPwdOpen, setResetPwdOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'staff',
  })

  const [resetPwdForm, setResetPwdForm] = useState({ new_password: '', confirm_password: '' })

  const load = async () => {
    setLoading(true)
    try {
      const res = await usersApi.list({ limit: 200 })
      setUsers(res.data)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  useEffect(() => { if (user?.role === 'admin') load() }, [user])

  const filtered = users.filter(u =>
    `${u.username} ${u.email} ${u.full_name || ''} ${u.role}`
      .toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async () => {
    if (!form.username || !form.email || !form.password) {
      return toast.error('Username, Email, and Password are required')
    }
    if (form.password.length < 8) {
      return toast.error('Password must be at least 8 characters')
    }
    setSaving(true)
    try {
      await usersApi.create(form)
      toast.success('User created!')
      setCreateOpen(false)
      setForm({ username: '', email: '', password: '', full_name: '', role: 'staff' })
      load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to create user')
    } finally { setSaving(false) }
  }

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'admin' ? 'staff' : 'admin'
    try {
      await usersApi.updateRole(user.id, newRole)
      toast.success(`${user.username} is now ${newRole}`)
      load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to update role')
    }
  }

  const openResetPwd = (user) => {
    setSelectedUser(user)
    setResetPwdForm({ new_password: '', confirm_password: '' })
    setResetPwdOpen(true)
  }

  const handleResetPwd = async () => {
    if (resetPwdForm.new_password.length < 8) {
      return toast.error('Password must be at least 8 characters')
    }
    if (resetPwdForm.new_password !== resetPwdForm.confirm_password) {
      return toast.error('Passwords do not match')
    }
    setSaving(true)
    try {
      await usersApi.resetPassword(selectedUser.id, resetPwdForm.new_password)
      toast.success(`Password reset for ${selectedUser.username}`)
      setResetPwdOpen(false)
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to reset password')
    } finally { setSaving(false) }
  }

  const { user } = useAuth()
  if (user?.role !== 'admin') {
    return (
      <div className="animate-fade-in">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 stat-card-icon">
            <ShieldX size={28} className="text-red-400" />
          </div>
          <p className="text-lg font-semibold text-gray-700 mb-1">Access Denied</p>
          <p className="text-sm text-gray-400 max-w-sm">
            Only administrators can manage user accounts. If you need access, contact your system administrator.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <SectionHeader
        title="User Management"
        description={`${users.length} registered users`}
        action={
          <button onClick={() => setCreateOpen(true)} className="btn-primary">
            <Plus size={16} /> Add User
          </button>
        }
      />

      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-9"
          placeholder="Search by username, email, role..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? <PageLoader /> : (
        <Table
          headers={['Username', 'Full Name', 'Email', 'Role', 'Status', 'Created', 'Actions']}
          empty={filtered.length === 0 && (
            <EmptyState icon={UsersIcon} title="No users found"
              description="Add staff or admin accounts to the system"
              action={<button onClick={() => setCreateOpen(true)} className="btn-primary"><Plus size={15} />Add User</button>}
            />
          )}
        >
          {filtered.map(u => {
            const roleConfig = ROLE_OPTIONS.find(r => r.value === u.role) || ROLE_OPTIONS[0]
            const RoleIcon = roleConfig.icon
            return (
              <tr key={u.id} className="table-row">
                <td className="td">
                  <span className="font-medium text-gray-700">@{u.username}</span>
                </td>
                <td className="td text-gray-500">{u.full_name || '—'}</td>
                <td className="td text-gray-500 text-xs">{u.email}</td>
                <td className="td">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${roleConfig.color}`}>
                      <RoleIcon size={10} />
                      {roleConfig.label}
                    </span>
                    <button
                      onClick={() => handleRoleToggle(u)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                      title={`Switch to ${u.role === 'admin' ? 'staff' : 'admin'}`}
                    >
                      <ShieldOff size={12} />
                    </button>
                  </div>
                </td>
                <td className="td">
                  <span className={`badge ${u.is_active ? 'badge-active' : 'badge-withdrawn'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="td text-xs text-gray-400">
                  {new Date(u.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="td">
                  <button
                    onClick={() => openResetPwd(u)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                    title="Reset Password"
                  >
                    <Key size={14} />
                  </button>
                </td>
              </tr>
            )
          })}
        </Table>
      )}

      {/* Create User Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New User">
        <div className="space-y-4">
          <Field label="Username">
            <input className="input" value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="johndoe" />
          </Field>
          <Field label="Email">
            <input type="email" className="input" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="john@school.edu" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name (Optional)">
              <input className="input" value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                placeholder="John Doe" />
            </Field>
            <Field label="Role">
              <div className="relative">
                <select className="input appearance-none pr-9 cursor-pointer" value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </Field>
          </div>
          <Field label="Password">
            <input type="password" className="input" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Min. 8 characters" />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleCreate} disabled={saving} className="btn-primary">
            {saving ? <Spinner size={15} /> : <Plus size={15} />} Create User
          </button>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={resetPwdOpen} onClose={() => setResetPwdOpen(false)} title={`Reset Password — ${selectedUser?.username}`} maxWidth="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Set a new password for <span className="text-gray-700 font-medium">@{selectedUser?.username}</span>
          </p>
          <Field label="New Password">
            <input type="password" className="input" value={resetPwdForm.new_password}
              onChange={e => setResetPwdForm({ ...resetPwdForm, new_password: e.target.value })}
              placeholder="Min. 8 characters" />
          </Field>
          <Field label="Confirm Password">
            <input type="password" className="input" value={resetPwdForm.confirm_password}
              onChange={e => setResetPwdForm({ ...resetPwdForm, confirm_password: e.target.value })}
              placeholder="Repeat password" />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setResetPwdOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleResetPwd} disabled={saving} className="btn-primary">
            {saving ? <Spinner size={15} /> : <Key size={15} />} Reset Password
          </button>
        </div>
      </Modal>
    </div>
  )
}
