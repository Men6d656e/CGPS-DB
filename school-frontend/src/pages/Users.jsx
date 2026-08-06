import { useEffect, useState } from 'react'
import { Plus, Users as UsersIcon, Shield, ShieldOff, Key, Search, ShieldX } from 'lucide-react'
import { toast } from 'sonner'
import { usersApi } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { SectionHeader, Table, Modal, Field, PageLoader, EmptyState, Spinner, STATUS_STYLES } from '../components/UI'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { TableRow, TableCell } from '../components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

const ROLE_OPTIONS = [
  { value: 'staff', label: 'Staff', icon: ShieldOff, color: 'text-muted-foreground bg-muted/60 border-border' },
  { value: 'admin', label: 'Admin', icon: Shield, color: 'text-accent-brand bg-accent-brand/10 border-accent-brand/20' },
]

export default function Users() {
  const { user } = useAuth()
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

  // ─── Role guard: only admins can access this page ───────────────────────
  if (user?.role !== 'admin') {
    return (
      <div className="animate-fade-in">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-md bg-destructive/10 flex items-center justify-center mb-5 border border-destructive/20">
            <ShieldX size={28} className="text-destructive" />
          </div>
          <p className="font-display text-lg font-semibold text-foreground mb-1">Access Denied</p>
          <p className="text-sm text-muted-foreground max-w-sm">
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
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> Add User
          </Button>
        }
      />

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
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
              action={<Button onClick={() => setCreateOpen(true)}><Plus size={15} />Add User</Button>}
            />
          )}
        >
          {filtered.map(u => {
            const roleConfig = ROLE_OPTIONS.find(r => r.value === u.role) || ROLE_OPTIONS[0]
            const RoleIcon = roleConfig.icon
            return (
              <TableRow key={u.id}>
                <TableCell>
                  <span className="font-medium text-foreground">@{u.username}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{u.full_name || '—'}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{u.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${roleConfig.color}`}>
                      <RoleIcon size={10} />
                      {roleConfig.label}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleRoleToggle(u)}
                      title={`Switch to ${u.role === 'admin' ? 'staff' : 'admin'}`}
                    >
                      <ShieldOff size={12} />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={u.is_active ? STATUS_STYLES.active : STATUS_STYLES.inactive}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openResetPwd(u)}
                      title="Reset Password"
                    >
                      <Key size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </Table>
      )}

      {/* Create User Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New User">
        <div className="space-y-4">
          <Field label="Username">
            <Input value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="johndoe" />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="john@school.edu" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name (Optional)">
              <Input value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                placeholder="John Doe" />
            </Field>
            <Field label="Role">
              <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Password">
            <Input type="password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Min. 8 characters" />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? <Spinner size={15} /> : <Plus size={15} />} Create User
          </Button>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={resetPwdOpen} onClose={() => setResetPwdOpen(false)} title={`Reset Password — ${selectedUser?.username}`} maxWidth="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Set a new password for <span className="text-foreground font-medium">@{selectedUser?.username}</span>
          </p>
          <Field label="New Password">
            <Input type="password" value={resetPwdForm.new_password}
              onChange={e => setResetPwdForm({ ...resetPwdForm, new_password: e.target.value })}
              placeholder="Min. 8 characters" />
          </Field>
          <Field label="Confirm Password">
            <Input type="password" value={resetPwdForm.confirm_password}
              onChange={e => setResetPwdForm({ ...resetPwdForm, confirm_password: e.target.value })}
              placeholder="Repeat password" />
          </Field>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setResetPwdOpen(false)}>Cancel</Button>
          <Button onClick={handleResetPwd} disabled={saving}>
            {saving ? <Spinner size={15} /> : <Key size={15} />} Reset Password
          </Button>
        </div>
      </Modal>
    </div>
  )
}
