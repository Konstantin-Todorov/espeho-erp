import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'
import { bg } from 'date-fns/locale'

const CATEGORIES = ['стъкло','дистанционна_рамка','уплътнител','консуматив','химия','инструмент','друго']
const CAT_LABELS  = {
  стъкло:'Стъкло', дистанционна_рамка:'Дист. рамка', уплътнител:'Уплътнител',
  консуматив:'Консуматив', химия:'Химия', инструмент:'Инструмент', друго:'Друго',
}
const CAT_COLORS = {
  стъкло:'bg-blue-500/20 text-blue-400', дистанционна_рамка:'bg-yellow-500/20 text-yellow-400',
  уплътнител:'bg-purple-500/20 text-purple-400', консуматив:'bg-orange-500/20 text-orange-400',
  химия:'bg-red-500/20 text-red-400', инструмент:'bg-green-500/20 text-green-400',
  друго:'bg-gray-500/20 text-gray-400',
}

// ─── Receive (Приход) ─────────────────────────────────────────────────────────
function ReceiveModal({ open, onClose, onDone, materials, locations, preselect }) {
  const empty = { material_id:'', location_id:'', quantity:'', unit_price:'', notes:'' }
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) setForm({ ...empty, material_id: preselect?.material_id || '', location_id: preselect?.location_id || '' })
  }, [open, preselect])

  const mat = materials.find(m => m.id === form.material_id)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/warehouse/receive', { ...form, quantity: +form.quantity, unit_price: +form.unit_price || 0 })
      toast.success('Наличността е добавена')
      onDone(); onClose()
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
    finally { setLoading(false) }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <Modal open={open} onClose={onClose} title="📥 Добави наличност (приход)" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Материал *</label>
          <select className="select" required value={form.material_id} onChange={e => f('material_id', e.target.value)}>
            <option value="">— Изберете материал</option>
            {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
          </select>
        </div>
        <div>
          <label className="label">Локация (рафт / зона) *</label>
          <select className="select" required value={form.location_id} onChange={e => f('location_id', e.target.value)}>
            <option value="">— Изберете локация</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}{l.description ? ` — ${l.description}` : ''}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Количество * {mat && `(${mat.unit})`}</label>
            <input type="number" className="input" min="0.001" step="0.001" required placeholder="0"
              value={form.quantity} onChange={e => f('quantity', e.target.value)} />
          </div>
          <div>
            <label className="label">Ед. цена (€)</label>
            <input type="number" className="input" min="0" step="0.0001" placeholder="0.0000"
              value={form.unit_price} onChange={e => f('unit_price', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Бележка (доставчик, фактура...)</label>
          <input className="input" placeholder="напр. Доставчик Глас АД, фактура 1234"
            value={form.notes} onChange={e => f('notes', e.target.value)} />
        </div>
        <div className="flex gap-3 justify-end pt-1">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Записва...' : '📥 Добави наличност'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Issue (Изписване) ────────────────────────────────────────────────────────
function IssueModal({ open, onClose, onDone, materials, locations, preselect }) {
  const empty = { material_id:'', location_id:'', order_id:'', quantity:'', notes:'' }
  const [form, setForm] = useState(empty)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({ ...empty, material_id: preselect?.material_id || '', location_id: preselect?.location_id || '' })
      api.get('/orders?status=ПРОИЗВОДСТВО&limit=100').then(r => setOrders(r.data.data)).catch(() => {})
    }
  }, [open, preselect])

  const mat = materials.find(m => m.id === form.material_id)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/warehouse/issue', { ...form, quantity: +form.quantity })
      toast.success('Материалът е изписан')
      onDone(); onClose()
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
    finally { setLoading(false) }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <Modal open={open} onClose={onClose} title="📤 Изпиши материал към поръчка" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Материал *</label>
          <select className="select" required value={form.material_id} onChange={e => f('material_id', e.target.value)}>
            <option value="">— Изберете материал</option>
            {materials.map(m => <option key={m.id} value={m.id}>{m.name} — {Number(m.total_qty||0).toFixed(2)} {m.unit}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Взима се от локация *</label>
          <select className="select" required value={form.location_id} onChange={e => f('location_id', e.target.value)}>
            <option value="">— Изберете локация</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">За поръчка *</label>
          <select className="select" required value={form.order_id} onChange={e => f('order_id', e.target.value)}>
            <option value="">— Изберете поръчка</option>
            {orders.map(o => <option key={o.id} value={o.id}>#{o.order_number} — {o.client_name}</option>)}
          </select>
          {orders.length === 0 && <p className="text-xs text-muted mt-1">Само поръчки в статус ПРОИЗВОДСТВО</p>}
        </div>
        <div>
          <label className="label">Количество * {mat && `(${mat.unit})`}</label>
          <input type="number" className="input" min="0.001" step="0.001" required placeholder="0"
            value={form.quantity} onChange={e => f('quantity', e.target.value)} />
        </div>
        <div>
          <label className="label">Бележка</label>
          <input className="input" value={form.notes} onChange={e => f('notes', e.target.value)} />
        </div>
        <div className="flex gap-3 justify-end pt-1">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-danger" disabled={loading}>
            {loading ? 'Изписва...' : '📤 Изпиши материала'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Material Form (Add/Edit) ─────────────────────────────────────────────────
function MaterialFormModal({ open, onClose, material, onDone }) {
  const isEdit = !!material
  const empty = { name:'', code:'', category:'стъкло', unit:'м²', price_per_unit:'', min_threshold:'', description:'' }
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) setForm(material ? {
      name: material.name || '', code: material.code || '',
      category: material.category || 'стъкло', unit: material.unit || 'м²',
      price_per_unit: material.price_per_unit || '',
      min_threshold: material.min_threshold || '',
      description: material.description || '',
    } : empty)
  }, [open, material])

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, price_per_unit: +form.price_per_unit||0, min_threshold: +form.min_threshold||0 }
      if (isEdit) await api.patch(`/warehouse/materials/${material.id}`, payload)
      else await api.post('/warehouse/materials', payload)
      toast.success(isEdit ? 'Материалът е обновен' : 'Материалът е добавен')
      onDone(); onClose()
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
    finally { setLoading(false) }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? `Редактирай: ${material?.name}` : 'Нов материал'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Наименование *</label>
          <input className="input" required placeholder="напр. Флоат стъкло 6мм" value={form.name} onChange={e => f('name', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Код / SKU</label>
            <input className="input font-mono" placeholder="GL-006" value={form.code} onChange={e => f('code', e.target.value)} />
          </div>
          <div>
            <label className="label">Категория *</label>
            <select className="select" required value={form.category} onChange={e => f('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Мерна единица *</label>
            <div className="flex gap-1 flex-wrap mb-1">
              {['м²','м','кг','л','бр','пак'].map(u => (
                <button key={u} type="button" onClick={() => f('unit', u)}
                  className={`text-xs px-2 py-0.5 rounded border transition-colors ${form.unit===u ? 'bg-accent text-white border-accent' : 'border-border text-muted hover:text-white'}`}>
                  {u}
                </button>
              ))}
            </div>
            <input className="input" required placeholder="или напишете..." value={form.unit} onChange={e => f('unit', e.target.value)} />
          </div>
          <div>
            <label className="label">Цена / единица (€)</label>
            <input type="number" className="input" min="0" step="0.0001" placeholder="0.0000"
              value={form.price_per_unit} onChange={e => f('price_per_unit', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="label">Минимална наличност (за предупреждение)</label>
            <input type="number" className="input" min="0" step="0.01" placeholder="напр. 10"
              value={form.min_threshold} onChange={e => f('min_threshold', e.target.value)} />
            <p className="text-xs text-muted mt-1">При спадане под тази стойност системата ще покаже предупреждение</p>
          </div>
        </div>
        <div>
          <label className="label">Описание / бележка</label>
          <textarea className="input resize-none" rows={2} placeholder="Допълнителна информация..."
            value={form.description} onChange={e => f('description', e.target.value)} />
        </div>
        <div className="flex gap-3 justify-end pt-1">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-primary" disabled={loading || !form.name}>
            {loading ? 'Записва...' : isEdit ? 'Запази промените' : '+ Добави материал'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Location Form ────────────────────────────────────────────────────────────
function LocationFormModal({ open, onClose, location, onDone }) {
  const isEdit = !!location
  const [form, setForm] = useState({ name:'', description:'' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) setForm({ name: location?.name||'', description: location?.description||'' })
  }, [open, location])

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) await api.patch(`/warehouse/locations/${location.id}`, form)
      else await api.post('/warehouse/locations', form)
      toast.success(isEdit ? 'Локацията е обновена' : 'Локацията е добавена')
      onDone(); onClose()
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
    finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? `Редактирай локация: ${location?.name}` : 'Нова локация'} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Наименование *</label>
          <input className="input" required placeholder="напр. Рафт А1, Зона Стъкло, Двор"
            value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div>
          <label className="label">Описание</label>
          <input className="input" placeholder="напр. Северен склад, ред 2"
            value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-primary" disabled={loading || !form.name}>
            {loading ? 'Записва...' : isEdit ? 'Запази' : '+ Добави локация'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Material Detail Modal ────────────────────────────────────────────────────
function MaterialDetailModal({ open, onClose, material, locations, onEdit, onReceive, onIssue, onRefresh, isAdmin, isWarehouse }) {
  const [movements, setMovements] = useState([])
  const [loadingMov, setLoadingMov] = useState(false)

  useEffect(() => {
    if (!open || !material) return
    setLoadingMov(true)
    api.get(`/warehouse/movements?material_id=${material.id}&limit=15`)
      .then(r => setMovements(r.data))
      .catch(() => {})
      .finally(() => setLoadingMov(false))
  }, [open, material])

  if (!material) return null

  const totalQty = Number(material.total_qty || 0)
  const isLow = material.stock_by_location?.some(s => s.below_threshold) || (material.min_threshold > 0 && totalQty <= material.min_threshold)

  return (
    <Modal open={open} onClose={onClose} title={material.name} size="lg">
      <div className="space-y-5">
        {/* Info row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { label: 'Категория', val: CAT_LABELS[material.category] || material.category },
            { label: 'Мерна единица', val: material.unit },
            { label: 'Цена / единица', val: `${Number(material.price_per_unit||0).toFixed(4)} €` },
            { label: 'Код', val: material.code || '—' },
          ].map(item => (
            <div key={item.label} className="bg-surface/50 border border-border rounded-xl px-3 py-2">
              <p className="text-xs text-muted uppercase tracking-wide">{item.label}</p>
              <p className="font-medium text-white mt-0.5">{item.val}</p>
            </div>
          ))}
        </div>

        {/* Stock by location */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Наличности по локации</h3>
            <span className={`text-sm font-bold ${isLow ? 'text-yellow-400' : 'text-white'}`}>
              Общо: {totalQty.toFixed(2)} {material.unit} {isLow && '⚠'}
            </span>
          </div>
          {(!material.stock_by_location || material.stock_by_location.filter(s => s.quantity > 0).length === 0) ? (
            <p className="text-muted text-sm py-3 text-center border border-dashed border-border rounded-xl">Няма наличност</p>
          ) : (
            <div className="space-y-1.5">
              {material.stock_by_location.filter(s => s.quantity > 0).map((s, i) => {
                const loc = locations.find(l => l.name === s.location_name)
                return (
                  <div key={i} className={`flex items-center justify-between px-4 py-2.5 rounded-xl border
                    ${s.below_threshold ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-border bg-surface/40'}`}>
                    <span className="text-gray-300">{s.location_name}</span>
                    <div className="flex items-center gap-3">
                      {s.below_threshold && <span className="text-xs text-yellow-400">⚠ Под минимум</span>}
                      <span className={`font-semibold ${s.below_threshold ? 'text-yellow-400' : 'text-white'}`}>
                        {Number(s.quantity).toFixed(2)} {material.unit}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {material.min_threshold > 0 && (
            <p className="text-xs text-muted mt-2">Минимален праг: {material.min_threshold} {material.unit}</p>
          )}
        </div>

        {/* Recent movements */}
        <div>
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">Последни движения</h3>
          {loadingMov ? (
            <div className="py-4 flex justify-center"><div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
          ) : movements.length === 0 ? (
            <p className="text-muted text-sm py-3 text-center border border-dashed border-border rounded-xl">Няма движения</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {movements.map(m => (
                <div key={m.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface/30">
                  <span className={`text-xs font-bold w-5 text-center ${m.movement_type==='ПОЛУЧЕНО' ? 'text-green-400' : 'text-red-400'}`}>
                    {m.movement_type==='ПОЛУЧЕНО' ? '+' : '−'}
                  </span>
                  <span className="text-sm text-white">{Math.abs(m.quantity).toFixed(2)} {material.unit}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${m.movement_type==='ПОЛУЧЕНО' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {m.movement_type==='ПОЛУЧЕНО' ? 'Приход' : 'Изписване'}
                  </span>
                  <span className="text-xs text-muted flex-1">{m.order_number ? `Поръчка #${m.order_number}` : ''}{m.worker_name ? ` · ${m.worker_name}` : ''}</span>
                  <span className="text-xs text-muted">{format(parseISO(m.created_at), 'd MMM HH:mm', { locale: bg })}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {(isAdmin || isWarehouse) && (
            <button className="btn-primary" onClick={() => { onClose(); onReceive({ material_id: material.id }) }}>
              📥 Добави наличност
            </button>
          )}
          <button className="btn-secondary" onClick={() => { onClose(); onIssue({ material_id: material.id }) }}>
            📤 Изпиши към поръчка
          </button>
          {(isAdmin || isWarehouse) && (
            <button className="btn-secondary ml-auto" onClick={() => { onClose(); onEdit(material) }}>
              ✏ Редактирай
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

// ─── Main Warehouse Page ──────────────────────────────────────────────────────
export default function Warehouse() {
  const { isAdmin, isWarehouse } = useAuth()
  const [materials, setMaterials]   = useState([])
  const [locations, setLocations]   = useState([])
  const [movements, setMovements]   = useState([])
  const [lowStock, setLowStock]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [activeTab, setActiveTab]   = useState('stock')

  // modals
  const [receivePreselect, setReceivePreselect] = useState(null)
  const [issuePreselect, setIssuePreselect]     = useState(null)
  const [matFormTarget, setMatFormTarget]       = useState(undefined) // undefined=closed, null=new, obj=edit
  const [locFormTarget, setLocFormTarget]       = useState(undefined)
  const [detailMat, setDetailMat]               = useState(null)

  // filters
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [matRes, locRes, movRes, lowRes] = await Promise.all([
        api.get('/warehouse/materials'),
        api.get('/warehouse/locations'),
        api.get('/warehouse/movements?limit=50'),
        api.get('/warehouse/low-stock'),
      ])
      setMaterials(matRes.data)
      setLocations(locRes.data)
      setMovements(movRes.data)
      setLowStock(lowRes.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const filteredMaterials = materials.filter(m => {
    if (category && m.category !== category) return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.code?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading) return <PageLoader />

  const tabs = [
    { id: 'stock',     label: '📦 Наличности',  count: materials.length },
    { id: 'movements', label: '↕ Движения',      count: null },
    { id: 'locations', label: '📍 Локации',       count: locations.length },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Склад</h1>
          <p className="text-sm text-muted mt-0.5">
            {materials.length} материала · {locations.length} локации
            {lowStock.length > 0 && <span className="text-yellow-400"> · {lowStock.length} под минимум</span>}
          </p>
        </div>
        {(isAdmin || isWarehouse) && (
          <div className="flex gap-2 flex-wrap">
            <button className="btn-primary" onClick={() => setReceivePreselect({})}>
              📥 Приход
            </button>
            <button className="btn-secondary" onClick={() => setIssuePreselect({})}>
              📤 Изписване
            </button>
          </div>
        )}
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="card border-yellow-500/30 bg-yellow-500/5 mb-5">
          <p className="text-yellow-400 font-semibold mb-3">⚠ Материали под минималната наличност</p>
          <div className="space-y-1.5">
            {lowStock.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <button className="text-gray-300 hover:text-accent hover:underline text-left"
                  onClick={() => setDetailMat(materials.find(m => m.name === s.name))}>
                  {s.name}
                </button>
                <div className="flex items-center gap-4">
                  <span className="text-muted text-xs">{s.location_name}</span>
                  <span className="text-yellow-400 font-medium">{Number(s.quantity).toFixed(2)} {s.unit}</span>
                  <span className="text-muted text-xs">мин: {Number(s.min_threshold).toFixed(2)}</span>
                  {(isAdmin || isWarehouse) && (
                    <button className="text-xs text-accent hover:underline" onClick={() => setReceivePreselect({ material_id: materials.find(m=>m.name===s.name)?.id })}>
                      + Добави
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border gap-1 mb-5">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap
              ${activeTab === t.id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-white'}`}>
            {t.label}
            {t.count !== null && <span className="ml-1.5 text-xs text-muted">({t.count})</span>}
          </button>
        ))}
      </div>

      {/* ── STOCK TAB ── */}
      {activeTab === 'stock' && (
        <>
          <div className="flex flex-wrap gap-3 mb-4 items-center justify-between">
            <div className="flex gap-3 flex-wrap">
              <input className="input w-52" placeholder="Търси по наименование или код..."
                value={search} onChange={e => setSearch(e.target.value)} />
              <select className="select w-44" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Всички категории</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
              </select>
            </div>
            {(isAdmin || isWarehouse) && (
              <button className="btn-secondary text-sm" onClick={() => setMatFormTarget(null)}>
                + Нов материал
              </button>
            )}
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Материал</th><th>Категория</th><th>Локации / наличност</th>
                  <th className="text-right">Общо</th><th className="text-right">Цена/ед.</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-muted">
                    {search || category ? 'Няма намерени материали' : 'Няма добавени материали'}
                  </td></tr>
                )}
                {filteredMaterials.map(m => {
                  const totalQty = Number(m.total_qty || 0)
                  const isLow = m.stock_by_location?.some(s => s.below_threshold)
                  return (
                    <tr key={m.id} className={`cursor-pointer ${isLow ? 'bg-yellow-500/5' : ''}`}
                      onClick={() => setDetailMat(m)}>
                      <td>
                        <div className="font-medium text-white hover:text-accent transition-colors">{m.name}</div>
                        {m.code && <div className="text-xs text-muted font-mono">{m.code}</div>}
                        {m.description && <div className="text-xs text-muted truncate max-w-[200px]">{m.description}</div>}
                      </td>
                      <td>
                        <span className={`badge ${CAT_COLORS[m.category] || 'bg-gray-500/20 text-gray-400'}`}>
                          {CAT_LABELS[m.category] || m.category}
                        </span>
                      </td>
                      <td>
                        <div className="space-y-0.5">
                          {m.stock_by_location?.filter(s => s.quantity > 0).map((s, i) => (
                            <div key={i} className="text-xs text-muted">
                              <span className="text-gray-400">{s.location_name}:</span> {Number(s.quantity).toFixed(2)} {m.unit}
                              {s.below_threshold && <span className="text-yellow-400 ml-1">⚠</span>}
                            </div>
                          ))}
                          {!m.stock_by_location?.some(s => s.quantity > 0) && <span className="text-xs text-muted">Няма наличност</span>}
                        </div>
                      </td>
                      <td className={`text-right font-semibold ${isLow ? 'text-yellow-400' : 'text-white'}`}>
                        {totalQty.toFixed(2)} <span className="text-xs text-muted">{m.unit}</span>
                      </td>
                      <td className="text-right text-muted text-sm">{Number(m.price_per_unit||0).toFixed(4)} €</td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1 justify-end">
                          {(isAdmin || isWarehouse) && (
                            <button className="text-xs text-accent hover:underline px-2 py-1"
                              onClick={() => setReceivePreselect({ material_id: m.id })}>📥</button>
                          )}
                          <button className="text-xs text-muted hover:text-white px-2 py-1"
                            onClick={() => setIssuePreselect({ material_id: m.id })}>📤</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── MOVEMENTS TAB ── */}
      {activeTab === 'movements' && (
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Материал</th><th>Тип</th><th>Количество</th><th>Локация</th><th>Поръчка</th><th>Работник</th><th>Дата</th></tr>
            </thead>
            <tbody>
              {movements.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-muted">Няма записани движения</td></tr>
              )}
              {movements.map(m => (
                <tr key={m.id}>
                  <td className="font-medium text-white">{m.material_name}</td>
                  <td>
                    <span className={`badge ${m.movement_type==='ПОЛУЧЕНО' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                      {m.movement_type === 'ПОЛУЧЕНО' ? '📥 Приход' : '📤 Изписване'}
                    </span>
                  </td>
                  <td className={`font-semibold ${m.movement_type==='ПОЛУЧЕНО' ? 'text-green-400' : 'text-red-400'}`}>
                    {m.movement_type==='ПОЛУЧЕНО' ? '+' : '−'}{Math.abs(m.quantity).toFixed(2)} {m.unit}
                  </td>
                  <td className="text-muted text-sm">{m.location_name || '—'}</td>
                  <td className="text-muted text-sm">{m.order_number ? `#${m.order_number}` : '—'}</td>
                  <td className="text-muted">{m.worker_name || '—'}</td>
                  <td className="text-muted text-xs whitespace-nowrap">{format(parseISO(m.created_at), 'd MMM yyyy · HH:mm', { locale: bg })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── LOCATIONS TAB ── */}
      {activeTab === 'locations' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted">Зони и рафтове в склада</p>
            {(isAdmin || isWarehouse) && (
              <button className="btn-secondary text-sm" onClick={() => setLocFormTarget(null)}>
                + Нова локация
              </button>
            )}
          </div>
          {locations.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-2xl mb-3">📍</p>
              <p className="text-white font-semibold mb-1">Няма добавени локации</p>
              <p className="text-muted text-sm mb-4">Добавете зони и рафтове за организиране на склада</p>
              {(isAdmin || isWarehouse) && (
                <button className="btn-primary mx-auto" onClick={() => setLocFormTarget(null)}>+ Добави локация</button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {locations.map(loc => {
                const matsHere = materials.filter(m => m.stock_by_location?.some(s => s.location_name === loc.name && s.quantity > 0))
                return (
                  <div key={loc.id} className="card hover:border-accent/40 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-white">📍 {loc.name}</p>
                        {loc.description && <p className="text-xs text-muted mt-0.5">{loc.description}</p>}
                      </div>
                      {(isAdmin || isWarehouse) && (
                        <button className="text-xs text-muted hover:text-accent"
                          onClick={() => setLocFormTarget(loc)}>✏ Редактирай</button>
                      )}
                    </div>
                    {matsHere.length === 0 ? (
                      <p className="text-xs text-muted">Няма материали на тази локация</p>
                    ) : (
                      <div className="space-y-1">
                        {matsHere.map(m => {
                          const s = m.stock_by_location.find(s => s.location_name === loc.name)
                          return (
                            <div key={m.id} className="flex justify-between text-xs">
                              <span className="text-gray-400">{m.name}</span>
                              <span className={`font-medium ${s?.below_threshold ? 'text-yellow-400' : 'text-white'}`}>
                                {Number(s?.quantity||0).toFixed(2)} {m.unit}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── Modals ── */}
      <ReceiveModal
        open={receivePreselect !== null} onClose={() => setReceivePreselect(null)}
        onDone={fetchAll} materials={materials} locations={locations} preselect={receivePreselect}
      />
      <IssueModal
        open={issuePreselect !== null} onClose={() => setIssuePreselect(null)}
        onDone={fetchAll} materials={materials} locations={locations} preselect={issuePreselect}
      />
      <MaterialFormModal
        open={matFormTarget !== undefined} onClose={() => setMatFormTarget(undefined)}
        material={matFormTarget || null} onDone={fetchAll}
      />
      <LocationFormModal
        open={locFormTarget !== undefined} onClose={() => setLocFormTarget(undefined)}
        location={locFormTarget || null} onDone={fetchAll}
      />
      <MaterialDetailModal
        open={!!detailMat} onClose={() => setDetailMat(null)}
        material={detailMat} locations={locations}
        onEdit={m => { setDetailMat(null); setMatFormTarget(m) }}
        onReceive={p => setReceivePreselect(p)}
        onIssue={p => setIssuePreselect(p)}
        onRefresh={fetchAll}
        isAdmin={isAdmin} isWarehouse={isWarehouse}
      />
    </div>
  )
}
