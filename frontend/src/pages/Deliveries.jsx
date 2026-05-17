import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Modal from '../components/ui/Modal'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'
import { bg } from 'date-fns/locale'

const STATUS_CONFIG = {
  PENDING:    { label: 'Изчаква',      color: 'bg-blue-500/20 text-blue-400' },
  IN_TRANSIT: { label: 'В движение',   color: 'bg-orange-500/20 text-orange-400' },
  DELIVERED:  { label: 'Доставена',    color: 'bg-green-500/20 text-green-400' },
  FAILED:     { label: 'Неуспешна',    color: 'bg-red-500/20 text-red-400' },
}

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-500/20 text-gray-400' }
  return <span className={`badge ${s.color}`}>{s.label}</span>
}

function fmt(d) {
  if (!d) return '—'
  try { return format(typeof d === 'string' ? parseISO(d) : d, 'd MMM yyyy', { locale: bg }) } catch { return d }
}

// ─── Edit Delivery Modal ──────────────────────────────────────────────────────
function DeliveryModal({ open, onClose, delivery, onSaved }) {
  const [form, setForm] = useState({
    status: '', driver_name: '', scheduled_date: '', address: '', notes: '',
    recipient_name: '', signature_note: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && delivery) {
      setForm({
        status: delivery.status || 'PENDING',
        driver_name: delivery.driver_name || '',
        scheduled_date: delivery.scheduled_date?.slice(0, 10) || '',
        address: delivery.address || '',
        notes: delivery.notes || '',
        recipient_name: delivery.recipient_name || '',
        signature_note: delivery.signature_note || '',
      })
    }
  }, [open, delivery])

  const handleSave = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.patch(`/deliveries/${delivery.id}`, form)
      toast.success('Доставката е обновена')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Доставка — ${delivery?.order_number}`} size="md">
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Статус</label>
            <select className="select" value={form.status} onChange={e => setForm(f => ({...f,status:e.target.value}))}>
              {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Планирана дата</label>
            <input type="date" className="input" value={form.scheduled_date}
              onChange={e => setForm(f => ({...f,scheduled_date:e.target.value}))} />
          </div>
        </div>
        <div>
          <label className="label">Шофьор</label>
          <input className="input" placeholder="Име на шофьора…" value={form.driver_name}
            onChange={e => setForm(f => ({...f,driver_name:e.target.value}))} />
        </div>
        <div>
          <label className="label">Адрес за доставка</label>
          <input className="input" value={form.address} placeholder="Улица, град…"
            onChange={e => setForm(f => ({...f,address:e.target.value}))} />
        </div>
        {form.status === 'DELIVERED' && (
          <>
            <div>
              <label className="label">Получател (подпис от)</label>
              <input className="input" value={form.recipient_name} placeholder="Ime на получателя…"
                onChange={e => setForm(f => ({...f,recipient_name:e.target.value}))} />
            </div>
            <div>
              <label className="label">Бележка за подпис / потвърждение</label>
              <input className="input" value={form.signature_note} placeholder="Напр. Подписано в офиса…"
                onChange={e => setForm(f => ({...f,signature_note:e.target.value}))} />
            </div>
          </>
        )}
        <div>
          <label className="label">Бележки</label>
          <textarea className="input resize-none" rows={2} value={form.notes}
            onChange={e => setForm(f => ({...f,notes:e.target.value}))} placeholder="Незадължително…" />
        </div>
        <div className="flex gap-3 justify-end pt-1">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Записва...' : '✓ Запази'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── New Delivery Modal ───────────────────────────────────────────────────────
function NewDeliveryModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState({ order_id: '', driver_name: '', scheduled_date: '', address: '', notes: '' })
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      api.get('/orders?status=ГОТОВА&limit=100').then(r => setOrders(r.data.data || [])).catch(() => {})
    }
  }, [open])

  const handleSave = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/deliveries', form)
      toast.success('Доставката е създадена')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Нова доставка" size="md">
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="label">Поръчка (ГОТОВА за доставка) *</label>
          <select className="select" value={form.order_id} onChange={e => setForm(f => ({...f,order_id:e.target.value}))} required>
            <option value="">— Изберете поръчка</option>
            {orders.map(o => <option key={o.id} value={o.id}>{o.order_number} — {o.client_name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Планирана дата</label>
            <input type="date" className="input" value={form.scheduled_date}
              onChange={e => setForm(f => ({...f,scheduled_date:e.target.value}))} />
          </div>
          <div>
            <label className="label">Шофьор</label>
            <input className="input" placeholder="Ime…" value={form.driver_name}
              onChange={e => setForm(f => ({...f,driver_name:e.target.value}))} />
          </div>
        </div>
        <div>
          <label className="label">Адрес</label>
          <input className="input" value={form.address} placeholder="Улица, град…"
            onChange={e => setForm(f => ({...f,address:e.target.value}))} />
        </div>
        <div>
          <label className="label">Бележки</label>
          <textarea className="input resize-none" rows={2} value={form.notes}
            onChange={e => setForm(f => ({...f,notes:e.target.value}))} />
        </div>
        <div className="flex gap-3 justify-end pt-1">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-primary" disabled={loading || !form.order_id}>
            {loading ? 'Записва...' : '+ Създай доставка'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState({ status: '', from: '', to: '' })
  const [editDel, setEditDel]       = useState(null)
  const [newOpen, setNewOpen]       = useState(false)

  const fetchDeliveries = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.status) params.set('status', filter.status)
      if (filter.from)   params.set('from', filter.from)
      if (filter.to)     params.set('to', filter.to)
      const { data } = await api.get(`/deliveries?${params}`)
      setDeliveries(data)
    } catch { toast.error('Грешка при зареждане') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchDeliveries() }, [filter])

  const todayDeliveries = deliveries.filter(d => d.scheduled_date === new Date().toISOString().slice(0, 10))
  const pending = deliveries.filter(d => d.status === 'PENDING' || d.status === 'IN_TRANSIT')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Доставки</h1>
          <p className="text-muted text-sm mt-1">
            {pending.length} изчакващи · {todayDeliveries.length} за днес
          </p>
        </div>
        <button className="btn-primary" onClick={() => setNewOpen(true)}>+ Нова доставка</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = deliveries.filter(d => d.status === key).length
          return (
            <div key={key} className="card text-center cursor-pointer hover:border-accent/30 transition-colors"
              onClick={() => setFilter(f => ({ ...f, status: f.status === key ? '' : key }))}>
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className={`text-xs mt-1 badge ${cfg.color} mx-auto`}>{cfg.label}</p>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select className="select w-44" value={filter.status} onChange={e => setFilter(f => ({...f,status:e.target.value}))}>
          <option value="">Всички статуси</option>
          {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <input type="date" className="input w-40" value={filter.from}
          onChange={e => setFilter(f => ({...f,from:e.target.value}))} />
        <input type="date" className="input w-40" value={filter.to}
          onChange={e => setFilter(f => ({...f,to:e.target.value}))} />
        {(filter.status || filter.from || filter.to) && (
          <button className="btn-ghost text-xs" onClick={() => setFilter({ status:'',from:'',to:'' })}>✕ Изчисти</button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-muted">Зарежда се…</div>
      ) : deliveries.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">🚚</div>
          <p className="text-white font-semibold mb-1">Няма доставки</p>
          <p className="text-muted text-sm mb-4">Планирайте първата доставка</p>
          <button className="btn-primary" onClick={() => setNewOpen(true)}>+ Нова доставка</button>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Поръчка</th>
                <th>Клиент</th>
                <th>Статус</th>
                <th>Дата</th>
                <th>Шофьор</th>
                <th>Адрес</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map(d => (
                <tr key={d.id}>
                  <td>
                    <Link to={`/orders/${d.order_id}`} className="font-mono text-accent hover:underline text-sm">
                      {d.order_number}
                    </Link>
                  </td>
                  <td>
                    <p className="text-white font-medium">{d.client_name}</p>
                    {d.client_phone && <p className="text-muted text-xs">{d.client_phone}</p>}
                  </td>
                  <td><StatusBadge status={d.status} /></td>
                  <td className={`text-sm ${d.scheduled_date === new Date().toISOString().slice(0,10) ? 'text-orange-400 font-medium' : 'text-gray-300'}`}>
                    {fmt(d.scheduled_date)}
                    {d.scheduled_date === new Date().toISOString().slice(0,10) && <span className="ml-1 text-xs">(днес)</span>}
                  </td>
                  <td className="text-muted">{d.driver_name || '—'}</td>
                  <td className="text-muted text-xs max-w-[160px] truncate">{d.address || '—'}</td>
                  <td>
                    <div className="flex gap-1.5">
                      <button className="btn-ghost text-xs py-1 px-2" onClick={() => setEditDel(d)}>✏️ Обнови</button>
                      {d.status === 'PENDING' && (
                        <button className="btn-ghost text-xs py-1 px-2 text-orange-400"
                          onClick={async () => {
                            await api.patch(`/deliveries/${d.id}`, { status: 'IN_TRANSIT' })
                            fetchDeliveries()
                          }}>В движение</button>
                      )}
                      {d.status === 'IN_TRANSIT' && (
                        <button className="btn-ghost text-xs py-1 px-2 text-green-400"
                          onClick={() => setEditDel({ ...d, status: 'DELIVERED' })}>✓ Доставена</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NewDeliveryModal open={newOpen} onClose={() => setNewOpen(false)} onSaved={fetchDeliveries} />
      {editDel && (
        <DeliveryModal open={!!editDel} onClose={() => setEditDel(null)} delivery={editDel} onSaved={fetchDeliveries} />
      )}
    </div>
  )
}
