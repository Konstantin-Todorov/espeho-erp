import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import Modal from '../components/ui/Modal'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { dateBg, todayStr, num } from '../utils/labels'

const fmt = d => dateBg(d)

const PO_STATUS = {
  DRAFT:     { label: 'Чернова',          color: 'bg-gray-500/20 text-gray-400' },
  SENT:      { label: 'Изпратена',        color: 'bg-blue-500/20 text-blue-400' },
  PARTIAL:   { label: 'Частично приета',  color: 'bg-yellow-500/20 text-yellow-400' },
  RECEIVED:  { label: 'Приета',           color: 'bg-green-500/20 text-green-400' },
  CANCELLED: { label: 'Отказана',         color: 'bg-red-500/20 text-red-400' },
}
const OPEN_PO = ['DRAFT', 'SENT', 'PARTIAL']

// ─── Receive goods into stock ─────────────────────────────────────────────────
function ReceiveModal({ poId, onClose, onSaved }) {
  const [po, setPO] = useState(null)
  const [locations, setLocations] = useState([])
  const [locationId, setLocationId] = useState('')
  const [qty, setQty] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!poId) return
    setPO(null)
    Promise.all([api.get(`/suppliers/purchase-orders/${poId}`), api.get('/warehouse/locations')])
      .then(([poRes, locRes]) => {
        setPO(poRes.data)
        setLocations(locRes.data)
        setLocationId(locRes.data[0]?.id || '')
        setQty(Object.fromEntries((poRes.data.items || []).map(it => {
          const rest = Math.max(0, Number(it.quantity || 0) - Number(it.received_qty || 0))
          return [it.id, rest ? String(rest) : '']
        })))
      })
      .catch(err => { toast.error(err.response?.data?.error || 'Поръчката не може да бъде заредена'); onClose() })
  }, [poId])

  const submit = async e => {
    e.preventDefault()
    if (!locationId) return toast.error('Изберете склад/локация')
    const items = Object.entries(qty)
      .filter(([, v]) => Number(v) > 0)
      .map(([poi_id, v]) => ({ poi_id, received_qty: Number(v) }))
    if (!items.length) return toast.error('Въведете получено количество')
    setSaving(true)
    try {
      const { data } = await api.post(`/suppliers/purchase-orders/${poId}/receive`, { location_id: locationId, items })
      toast.success(data.status === 'PARTIAL' ? 'Приета частично — остатъкът чака' : 'Стоката е приета в склада')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setSaving(false) }
  }

  return (
    <Modal open={!!poId} onClose={onClose} title={`Приеми стоката${po ? ` — ${po.po_number} · ${po.supplier_name}` : ''}`} size="lg">
      {!po ? <div className="text-center py-10 text-muted">Зарежда се…</div> : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Склад / локация *</label>
            <select className="select" value={locationId} onChange={e => setLocationId(e.target.value)} required>
              {!locations.length && <option value="">— Няма складове</option>}
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Артикул</th><th className="text-right">Поръчано</th><th className="text-right">Прието досега</th><th className="text-right">Приемам сега</th></tr>
              </thead>
              <tbody>
                {(po.items || []).map(it => {
                  const unit = it.unit || it.material_unit || ''
                  const done = Number(it.received_qty || 0) >= Number(it.quantity || 0)
                  return (
                    <tr key={it.id}>
                      <td>
                        <div className="text-white font-medium">{it.material_name || it.description || '—'}</div>
                        {it.material_name && it.description && it.description !== it.material_name && (
                          <div className="text-xs text-muted">{it.description}</div>
                        )}
                        {!it.material_id && <div className="text-xs text-muted">без материал — не влиза в наличността</div>}
                      </td>
                      <td className="text-right whitespace-nowrap">{num(it.quantity)} {unit}</td>
                      <td className={`text-right whitespace-nowrap ${done ? 'text-green-400' : 'text-muted'}`}>{num(it.received_qty || 0)} {unit}</td>
                      <td className="text-right">
                        <input type="number" min="0" step="any" className="input w-28 text-right ml-auto"
                          value={qty[it.id] ?? ''} onChange={e => setQty(q => ({ ...q, [it.id]: e.target.value }))} />
                      </td>
                    </tr>
                  )
                })}
                {!(po.items || []).length && (
                  <tr><td colSpan={4} className="text-center text-muted py-6">Поръчката няма артикули</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted">Количествата се добавят към наличността в избрания склад. Ако приемете по-малко, поръчката остава „Частично приета“.</p>
          <div className="flex gap-3 justify-end">
            <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Записва...' : '✓ Приеми в склада'}</button>
          </div>
        </form>
      )}
    </Modal>
  )
}

// ─── Supplier Form Modal ──────────────────────────────────────────────────────
function SupplierFormModal({ open, onClose, onSaved, editData }) {
  const blank = { name:'', contact:'', phone:'', email:'', address:'', vat_number:'', notes:'' }
  const [form, setForm] = useState(blank)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) setForm(editData ? {
      name: editData.name || '',
      contact: editData.contact || '',
      phone: editData.phone || '',
      email: editData.email || '',
      address: editData.address || '',
      vat_number: editData.vat_number || '',
      notes: editData.notes || '',
    } : blank)
  }, [open, editData])

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editData) {
        await api.patch(`/suppliers/${editData.id}`, form)
        toast.success('Доставчикът е обновен')
      } else {
        await api.post('/suppliers', form)
        toast.success('Доставчикът е добавен')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={editData ? 'Редактирай доставчик' : 'Нов доставчик'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Наименование *</label>
            <input className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required />
          </div>
          <div>
            <label className="label">Лице за контакт</label>
            <input className="input" value={form.contact} onChange={e=>setForm(f=>({...f,contact:e.target.value}))} />
          </div>
          <div>
            <label className="label">Телефон</label>
            <input className="input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
          </div>
          <div>
            <label className="label">Имейл</label>
            <input type="email" className="input" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
          </div>
          <div>
            <label className="label">ДДС номер</label>
            <input className="input" value={form.vat_number} onChange={e=>setForm(f=>({...f,vat_number:e.target.value}))} placeholder="BG..." />
          </div>
          <div className="col-span-2">
            <label className="label">Адрес</label>
            <input className="input" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} />
          </div>
          <div className="col-span-2">
            <label className="label">Бележки</label>
            <textarea className="input resize-none" rows={2} value={form.notes}
              onChange={e=>setForm(f=>({...f,notes:e.target.value}))} />
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Записва...' : editData ? '✓ Запази' : '+ Добави'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Purchase Order Form Modal ────────────────────────────────────────────────
function POFormModal({ open, onClose, onSaved, suppliers }) {
  const [form, setForm] = useState({ supplier_id:'', expected_date:'', notes:'', items:[] })
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      api.get('/warehouse/materials?limit=500').then(r => setMaterials(r.data)).catch(() => {})
    }
  }, [open])

  const addItem = () => setForm(f => ({
    ...f, items: [...f.items, { material_id:'', description:'', quantity:'', unit:'', unit_price:'' }]
  }))

  const updateItem = (i, field, val) => setForm(f => ({
    ...f, items: f.items.map((it, idx) => idx === i ? { ...it, [field]: val } : it)
  }))

  const total = form.items.reduce((s, it) => s + (Number(it.quantity||0) * Number(it.unit_price||0)), 0)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/suppliers/purchase-orders', form)
      toast.success('Поръчката към доставчик е създадена')
      setForm({ supplier_id:'', expected_date:'', notes:'', items:[] })
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Нова поръчка към доставчик" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Доставчик *</label>
            <select className="select" value={form.supplier_id}
              onChange={e=>setForm(f=>({...f,supplier_id:e.target.value}))} required>
              <option value="">— Изберете</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Очаквана дата</label>
            <input type="date" className="input" value={form.expected_date}
              onChange={e=>setForm(f=>({...f,expected_date:e.target.value}))} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Артикули</label>
            <button type="button" className="btn-secondary text-xs py-1 px-2" onClick={addItem}>+ Добави</button>
          </div>
          {form.items.length === 0 && (
            <div className="text-center py-4 text-muted text-sm border border-dashed border-border rounded-xl">
              Добавете артикули
            </div>
          )}
          <div className="space-y-2">
            {form.items.map((it, i) => (
              <div key={i} className="bg-bg border border-border rounded-xl p-3">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-3">
                    <select className="select text-xs" value={it.material_id}
                      onChange={e => {
                        const mat = materials.find(m => m.id === e.target.value)
                        updateItem(i, 'material_id', e.target.value)
                        if (mat) {
                          updateItem(i, 'description', mat.name)
                          updateItem(i, 'unit', mat.unit)
                          updateItem(i, 'unit_price', mat.price_per_unit || '')
                        }
                      }}>
                      <option value="">— Материал</option>
                      {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <input className="input text-xs" placeholder="Описание" value={it.description}
                      onChange={e=>updateItem(i,'description',e.target.value)} />
                  </div>
                  <div className="col-span-1">
                    <input type="number" className="input text-xs" placeholder="Кол." value={it.quantity}
                      onChange={e=>updateItem(i,'quantity',e.target.value)} />
                  </div>
                  <div className="col-span-1">
                    <input className="input text-xs" placeholder="Ед." value={it.unit}
                      onChange={e=>updateItem(i,'unit',e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <input type="number" className="input text-xs" placeholder="Цена €" step="0.01" value={it.unit_price}
                      onChange={e=>updateItem(i,'unit_price',e.target.value)} />
                  </div>
                  <div className="col-span-1 text-right text-xs text-muted flex items-center justify-end">
                    {it.quantity && it.unit_price ? `${(Number(it.quantity)*Number(it.unit_price)).toFixed(2)}€` : '—'}
                  </div>
                  <div className="col-span-1 flex items-center justify-end">
                    <button type="button" onClick={()=>setForm(f=>({...f,items:f.items.filter((_,idx)=>idx!==i)}))}
                      className="text-danger hover:text-red-400 text-sm">✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {form.items.length > 0 && (
            <div className="text-right mt-2 font-semibold text-white text-sm">
              Общо: {total.toFixed(2)} €
            </div>
          )}
        </div>

        <div>
          <label className="label">Бележки</label>
          <textarea className="input resize-none" rows={2} value={form.notes}
            onChange={e=>setForm(f=>({...f,notes:e.target.value}))} />
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-primary" disabled={loading || !form.supplier_id}>
            {loading ? 'Записва...' : '+ Създай поръчката'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Suppliers() {
  const { isOffice } = useAuth()
  const canEditSuppliers = isOffice // backend: suppliers POST/PATCH are admin/office only
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab]               = useState('suppliers')
  const [receivePO, setReceivePO]   = useState(null)
  const [suppliers, setSuppliers]   = useState([])
  const [pos, setPOs]               = useState([])
  const [loading, setLoading]       = useState(true)
  const [formOpen, setFormOpen]     = useState(false)
  const [poFormOpen, setPOFormOpen] = useState(false)
  const [editSupplier, setEditSup]  = useState(null)

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const [sRes, poRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/suppliers/purchase-orders'),
      ])
      setSuppliers(sRes.data)
      setPOs(poRes.data)
    } catch { toast.error('Грешка') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchSuppliers() }, [])

  // Global "+ Нов": ?new=1 → new purchase order, ?new=supplier → new supplier
  const newParam = searchParams.get('new')
  useEffect(() => {
    const n = newParam
    if (!n) return
    if (n === 'supplier') {
      if (canEditSuppliers) { setEditSup(null); setFormOpen(true) }
    } else { setTab('pos'); setPOFormOpen(true) }
    const next = new URLSearchParams(searchParams)
    next.delete('new')
    setSearchParams(next, { replace: true })
  }, [newParam])

  const openEdit = (s) => { setEditSup(s); setFormOpen(true) }

  const updatePOStatus = async (id, status) => {
    try {
      await api.patch(`/suppliers/purchase-orders/${id}`, { status })
      toast.success('Статусът е обновен')
      fetchSuppliers()
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Доставчици</h1>
          <p className="text-muted text-sm mt-1">{suppliers.length} доставчика · {pos.length} поръчки</p>
        </div>
        <div className="flex gap-2">
          {tab === 'pos' && (
            <button className="btn-primary" onClick={() => setPOFormOpen(true)}>+ Нова поръчка към доставчик</button>
          )}
          {canEditSuppliers && (
            <button className="btn-secondary" onClick={() => { setEditSup(null); setFormOpen(true) }}>+ Нов доставчик</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-1 mb-6">
        {[{ id:'suppliers',label:'Доставчици' },{ id:'pos',label:'Поръчки към доставчици' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-16 text-muted">Зарежда се…</div> : (
        <>
          {/* Suppliers tab */}
          {tab === 'suppliers' && (
            suppliers.length === 0 ? (
              <div className="card text-center py-16">
                <div className="text-4xl mb-3">🏭</div>
                <p className="text-white font-semibold mb-1">Няма доставчици</p>
                {canEditSuppliers && <button className="btn-primary mt-3" onClick={() => { setEditSup(null); setFormOpen(true) }}>+ Нов доставчик</button>}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suppliers.map(s => (
                  <div key={s.id} className="card hover:border-accent/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-white">{s.name}</h3>
                        {s.contact && <p className="text-muted text-xs mt-0.5">👤 {s.contact}</p>}
                      </div>
                      {canEditSuppliers && <button className="btn-ghost text-xs py-1 px-2" onClick={() => openEdit(s)}>✏️</button>}
                    </div>
                    <div className="space-y-1.5 text-sm">
                      {s.phone && <p className="text-muted">📞 {s.phone}</p>}
                      {s.email && <p className="text-muted">✉️ {s.email}</p>}
                      {s.vat_number && <p className="text-muted">📋 {s.vat_number}</p>}
                    </div>
                    <div className="border-t border-border mt-3 pt-3 flex justify-between text-xs text-muted">
                      <span>{s.po_count} поръчки</span>
                      <span className="font-medium text-white">{Number(s.total_spent).toFixed(0)} € похарчено</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* POs tab */}
          {tab === 'pos' && (
            pos.length === 0 ? (
              <div className="card text-center py-16">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-white font-semibold mb-1">Няма поръчки към доставчици</p>
                <button className="btn-primary mt-3" onClick={() => setPOFormOpen(true)}>+ Нова поръчка към доставчик</button>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Номер</th>
                      <th>Доставчик</th>
                      <th>Статус</th>
                      <th>Артикули</th>
                      <th>Сума</th>
                      <th>Очаквана дата</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pos.map(po => (
                      <tr key={po.id}>
                        <td className="font-mono font-medium text-white">{po.po_number}</td>
                        <td>{po.supplier_name}</td>
                        <td>
                          <span className={`badge ${PO_STATUS[po.status]?.color}`}>
                            {PO_STATUS[po.status]?.label || po.status}
                          </span>
                        </td>
                        <td className="text-muted">{po.item_count}</td>
                        <td className="font-medium text-white">{Number(po.total_amount).toFixed(2)} €</td>
                        <td className={`text-sm ${po.expected_date && String(po.expected_date).slice(0, 10) < todayStr() && OPEN_PO.includes(po.status) ? 'text-danger' : 'text-gray-300'}`}>
                          {fmt(po.expected_date)}
                        </td>
                        <td>
                          <div className="flex gap-1.5">
                            {po.status === 'DRAFT' && (
                              <button className="btn-ghost text-xs py-1 px-2 text-blue-400"
                                onClick={() => updatePOStatus(po.id, 'SENT')}>Изпрати</button>
                            )}
                            {OPEN_PO.includes(po.status) && (
                              <button className="btn-ghost text-xs py-1 px-2 text-green-400"
                                onClick={() => setReceivePO(po.id)}>📥 Приеми стоката</button>
                            )}
                            {['DRAFT','SENT'].includes(po.status) && (
                              <button className="btn-ghost text-xs py-1 px-2 text-danger"
                                onClick={() => updatePOStatus(po.id, 'CANCELLED')}>Откажи</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </>
      )}

      <SupplierFormModal
        open={formOpen} onClose={() => setFormOpen(false)}
        onSaved={fetchSuppliers} editData={editSupplier}
      />
      <POFormModal
        open={poFormOpen} onClose={() => setPOFormOpen(false)}
        onSaved={fetchSuppliers} suppliers={suppliers}
      />
      <ReceiveModal poId={receivePO} onClose={() => setReceivePO(null)} onSaved={fetchSuppliers} />
    </div>
  )
}
