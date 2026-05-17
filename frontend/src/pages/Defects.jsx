import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'
import { bg } from 'date-fns/locale'

const CAUSE_OPTIONS = ['машинна_грешка','човешка_грешка','дефект_материал','грешка_размер','транспортна_повреда','друго']
const CAUSE_LABELS  = { машинна_грешка:'Машинна грешка', човешка_грешка:'Човешка грешка', дефект_материал:'Дефект материал', грешка_размер:'Грешка в размера', транспортна_повреда:'Транспортна повреда', друго:'Друго' }

function CreateDefectModal({ open, onClose, onCreated, prefillOrderId }) {
  const [orders, setOrders] = useState([])
  const [stages, setStages] = useState([])
  const [machines, setMachines] = useState([])
  const [form, setForm] = useState({ order_id:'', stage_id:'', machine_id:'', cause_type:'човешка_грешка', cause_notes:'', material_cost:'', labor_cost:'', decision:'', notes:'' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    api.get('/orders?status=ПРОИЗВОДСТВО&limit=100').then(r => setOrders(r.data.data))
    api.get('/machines').then(r => setMachines(r.data))
    if (prefillOrderId) {
      setForm(f => ({ ...f, order_id: prefillOrderId }))
      api.get(`/production/stages/${prefillOrderId}`).then(r => setStages(r.data))
    }
  }, [open, prefillOrderId])

  const handleOrderChange = async orderId => {
    setForm(f => ({ ...f, order_id: orderId, stage_id: '' }))
    if (orderId) {
      const r = await api.get(`/production/stages/${orderId}`)
      setStages(r.data)
    } else setStages([])
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.order_id || !form.cause_type) return toast.error('Попълнете задължителните полета')
    setLoading(true)
    try {
      const res = await api.post('/defects', { ...form, material_cost: +form.material_cost||0, labor_cost: +form.labor_cost||0 })
      toast.success('Бракът е регистриран')
      onCreated(res.data)
      onClose()
      setForm({ order_id:'', stage_id:'', machine_id:'', cause_type:'човешка_грешка', cause_notes:'', material_cost:'', labor_cost:'', decision:'', notes:'' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Регистрирай брак" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Поръчка *</label>
            <select className="select" value={form.order_id} onChange={e=>handleOrderChange(e.target.value)} required>
              <option value="">-- Изберете поръчка --</option>
              {orders.map(o => <option key={o.id} value={o.id}>#{o.order_number} — {o.client_name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Производствен етап</label>
            <select className="select" value={form.stage_id} onChange={e=>setForm(f=>({...f,stage_id:e.target.value}))}>
              <option value="">-- Без етап --</option>
              {stages.map(s => <option key={s.id} value={s.id}>{s.stage_name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Причина *</label>
            <select className="select" value={form.cause_type} onChange={e=>setForm(f=>({...f,cause_type:e.target.value}))} required>
              {CAUSE_OPTIONS.map(c => <option key={c} value={c}>{CAUSE_LABELS[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Машина</label>
            <select className="select" value={form.machine_id} onChange={e=>setForm(f=>({...f,machine_id:e.target.value}))}>
              <option value="">-- Без машина --</option>
              {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Стойност материали (лв)</label>
            <input type="number" className="input" placeholder="0.00" value={form.material_cost}
              onChange={e=>setForm(f=>({...f,material_cost:e.target.value}))} />
          </div>
          <div>
            <label className="label">Стойност труд (лв)</label>
            <input type="number" className="input" placeholder="0.00" value={form.labor_cost}
              onChange={e=>setForm(f=>({...f,labor_cost:e.target.value}))} />
          </div>
          <div>
            <label className="label">Решение</label>
            <select className="select" value={form.decision} onChange={e=>setForm(f=>({...f,decision:e.target.value}))}>
              <option value="">-- Нерешен --</option>
              <option value="преработка">Преработка</option>
              <option value="отписване">Отписване</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Описание на причината</label>
          <textarea className="input resize-none" rows={2} value={form.cause_notes}
            onChange={e=>setForm(f=>({...f,cause_notes:e.target.value}))} placeholder="Опишете какво точно се е случило..." />
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-danger" disabled={loading}>Регистрирай брак</button>
        </div>
      </form>
    </Modal>
  )
}

export default function Defects() {
  const [defects, setDefects] = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [filters, setFilters] = useState({ cause_type: '', from: '', to: '' })
  const { isAdmin, isProduction } = useAuth()
  const [searchParams] = useSearchParams()
  const prefillOrderId = searchParams.get('order_id')

  const fetchDefects = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.cause_type) params.set('cause_type', filters.cause_type)
      if (filters.from) params.set('from', filters.from)
      if (filters.to) params.set('to', filters.to)
      const { data } = await api.get(`/defects?${params}`)
      setDefects(data.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchDefects() }, [filters])
  useEffect(() => { if (prefillOrderId) setCreateOpen(true) }, [prefillOrderId])

  const totalCost = defects.reduce((s, d) => s + Number(d.total_cost || 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Брак</h1>
          <p className="text-sm text-muted mt-0.5">
            {defects.length} записа
            {isAdmin && ` · ${totalCost.toFixed(2)} лв общо`}
          </p>
        </div>
        {(isAdmin || isProduction) && (
          <button className="btn-danger" onClick={() => setCreateOpen(true)}>
            + Регистрирай брак
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select className="select w-48" value={filters.cause_type}
          onChange={e => setFilters(f => ({...f, cause_type: e.target.value}))}>
          <option value="">Всички причини</option>
          {CAUSE_OPTIONS.map(c => <option key={c} value={c}>{CAUSE_LABELS[c]}</option>)}
        </select>
        <input type="date" className="input w-40" value={filters.from}
          onChange={e => setFilters(f => ({...f, from: e.target.value}))} />
        <span className="text-muted self-center">—</span>
        <input type="date" className="input w-40" value={filters.to}
          onChange={e => setFilters(f => ({...f, to: e.target.value}))} />
      </div>

      {loading ? <PageLoader /> : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Поръчка</th><th>Причина</th><th>Работник</th><th>Машина</th>
                <th>Етап</th>{isAdmin && <th className="text-right">Стойност</th>}<th>Решение</th><th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {defects.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-muted">Няма регистриран брак</td></tr>
              )}
              {defects.map(d => (
                <tr key={d.id}>
                  <td>
                    <Link to={`/orders/${d.order_id}`} className="text-accent hover:underline font-medium">
                      #{d.order_number}
                    </Link>
                  </td>
                  <td>
                    <div className="font-medium text-white">{CAUSE_LABELS[d.cause_type] || d.cause_type}</div>
                    {d.cause_notes && <div className="text-xs text-muted">{d.cause_notes.slice(0,60)}{d.cause_notes.length>60?'...':''}</div>}
                  </td>
                  <td>{d.worker_name}</td>
                  <td className="text-muted">{d.machine_name || '—'}</td>
                  <td className="text-muted">{d.stage_name || '—'}</td>
                  {isAdmin && (
                    <td className="text-right text-danger font-medium">
                      {Number(d.total_cost).toFixed(2)} лв
                    </td>
                  )}
                  <td>
                    {d.decision ? (
                      <span className={`badge ${d.decision==='преработка' ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {d.decision}
                      </span>
                    ) : <span className="badge bg-red-500/20 text-red-400">Нерешен</span>}
                  </td>
                  <td className="text-muted text-xs">{format(parseISO(d.created_at), 'd MMM yyyy', { locale: bg })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateDefectModal open={createOpen} onClose={() => setCreateOpen(false)}
        onCreated={() => fetchDefects()} prefillOrderId={prefillOrderId} />
    </div>
  )
}
