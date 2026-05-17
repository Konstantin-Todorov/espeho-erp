import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import toast from 'react-hot-toast'

const SOURCE_LABELS = { phone:'Телефон', email:'Email', office:'Офис', website:'Уебсайт', referral:'Препоръка', other:'Друго' }

export default function Clients() {
  const [clients, setClients] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { isOffice } = useAuth()
  const navigate = useNavigate()

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      params.set('page', page)
      const { data } = await api.get(`/clients?${params}`)
      setClients(data.data)
      setTotal(data.total)
    } finally { setLoading(false) }
  }, [search, page])

  useEffect(() => { fetchClients() }, [fetchClients])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Клиенти</h1>
          <p className="text-sm text-muted mt-0.5">{total} общо</p>
        </div>
        {isOffice && (
          <button className="btn-primary" onClick={() => setCreateOpen(true)}>+ Нов клиент</button>
        )}
      </div>

      <div className="mb-4">
        <input className="input w-64" placeholder="Търси по име, телефон, email..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
      </div>

      {loading ? <PageLoader /> : (
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Клиент</th><th>Телефон</th><th>Email</th><th>Град</th><th>Канал</th><th>Поръчки</th></tr>
            </thead>
            <tbody>
              {clients.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-muted">Няма намерени клиенти</td></tr>}
              {clients.map(c => (
                <tr key={c.id} className="cursor-pointer" onClick={() => navigate(`/clients/${c.id}`)}>
                  <td>
                    <p className="font-medium text-white">{c.name}</p>
                    {c.eik && <p className="text-xs text-muted">ЕИК: {c.eik}</p>}
                  </td>
                  <td className="text-muted">{c.phone || '—'}</td>
                  <td className="text-muted text-sm">{c.email || '—'}</td>
                  <td className="text-muted">{c.city || '—'}</td>
                  <td><span className="badge bg-border text-muted">{SOURCE_LABELS[c.source] || c.source}</span></td>
                  <td className="text-center font-medium text-white">{c.order_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 50 && (
        <div className="flex justify-center gap-2 mt-4">
          <button className="btn-secondary" disabled={page===1} onClick={() => setPage(p=>p-1)}>← Назад</button>
          <span className="px-4 py-2 text-sm text-muted">Страница {page}</span>
          <button className="btn-secondary" disabled={clients.length<50} onClick={() => setPage(p=>p+1)}>Напред →</button>
        </div>
      )}

      <CreateClientModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => fetchClients()} />
    </div>
  )
}

function CreateClientModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name:'', phone:'', email:'', address:'', city:'', eik:'', source:'office', notes:'' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/clients', form)
      toast.success('Клиентът е създаден')
      onCreated(); onClose()
      setForm({ name:'', phone:'', email:'', address:'', city:'', eik:'', source:'office', notes:'' })
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
    finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Нов клиент" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Наименование *</label>
          <input className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required placeholder="Фирма ЕООД / Иванов" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Телефон</label>
            <input className="input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="08XX XXX XXX" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
          </div>
          <div>
            <label className="label">Град</label>
            <input className="input" value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} />
          </div>
          <div>
            <label className="label">ЕИК</label>
            <input className="input" value={form.eik} onChange={e=>setForm(f=>({...f,eik:e.target.value}))} />
          </div>
        </div>
        <div>
          <label className="label">Канал</label>
          <select className="select" value={form.source} onChange={e=>setForm(f=>({...f,source:e.target.value}))}>
            {Object.entries(SOURCE_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Адрес</label>
          <input className="input" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} />
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-primary" disabled={loading}>Създай</button>
        </div>
      </form>
    </Modal>
  )
}
