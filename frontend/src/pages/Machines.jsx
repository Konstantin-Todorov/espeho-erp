import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'
import { bg } from 'date-fns/locale'

const MAINT_TYPES = ['профилактика','ремонт','смяна_части','калибриране','почистване']
const MAINT_LABELS = { профилактика:'Профилактика', ремонт:'Ремонт', смяна_части:'Смяна части', калибриране:'Калибриране', почистване:'Почистване' }

export default function Machines() {
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [logOpen, setLogOpen] = useState(false)
  const { isAdmin, isProduction } = useAuth()

  const fetchMachines = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/machines')
      setMachines(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchMachines() }, [])

  if (loading) return <PageLoader />

  const overdue = machines.filter(m => m.service_overdue)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Машини</h1>
          <p className="text-sm text-muted mt-0.5">
            {machines.length} машини
            {overdue.length > 0 && <span className="text-danger ml-2">· {overdue.length} с просрочена поддръжка</span>}
          </p>
        </div>
      </div>

      {overdue.length > 0 && (
        <div className="card border-red-500/30 mb-6">
          <p className="text-danger font-semibold mb-2">⚠ Просрочена поддръжка</p>
          {overdue.map(m => (
            <p key={m.id} className="text-sm text-gray-300">
              {m.name} — последна: {m.last_service ? format(parseISO(m.last_service), 'd MMM yyyy', { locale: bg }) : 'никога'}
            </p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {machines.map(m => (
          <div key={m.id} className={`card ${m.service_overdue ? 'border-red-500/30' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-white">{m.name}</p>
                <p className="text-xs text-muted">{m.type}{m.model && ` · ${m.model}`}</p>
              </div>
              <span className={`badge ${m.service_overdue ? 'bg-red-500/20 text-danger' : 'bg-green-500/20 text-green-400'}`}>
                {m.service_overdue ? '⚠ Просрочена' : '✓ OK'}
              </span>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Цена/час</span>
                <span className="text-white">{m.cost_per_hour} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Последна поддръжка</span>
                <span className="text-white">
                  {m.last_service ? format(parseISO(m.last_service), 'd MMM yyyy', { locale: bg }) : 'Никога'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Следваща поддръжка</span>
                <span className={m.service_overdue ? 'text-danger font-medium' : 'text-white'}>
                  {m.next_service_date ? format(parseISO(m.next_service_date), 'd MMM yyyy', { locale: bg }) : '—'}
                </span>
              </div>
            </div>
            {(isAdmin || isProduction) && (
              <button className="btn-secondary w-full mt-3 text-sm justify-center"
                onClick={() => { setSelected(m); setLogOpen(true) }}>
                + Запиши поддръжка
              </button>
            )}
          </div>
        ))}
      </div>

      <MaintenanceModal open={logOpen} onClose={() => setLogOpen(false)}
        machine={selected} onDone={fetchMachines} />
    </div>
  )
}

function MaintenanceModal({ open, onClose, machine, onDone }) {
  const [form, setForm] = useState({ maintenance_type:'профилактика', performed_by:'', cost:'', notes:'', performed_at:new Date().toISOString().split('T')[0], next_service:'' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post(`/machines/${machine?.id}/maintenance`, { ...form, cost: +form.cost||0 })
      toast.success('Поддръжката е записана')
      onDone(); onClose()
      setForm({ maintenance_type:'профилактика', performed_by:'', cost:'', notes:'', performed_at:new Date().toISOString().split('T')[0], next_service:'' })
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
    finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Поддръжка: ${machine?.name || ''}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Тип *</label>
          <select className="select" value={form.maintenance_type} onChange={e=>setForm(f=>({...f,maintenance_type:e.target.value}))}>
            {MAINT_TYPES.map(t => <option key={t} value={t}>{MAINT_LABELS[t]}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Извършил</label>
            <input className="input" value={form.performed_by} onChange={e=>setForm(f=>({...f,performed_by:e.target.value}))} placeholder="Техник / фирма" />
          </div>
          <div>
            <label className="label">Цена (€)</label>
            <input type="number" className="input" value={form.cost} onChange={e=>setForm(f=>({...f,cost:e.target.value}))} placeholder="0.00" />
          </div>
          <div>
            <label className="label">Дата</label>
            <input type="date" className="input" value={form.performed_at} onChange={e=>setForm(f=>({...f,performed_at:e.target.value}))} />
          </div>
          <div>
            <label className="label">Следваща поддръжка</label>
            <input type="date" className="input" value={form.next_service} onChange={e=>setForm(f=>({...f,next_service:e.target.value}))} />
          </div>
        </div>
        <div>
          <label className="label">Описание *</label>
          <textarea className="input resize-none" rows={3} value={form.notes}
            onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Какво е направено..." required />
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-primary" disabled={loading}>Запиши</button>
        </div>
      </form>
    </Modal>
  )
}
