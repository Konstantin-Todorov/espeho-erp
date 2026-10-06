import { useState, useEffect } from 'react'
import api from '../api/axios'
import { RoleBadge } from '../components/ui/StatusBadge'
import { PageLoader } from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const ROLES = ['admin','office','production','warehouse']
const ROLE_LABELS = { admin:'Администратор', office:'Офис', production:'Производство', warehouse:'Склад' }

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/auth/users')
      setUsers(data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка при зареждане')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Потребители</h1>
        <button className="btn-primary" onClick={() => setCreateOpen(true)}>+ Нов потребител</button>
      </div>

      {loading ? <PageLoader /> : (
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Потребител</th><th>Email</th><th>Роля</th><th>Ставка (€/ч)</th><th>Статус</th><th></th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="font-medium text-white">{u.name}</td>
                  <td className="text-muted">{u.email}</td>
                  <td><RoleBadge role={u.role} /></td>
                  <td className="text-muted">{u.hourly_rate || 0} €/ч</td>
                  <td>
                    <span className={`badge ${u.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {u.active ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-ghost text-xs py-1" onClick={() => setEditing(u)}>Редактирай</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UserModal open={createOpen} onClose={() => setCreateOpen(false)} onSaved={fetchUsers} />
      <UserModal open={!!editing} user={editing} onClose={() => setEditing(null)} onSaved={fetchUsers} />
    </div>
  )
}

function UserModal({ open, onClose, user, onSaved }) {
  const { user: me } = useAuth()
  const isEdit = !!user
  const isSelf = isEdit && user.id === me?.id
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'production', hourly_rate:'', active:true })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) setForm({ name:user.name, email:user.email, password:'', role:user.role, hourly_rate:user.hourly_rate||'', active:user.active })
    else setForm({ name:'', email:'', password:'', role:'production', hourly_rate:'', active:true })
  }, [open, user])

  const handleSubmit = async e => {
    e.preventDefault()
    if ((!isEdit || form.password) && form.password.length < 6) return toast.error('Паролата трябва да е поне 6 символа')
    setLoading(true)
    try {
      const payload = { ...form, hourly_rate: +form.hourly_rate||0 }
      if (isEdit && !form.password) delete payload.password
      // You can't lock yourself out (the server refuses it too)
      if (isSelf) { delete payload.active; delete payload.role }
      if (isEdit) await api.patch(`/auth/users/${user.id}`, payload)
      else await api.post('/auth/users', payload)
      toast.success(isEdit ? 'Потребителят е обновен' : 'Потребителят е създаден')
      onSaved(); onClose()
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
    finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? `Редактирай: ${user?.name}` : 'Нов потребител'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Пълно име *</label>
          <input className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required />
        </div>
        <div>
          <label className="label">Email *</label>
          <input type="email" className="input" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required />
        </div>
        <div>
          <label className="label">{isEdit ? 'Нова парола (остави празно)' : 'Парола *'}</label>
          <input type="password" className="input" value={form.password}
            onChange={e=>setForm(f=>({...f,password:e.target.value}))} required={!isEdit} minLength={isEdit && !form.password ? undefined : 6}
            autoComplete="new-password" placeholder={isEdit ? '••••••• (незадължително)' : ''} />
          <p className="text-xs text-muted mt-1">Поне 6 символа.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Роля *</label>
            <select className="select" value={form.role} disabled={isSelf} title={isSelf ? 'Не можете да смените собствената си роля' : ''}
              onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
              {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Ставка (€/час)</label>
            <input type="number" className="input" step="0.01" min="0" placeholder="0.00"
              value={form.hourly_rate} onChange={e=>setForm(f=>({...f,hourly_rate:e.target.value}))} />
          </div>
        </div>
        {isEdit && (
          <div className="flex items-center gap-2">
            <input type="checkbox" id="active" className="w-4 h-4 accent-accent disabled:opacity-50" checked={form.active} disabled={isSelf}
              onChange={e=>setForm(f=>({...f,active:e.target.checked}))} />
            <label htmlFor="active" className="text-sm text-gray-200">Активен потребител</label>
            {isSelf && <span className="text-xs text-muted">(не можете да деактивирате себе си)</span>}
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-primary" disabled={loading}>{isEdit ? 'Запази' : 'Създай'}</button>
        </div>
      </form>
    </Modal>
  )
}
