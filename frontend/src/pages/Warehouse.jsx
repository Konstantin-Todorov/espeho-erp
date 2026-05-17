import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from '../components/ui/Spinner'
import Modal, { ConfirmDialog } from '../components/ui/Modal'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'
import { bg } from 'date-fns/locale'

const CATEGORIES = ['стъкло','дистанционна_рамка','уплътнител','консуматив','химия','инструмент','друго']
const CAT_LABELS  = { стъкло:'Стъкло', дистанционна_рамка:'Дист. рамка', уплътнител:'Уплътнител', консуматив:'Консуматив', химия:'Химия', инструмент:'Инструмент', друго:'Друго' }

// ─── Receive Material Modal ───────────────────────────────────────────────────
function ReceiveModal({ open, onClose, onDone, materials, locations }) {
  const [form, setForm] = useState({ material_id:'', location_id:'', quantity:'', unit_price:'', notes:'' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/warehouse/receive', { ...form, quantity: +form.quantity, unit_price: +form.unit_price })
      toast.success('Материалът е получен')
      onDone(); onClose()
      setForm({ material_id:'', location_id:'', quantity:'', unit_price:'', notes:'' })
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
    finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Получаване на материал" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Материал *</label>
          <select className="select" value={form.material_id} onChange={e=>setForm(f=>({...f,material_id:e.target.value}))} required>
            <option value="">-- Изберете материал --</option>
            {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
          </select>
        </div>
        <div>
          <label className="label">Локация *</label>
          <select className="select" value={form.location_id} onChange={e=>setForm(f=>({...f,location_id:e.target.value}))} required>
            <option value="">-- Изберете локация --</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Количество *</label>
            <input type="number" className="input" min="0.01" step="0.01" placeholder="0" value={form.quantity}
              onChange={e=>setForm(f=>({...f,quantity:e.target.value}))} required />
          </div>
          <div>
            <label className="label">Ед. цена (лв)</label>
            <input type="number" className="input" min="0" step="0.01" placeholder="0.00" value={form.unit_price}
              onChange={e=>setForm(f=>({...f,unit_price:e.target.value}))} />
          </div>
        </div>
        <div>
          <label className="label">Бележка</label>
          <input className="input" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} />
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-primary" disabled={loading}>Получи</button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Issue Material Modal ─────────────────────────────────────────────────────
function IssueModal({ open, onClose, onDone, materials, locations }) {
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState({ material_id:'', location_id:'', order_id:'', quantity:'', notes:'' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) api.get('/orders?status=ПРОИЗВОДСТВО&limit=100').then(r => setOrders(r.data.data))
  }, [open])

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/warehouse/issue', { ...form, quantity: +form.quantity })
      toast.success('Материалът е изписан')
      onDone(); onClose()
      setForm({ material_id:'', location_id:'', order_id:'', quantity:'', notes:'' })
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
    finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Изписване към поръчка" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Материал *</label>
          <select className="select" value={form.material_id} onChange={e=>setForm(f=>({...f,material_id:e.target.value}))} required>
            <option value="">-- Изберете материал --</option>
            {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
          </select>
        </div>
        <div>
          <label className="label">Локация *</label>
          <select className="select" value={form.location_id} onChange={e=>setForm(f=>({...f,location_id:e.target.value}))} required>
            <option value="">-- Изберете локация --</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Поръчка *</label>
          <select className="select" value={form.order_id} onChange={e=>setForm(f=>({...f,order_id:e.target.value}))} required>
            <option value="">-- Изберете поръчка --</option>
            {orders.map(o => <option key={o.id} value={o.id}>#{o.order_number} — {o.client_name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Количество *</label>
          <input type="number" className="input" min="0.01" step="0.01" placeholder="0" value={form.quantity}
            onChange={e=>setForm(f=>({...f,quantity:e.target.value}))} required />
        </div>
        <div>
          <label className="label">Бележка</label>
          <input className="input" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} />
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-danger" disabled={loading}>Изпиши</button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Material Edit Modal ──────────────────────────────────────────────────────
function MaterialModal({ open, onClose, material, onSaved }) {
  const isEdit = !!material
  const empty = { name:'', code:'', category:'стъкло', unit:'м²', price_per_unit:'', description:'' }
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) setForm(material ? {
      name: material.name || '',
      code: material.code || '',
      category: material.category || 'стъкло',
      unit: material.unit || 'м²',
      price_per_unit: material.price_per_unit || '',
      description: material.description || '',
    } : empty)
  }, [open, material])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name || !form.unit || !form.category) return toast.error('Назованието, единицата и категорията са задължителни')
    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/warehouse/materials/${material.id}`, form)
        toast.success('Материалът е обновен')
      } else {
        await api.post('/warehouse/materials', form)
        toast.success('Материалът е създаден')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Редактирай материал' : 'Нов материал'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Наименование *</label>
          <input className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Код</label>
            <input className="input font-mono" value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value}))} placeholder="SKU-001" />
          </div>
          <div>
            <label className="label">Категория *</label>
            <select className="select" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} required>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Мерна единица *</label>
            <input className="input" value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} required placeholder="м², кг, бр..." />
          </div>
          <div>
            <label className="label">Цена / единица (лв)</label>
            <input type="number" step="0.0001" min="0" className="input" value={form.price_per_unit}
              onChange={e=>setForm(f=>({...f,price_per_unit:e.target.value}))} placeholder="0.00" />
          </div>
        </div>
        <div>
          <label className="label">Описание</label>
          <textarea className="input resize-none" rows={2} value={form.description}
            onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Запазване...' : isEdit ? 'Запази' : 'Създай'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Materials Management Tab ─────────────────────────────────────────────────
function MaterialsManagement({ materials, onRefresh }) {
  const { isAdmin } = useAuth()
  const [editTarget, setEditTarget] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const filtered = materials.filter(m => {
    if (category && m.category !== category) return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.code?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleEdit = mat => { setEditTarget(mat); setModalOpen(true) }
  const handleNew  = ()  => { setEditTarget(null); setModalOpen(true) }

  const handleDelete = async () => {
    try {
      await api.delete(`/warehouse/materials/${deleteTarget.id}`)
      toast.success('Материалът е деактивиран')
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setDeleteTarget(null) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Управление на материали</h2>
        <button className="btn-primary text-sm" onClick={handleNew}>+ Нов материал</button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input className="input w-52" placeholder="Търси материал..." value={search}
          onChange={e => setSearch(e.target.value)} />
        <select className="select w-44" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Всички категории</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Наименование</th>
              <th>Код</th>
              <th>Категория</th>
              <th>Ед.</th>
              <th className="text-right">Цена/ед.</th>
              <th>Наличност</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-muted">Няма намерени материали</td></tr>
            )}
            {filtered.map(m => (
              <tr key={m.id}>
                <td>
                  <p className="font-medium text-white">{m.name}</p>
                  {m.description && <p className="text-xs text-muted truncate max-w-xs">{m.description}</p>}
                </td>
                <td className="text-muted font-mono text-xs">{m.code || '—'}</td>
                <td><span className="badge bg-border text-muted">{CAT_LABELS[m.category]}</span></td>
                <td className="text-muted">{m.unit}</td>
                <td className="text-right text-muted">{Number(m.price_per_unit || 0).toFixed(4)} лв</td>
                <td className="text-muted">{Number(m.total_qty || 0).toFixed(2)}</td>
                <td>
                  <div className="flex gap-2 justify-end">
                    <button className="btn-secondary text-xs py-1" onClick={() => handleEdit(m)}>Редактирай</button>
                    {isAdmin && (
                      <button className="btn-danger text-xs py-1" onClick={() => setDeleteTarget(m)}>Изтрий</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MaterialModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        material={editTarget}
        onSaved={onRefresh}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Деактивирай материал"
        message={`Сигурни ли сте, че искате да деактивирате "${deleteTarget?.name}"? Той няма да се показва в списъците.`}
        danger
      />
    </div>
  )
}

// ─── Main Warehouse Page ──────────────────────────────────────────────────────
export default function Warehouse() {
  const [materials, setMaterials] = useState([])
  const [locations, setLocations] = useState([])
  const [movements, setMovements] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [receiveOpen, setReceiveOpen] = useState(false)
  const [issueOpen, setIssueOpen] = useState(false)
  const [filters, setFilters] = useState({ category: '', search: '' })
  const [activeTab, setActiveTab] = useState('stock')
  const { isAdmin, isWarehouse } = useAuth()

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

  const filtered = materials.filter(m => {
    if (filters.category && m.category !== filters.category) return false
    if (filters.search && !m.name.toLowerCase().includes(filters.search.toLowerCase()) && !m.code?.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  if (loading) return <PageLoader />

  const tabs = [
    { id: 'stock',    label: 'Наличности' },
    { id: 'movements',label: 'Движения' },
    ...(isAdmin || isWarehouse ? [{ id: 'manage', label: 'Управление' }] : []),
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Склад</h1>
          <p className="text-sm text-muted mt-0.5">
            {materials.length} материала
            {lowStock.length > 0 && <span className="text-yellow-400"> · {lowStock.length} под минимум</span>}
          </p>
        </div>
        {(isAdmin || isWarehouse) && (
          <div className="flex gap-2">
            <button className="btn-primary" onClick={() => setReceiveOpen(true)}>+ Получаване</button>
            <button className="btn-secondary" onClick={() => setIssueOpen(true)}>↑ Изписване</button>
          </div>
        )}
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="card border-yellow-500/30 mb-6">
          <p className="text-yellow-400 font-semibold mb-3">⚠ Материали под минималната наличност</p>
          <div className="space-y-2">
            {lowStock.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{s.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-muted">{s.location_name}</span>
                  <span className="text-danger font-medium">{Number(s.quantity).toFixed(2)} {s.unit}</span>
                  <span className="text-muted">/ мин: {Number(s.min_threshold).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border gap-1 mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
              ${activeTab === t.id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Stock tab */}
      {activeTab === 'stock' && (
        <>
          <div className="flex flex-wrap gap-3 mb-4">
            <input className="input w-52" placeholder="Търси материал..." value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
            <select className="select w-44" value={filters.category}
              onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
              <option value="">Всички категории</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </select>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Материал</th><th>Код</th><th>Категория</th><th>Ед.</th>
                  <th className="text-right">Наличност</th><th className="text-right">Цена/ед.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-muted">Няма намерени материали</td></tr>
                )}
                {filtered.map(m => {
                  const totalQty = Number(m.total_qty || 0)
                  const hasLowStock = m.stock_by_location?.some(s => s.below_threshold)
                  return (
                    <tr key={m.id} className={hasLowStock ? 'bg-yellow-500/5' : ''}>
                      <td>
                        <div className="font-medium text-white">{m.name}</div>
                        {m.stock_by_location?.map((s, i) => s.quantity > 0 && (
                          <div key={i} className="text-xs text-muted">
                            {s.location_name}: {Number(s.quantity).toFixed(2)}
                          </div>
                        ))}
                      </td>
                      <td className="text-muted font-mono text-xs">{m.code || '—'}</td>
                      <td><span className="badge bg-border text-muted">{CAT_LABELS[m.category]}</span></td>
                      <td className="text-muted">{m.unit}</td>
                      <td className={`text-right font-medium ${hasLowStock ? 'text-yellow-400' : 'text-white'}`}>
                        {totalQty.toFixed(2)}{hasLowStock && ' ⚠'}
                      </td>
                      <td className="text-right text-muted">{Number(m.price_per_unit).toFixed(4)} лв</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Movements tab */}
      {activeTab === 'movements' && (
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Материал</th><th>Тип</th><th>Кол.</th><th>Поръчка</th><th>Работник</th><th>Дата</th></tr>
            </thead>
            <tbody>
              {movements.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-muted">Няма движения</td></tr>
              )}
              {movements.map(m => (
                <tr key={m.id}>
                  <td className="font-medium text-white">{m.material_name}</td>
                  <td>
                    <span className={`badge ${m.movement_type === 'ПОЛУЧЕНО' ? 'bg-green-500/20 text-green-400' :
                      m.movement_type === 'ИЗПИСАНО' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {m.movement_type}
                    </span>
                  </td>
                  <td className="font-medium">
                    <span className={m.movement_type === 'ПОЛУЧЕНО' ? 'text-green-400' : 'text-danger'}>
                      {m.movement_type === 'ПОЛУЧЕНО' ? '+' : '-'}{Math.abs(m.quantity).toFixed(2)} {m.unit}
                    </span>
                  </td>
                  <td className="text-muted text-sm">{m.order_number ? `#${m.order_number}` : '—'}</td>
                  <td className="text-muted">{m.worker_name}</td>
                  <td className="text-muted text-xs">{format(parseISO(m.created_at), 'd MMM HH:mm', { locale: bg })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Management tab */}
      {activeTab === 'manage' && (isAdmin || isWarehouse) && (
        <MaterialsManagement materials={materials} onRefresh={fetchAll} />
      )}

      <ReceiveModal open={receiveOpen} onClose={() => setReceiveOpen(false)}
        onDone={fetchAll} materials={materials} locations={locations} />
      <IssueModal open={issueOpen} onClose={() => setIssueOpen(false)}
        onDone={fetchAll} materials={materials} locations={locations} />
    </div>
  )
}
