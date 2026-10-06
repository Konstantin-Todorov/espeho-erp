import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import toast from 'react-hot-toast'
import { SOURCE_LABELS, dateBg, num } from '../utils/labels'

const PAGE_SIZE = 50

export default function Clients() {
  const [clients, setClients] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('orders')
  const [page, setPage] = useState(1)
  const { isOffice } = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  // Quick create from the "+ Нов" menu
  useEffect(() => {
    if (params.get('new')) { setCreateOpen(true); setParams({}, { replace: true }) }
  }, [params])

  useEffect(() => {
    const t = setTimeout(() => { setQuery(search); setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [search])

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/clients', { params: { search: query || undefined, page, limit: PAGE_SIZE, sort } })
      setClients(data.data)
      setTotal(data.total)
    } catch { toast.error('Грешка при зареждане') }
    finally { setLoading(false) }
  }, [query, page, sort])

  useEffect(() => { fetchClients() }, [fetchClients])
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

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

      <div className="mb-4 flex flex-wrap gap-2">
        <input className="input w-full sm:w-72" placeholder="Търси по име, телефон, ЕИК, град…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="select w-auto" value={sort} onChange={e => { setSort(e.target.value); setPage(1) }}>
          <option value="orders">Най-много поръчки</option>
          <option value="recent">Последна поръчка</option>
          <option value="name">По азбучен ред</option>
        </select>
      </div>

      {loading ? <PageLoader /> : (
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Клиент</th><th>Телефон</th><th className="hidden md:table-cell">Email</th><th className="hidden md:table-cell">Град</th><th className="text-right">Поръчки</th><th className="hidden sm:table-cell">Последна</th></tr>
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
                  <td className="text-muted text-sm hidden md:table-cell">{c.email || '—'}</td>
                  <td className="text-muted hidden md:table-cell">{c.city || '—'}</td>
                  <td className="text-right font-medium text-white">{num(c.order_count || 0, 0)}</td>
                  <td className="text-muted text-xs hidden sm:table-cell">{dateBg(c.last_order_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button className="btn-secondary" disabled={page===1} onClick={() => setPage(p=>p-1)}>← Назад</button>
          <span className="px-3 text-sm text-muted">Страница {page} от {pages}</span>
          <button className="btn-secondary" disabled={page>=pages} onClick={() => setPage(p=>p+1)}>Напред →</button>
        </div>
      )}

      <CreateClientModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={c => navigate(`/clients/${c.id}`)} />
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
      const { data } = await api.post('/clients', form)
      toast.success('Клиентът е създаден')
      onCreated(data); onClose()
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
          <label className="label">Откъде научи за нас</label>
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
