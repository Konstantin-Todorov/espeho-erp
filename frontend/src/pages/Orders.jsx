import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { OrderStatusBadge, UrgentBadge } from '../components/ui/StatusBadge'
import { PageLoader } from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import toast from 'react-hot-toast'
import { format, parseISO, isPast } from 'date-fns'
import { bg } from 'date-fns/locale'

const STATUS_OPTIONS = ['НОВА','МАТЕРИАЛИ','ПРОИЗВОДСТВО','ГОТОВА','ДОСТАВЕНА','ОТКАЗАНА']
const TYPE_OPTIONS   = ['стъклопакет','единично_стъкло','смесена']
const SOURCE_OPTIONS = ['phone','email','office','website','referral','other']
const SOURCE_LABELS  = { phone:'Телефон', email:'Email', office:'Офис', website:'Уебсайт', referral:'Препоръка', other:'Друго' }

// ─── Quick-create client inline form ─────────────────────────────────────────
function QuickClientForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({ name: '', phone: '', city: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name) return toast.error('Наименованието е задължително')
    setLoading(true)
    try {
      const { data } = await api.post('/clients', { ...form, source: 'office' })
      toast.success('Клиентът е създаден')
      onCreated(data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-2 p-3 bg-bg border border-accent/30 rounded-xl space-y-2">
      <p className="text-xs font-semibold text-accent">Нов клиент</p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input className="input text-sm" placeholder="Наименование *" value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus required />
        <div className="grid grid-cols-2 gap-2">
          <input className="input text-sm" placeholder="Телефон" value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <input className="input text-sm" placeholder="Град" value={form.city}
            onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn-secondary text-xs py-1" onClick={onCancel}>Откажи</button>
          <button type="submit" className="btn-primary text-xs py-1" disabled={loading}>
            {loading ? '...' : 'Създай'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Product catalog picker ───────────────────────────────────────────────────
function CatalogPicker({ orderType, onSelect, onClose }) {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    api.get('/products').then(r => setTemplates(r.data)).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handleClick = e => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const filtered = templates.filter(t => {
    if (filter && !t.name.toLowerCase().includes(filter.toLowerCase()) && !t.default_description?.toLowerCase().includes(filter.toLowerCase())) return false
    return true
  })

  // Grouped by order_type
  const groups = filtered.reduce((acc, t) => {
    if (!acc[t.order_type]) acc[t.order_type] = []
    acc[t.order_type].push(t)
    return acc
  }, {})

  return (
    <div ref={ref} className="absolute z-40 top-full mt-1 left-0 right-0 bg-surface border border-border rounded-xl shadow-2xl">
      <div className="p-2 border-b border-border">
        <input className="input text-sm w-full" placeholder="Търси шаблон..." value={filter}
          onChange={e => setFilter(e.target.value)} autoFocus />
      </div>
      <div className="max-h-64 overflow-y-auto">
        {loading && <p className="text-center text-muted text-sm py-4">Зареждане...</p>}
        {!loading && filtered.length === 0 && <p className="text-center text-muted text-sm py-4">Няма намерени шаблони</p>}
        {Object.entries(groups).map(([type, items]) => (
          <div key={type}>
            <p className="px-3 py-1.5 text-xs font-semibold text-muted uppercase tracking-wide bg-bg/50">{type}</p>
            {items.map(t => (
              <button key={t.id} type="button"
                className="w-full text-left px-3 py-2 hover:bg-border transition-colors flex justify-between items-center gap-2"
                onClick={() => { onSelect(t); onClose() }}>
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  {t.default_description && <p className="text-xs text-muted">{t.default_description}</p>}
                </div>
                {t.unit_price && (
                  <span className="text-accent text-sm font-medium flex-shrink-0">{Number(t.unit_price).toFixed(2)} лв</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Create Order Modal ───────────────────────────────────────────────────────
function CreateOrderModal({ open, onClose, onCreated }) {
  const [clients, setClients] = useState([])
  const [form, setForm] = useState({
    client_id:'', order_type:'стъклопакет', deadline:'', is_urgent:false,
    sale_price:'', notes:'', source:'office',
    items:[{ product_desc:'', product_type:'стъклопакет', width:'', height:'', qty:1, unit_price:'' }]
  })
  const [loading, setLoading] = useState(false)
  const [showQuickClient, setShowQuickClient] = useState(false)
  const [catalogOpenIdx, setCatalogOpenIdx] = useState(null)
  const { isAdmin } = useAuth()

  useEffect(() => {
    if (open) api.get('/clients?limit=200').then(r => setClients(r.data.data))
  }, [open])

  const addItem = () => setForm(f => ({
    ...f,
    items: [...f.items, { product_desc:'', product_type:f.order_type, width:'', height:'', qty:1, unit_price:'' }]
  }))

  const removeItem = i => setForm(f => ({ ...f, items: f.items.filter((_,idx) => idx !== i) }))

  const updateItem = (i, field, val) => setForm(f => {
    const items = [...f.items]; items[i] = { ...items[i], [field]: val }; return { ...f, items }
  })

  const applyTemplate = (i, tpl) => {
    setForm(f => {
      const items = [...f.items]
      items[i] = {
        ...items[i],
        product_desc: tpl.default_description || tpl.name,
        product_type: tpl.order_type,
        width: tpl.default_width || items[i].width,
        height: tpl.default_height || items[i].height,
        unit_price: tpl.unit_price || items[i].unit_price,
      }
      return { ...f, items }
    })
  }

  const handleClientCreated = (client) => {
    setClients(prev => [client, ...prev])
    setForm(f => ({ ...f, client_id: client.id }))
    setShowQuickClient(false)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.client_id) return toast.error('Изберете клиент')
    setLoading(true)
    try {
      const res = await api.post('/orders', form)
      toast.success('Поръчката е създадена')
      onCreated(res.data)
      onClose()
      setForm({
        client_id:'', order_type:'стъклопакет', deadline:'', is_urgent:false,
        sale_price:'', notes:'', source:'office',
        items:[{ product_desc:'', product_type:'стъклопакет', width:'', height:'', qty:1, unit_price:'' }]
      })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка при създаване')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Нова поръчка" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client selector + quick create */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">Клиент *</label>
              {!showQuickClient && (
                <button type="button" className="text-xs text-accent hover:underline"
                  onClick={() => setShowQuickClient(true)}>
                  + Нов клиент
                </button>
              )}
            </div>
            <select className="select" value={form.client_id}
              onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))} required>
              <option value="">-- Изберете клиент --</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {showQuickClient && (
              <QuickClientForm
                onCreated={handleClientCreated}
                onCancel={() => setShowQuickClient(false)}
              />
            )}
          </div>

          <div>
            <label className="label">Тип поръчка *</label>
            <select className="select" value={form.order_type}
              onChange={e => setForm(f => ({ ...f, order_type: e.target.value }))}>
              {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Краен срок</label>
            <input type="date" className="input" value={form.deadline}
              onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
          </div>
          <div>
            <label className="label">Канал</label>
            <select className="select" value={form.source}
              onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
              {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{SOURCE_LABELS[s] || s}</option>)}
            </select>
          </div>
          {isAdmin && (
            <div>
              <label className="label">Продажна цена (лв)</label>
              <input type="number" className="input" placeholder="0.00" value={form.sale_price}
                onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))} />
            </div>
          )}
          <div className="flex items-center gap-3 pt-5">
            <input type="checkbox" id="urgent" className="w-4 h-4 accent-danger" checked={form.is_urgent}
              onChange={e => setForm(f => ({ ...f, is_urgent: e.target.checked }))} />
            <label htmlFor="urgent" className="text-sm text-gray-200">Спешна поръчка</label>
          </div>
        </div>

        <div>
          <label className="label">Бележки</label>
          <textarea className="input resize-none" rows={2} value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Артикули</label>
            <button type="button" className="btn-ghost text-xs" onClick={addItem}>+ Добави ред</button>
          </div>
          <div className="space-y-2">
            {form.items.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="grid grid-cols-12 gap-2 items-center">
                  {/* Description + catalog trigger */}
                  <div className="col-span-4 relative">
                    <input className="input w-full" placeholder="Описание (напр. 4-16Ar-4 Low-E)"
                      value={item.product_desc}
                      onChange={e => updateItem(i, 'product_desc', e.target.value)} />
                    {catalogOpenIdx === i && (
                      <CatalogPicker
                        orderType={form.order_type}
                        onSelect={tpl => applyTemplate(i, tpl)}
                        onClose={() => setCatalogOpenIdx(null)}
                      />
                    )}
                  </div>
                  <input className="input col-span-2" placeholder="Ш мм" type="number" value={item.width}
                    onChange={e => updateItem(i, 'width', e.target.value)} />
                  <input className="input col-span-2" placeholder="В мм" type="number" value={item.height}
                    onChange={e => updateItem(i, 'height', e.target.value)} />
                  <input className="input col-span-1" placeholder="Бр" type="number" min="1" value={item.qty}
                    onChange={e => updateItem(i, 'qty', e.target.value)} />
                  {isAdmin && (
                    <input className="input col-span-2" placeholder="Ед. цена" type="number" value={item.unit_price}
                      onChange={e => updateItem(i, 'unit_price', e.target.value)} />
                  )}
                  <button type="button"
                    className={`${isAdmin ? 'col-span-1' : 'col-span-3'} text-muted hover:text-danger flex justify-center`}
                    onClick={() => removeItem(i)} disabled={form.items.length === 1}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* Catalog button per row */}
                <button type="button"
                  className="text-xs text-accent hover:underline ml-0.5"
                  onClick={() => setCatalogOpenIdx(catalogOpenIdx === i ? null : i)}>
                  {catalogOpenIdx === i ? '↑ Затвори каталога' : '☰ Избери от каталога'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Създаване...' : 'Създай поръчка'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Main Orders page ─────────────────────────────────────────────────────────
export default function Orders() {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [filters, setFilters] = useState({ status:'', urgent:'', search:'', page:1 })
  const { isOffice } = useAuth()
  const navigate = useNavigate()

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status) params.set('status', filters.status)
      if (filters.urgent) params.set('urgent', 'true')
      if (filters.search) params.set('search', filters.search)
      params.set('page', filters.page)
      params.set('limit', 30)
      const { data } = await api.get(`/orders?${params}`)
      setOrders(data.data)
      setTotal(data.total)
    } finally { setLoading(false) }
  }, [filters])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Поръчки</h1>
          <p className="text-sm text-muted mt-0.5">{total} общо</p>
        </div>
        {isOffice && (
          <button className="btn-primary" onClick={() => setCreateOpen(true)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Нова поръчка
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input className="input w-52" placeholder="Търси поръчка или клиент..." value={filters.search}
          onChange={e => setFilter('search', e.target.value)} />
        <select className="select w-44" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          <option value="">Всички статуси</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className={`btn ${filters.urgent ? 'btn-danger' : 'btn-secondary'}`}
          onClick={() => setFilter('urgent', !filters.urgent)}>
          🔴 Само спешни
        </button>
      </div>

      {/* Table */}
      {loading ? <PageLoader /> : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Клиент</th><th>Тип</th><th>Статус</th>
                <th>Краен срок</th><th>Цена</th><th>Създадена</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-muted">Няма намерени поръчки</td></tr>
              )}
              {orders.map(o => {
                const isOverdue = o.deadline && isPast(parseISO(o.deadline)) && !['ГОТОВА','ДОСТАВЕНА','ОТКАЗАНА'].includes(o.status)
                return (
                  <tr key={o.id} className="cursor-pointer" onClick={() => navigate(`/orders/${o.id}`)}>
                    <td>
                      <span className="font-bold text-accent">#{o.order_number}</span>
                      {o.is_urgent && <span className="ml-1 text-danger text-xs">●</span>}
                      {o.open_defects > 0 && (
                        <span className="ml-1 badge bg-red-500/20 text-red-400 text-xs">{o.open_defects} брак</span>
                      )}
                    </td>
                    <td>
                      <div className="font-medium text-white">{o.client_name}</div>
                      {o.client_phone && <div className="text-xs text-muted">{o.client_phone}</div>}
                    </td>
                    <td><span className="text-xs text-muted">{o.order_type}</span></td>
                    <td><OrderStatusBadge status={o.status} /></td>
                    <td className={isOverdue ? 'text-danger font-semibold' : 'text-muted'}>
                      {o.deadline ? format(parseISO(o.deadline), 'd MMM yyyy', { locale: bg }) : '—'}
                      {isOverdue && ' ⚠'}
                    </td>
                    <td className="text-muted">{o.sale_price ? `${Number(o.sale_price).toLocaleString()} лв` : '—'}</td>
                    <td className="text-muted text-xs">{format(parseISO(o.created_at), 'd MMM', { locale: bg })}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > 30 && (
        <div className="flex justify-center gap-2 mt-4">
          <button className="btn-secondary" disabled={filters.page === 1}
            onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Назад</button>
          <span className="px-4 py-2 text-sm text-muted">Страница {filters.page}</span>
          <button className="btn-secondary" disabled={orders.length < 30}
            onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Напред →</button>
        </div>
      )}

      <CreateOrderModal open={createOpen} onClose={() => setCreateOpen(false)}
        onCreated={o => navigate(`/orders/${o.id}`)} />
    </div>
  )
}
