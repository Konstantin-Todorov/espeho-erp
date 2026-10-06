import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import toast from 'react-hot-toast'
import { dateBg, num } from '../utils/labels'
import RegistryLookup from '../components/RegistryLookup'
import RegistrySuggestions from '../components/RegistrySuggestions'
import FavoriteStar from '../components/ui/FavoriteStar'
import OptionSelect from '../components/ui/OptionSelect'
import { Building2 } from 'lucide-react'

const PAGE_SIZE = 50

export default function Clients() {
  const [clients, setClients] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('orders')
  const [missing, setMissing] = useState('')
  const [view, setView] = useState('list') // list | suggestions
  const [pendingCount, setPendingCount] = useState(0)
  const loadPending = () => isOffice && api.get('/clients/registry-suggestions').then(r => setPendingCount(r.data.length)).catch(() => {})
  useEffect(() => { loadPending() }, [])
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
      const { data } = await api.get('/clients', { params: { search: query || undefined, page, limit: PAGE_SIZE, sort,
        missing: missing && missing !== 'favorites' ? missing : undefined, favorites: missing === 'favorites' ? 1 : undefined } })
      setClients(data.data)
      setTotal(data.total)
    } catch { toast.error('Грешка при зареждане') }
    finally { setLoading(false) }
  }, [query, page, sort, missing])

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

      {pendingCount > 0 && (
        <div className="flex gap-1 mb-4">
          {[['list', 'Всички клиенти'], ['suggestions', `Предложения от Търговския регистър (${pendingCount})`]].map(([k, l]) => (
            <button key={k} onClick={() => setView(k)}
              className={`px-3 py-1.5 rounded-lg text-sm ${view === k ? 'bg-accent text-white' : 'text-muted hover:text-white hover:bg-border'}`}>{l}</button>
          ))}
        </div>
      )}
      {view === 'suggestions' ? <RegistrySuggestions onChanged={() => { loadPending(); fetchClients() }} /> : <>
      <div className="mb-4 flex flex-wrap gap-2">
        <input className="input w-full sm:w-72" placeholder="Търси по име, телефон, ЕИК, град…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="select w-auto" value={sort} onChange={e => { setSort(e.target.value); setPage(1) }}>
          <option value="orders">Най-много поръчки</option>
          <option value="recent">Последна поръчка</option>
          <option value="name">По азбучен ред</option>
        </select>
        <select className="select w-auto" value={missing} onChange={e => { setMissing(e.target.value); setPage(1) }}
          title="Клиенти с непълни данни — отворете ги и натиснете „Търговски регистър“">
          <option value="">Всички клиенти</option>
          <option value="eik">Без ЕИК (за попълване)</option>
          <option value="phone">Без телефон</option>
          <option value="favorites">Само любими</option>
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
                    <p className="font-medium text-white flex items-center gap-1">
                      {isOffice && <FavoriteStar key={c.id + String(c.is_favorite)} client={c} size="w-4 h-4" className="-ml-1" onChange={() => fetchClients()} />}
                      {c.name}
                    </p>
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

      </>}

      <CreateClientModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={c => navigate(`/clients/${c.id}`)} />
    </div>
  )
}

function CreateClientModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name:'', phone:'', email:'', address:'', city:'', eik:'', source:'office', notes:'' })
  const [loading, setLoading] = useState(false)
  const [lookup, setLookup] = useState(false)

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
          <div className="flex items-center justify-between">
            <label className="label">Наименование *</label>
            <button type="button" className="text-xs text-accent hover:underline inline-flex items-center gap-1 mb-1"
              onClick={() => setLookup(true)}><Building2 className="w-3.5 h-3.5" /> Попълни от Търговския регистър</button>
          </div>
          <input className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required placeholder="Фирма ЕООД / Иванов" />
          {form.legal_name && <p className="text-xs text-muted mt-1">{form.legal_name}{form.mol ? ` · МОЛ ${form.mol}` : ''}{form.vat_number ? ` · ${form.vat_number}` : ''}</p>}
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
          <OptionSelect listKey="source" value={form.source} onChange={v=>setForm(f=>({...f,source:v}))} />
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
      <RegistryLookup open={lookup} onClose={() => setLookup(false)} client={{ ...form, name: form.name }}
        onApply={async body => setForm(f => ({ ...f, ...body, name: f.name || body.legal_name || f.name }))} />
    </Modal>
  )
}
