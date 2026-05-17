import { useState, useEffect } from 'react'
import api from '../api/axios'
import Modal from '../components/ui/Modal'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'
import { bg } from 'date-fns/locale'

function fmt(d) {
  if (!d) return '—'
  try { return format(parseISO(d), 'd MMM yyyy', { locale: bg }) } catch { return d }
}

const PO_STATUS = {
  DRAFT:     { label: 'Чернова',   color: 'bg-gray-500/20 text-gray-400' },
  SENT:      { label: 'Изпратена', color: 'bg-blue-500/20 text-blue-400' },
  RECEIVED:  { label: 'Получена',  color: 'bg-green-500/20 text-green-400' },
  CANCELLED: { label: 'Отказана',  color: 'bg-red-500/20 text-red-400' },
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
      toast.success('Поръчката е създадена')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Нова поръчка за доставчик (PO)" size="xl">
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
            {loading ? 'Записва...' : '+ Създай PO'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Suppliers() {
  const [tab, setTab]               = useState('suppliers')
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
            <button className="btn-primary" onClick={() => setPOFormOpen(true)}>+ Нова PO</button>
          )}
          <button className="btn-secondary" onClick={() => { setEditSup(null); setFormOpen(true) }}>+ Нов доставчик</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-1 mb-6">
        {[{ id:'suppliers',label:'Доставчици' },{ id:'pos',label:'Поръчки (PO)' }].map(t => (
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
                <button className="btn-primary mt-3" onClick={() => setFormOpen(true)}>+ Нов доставчик</button>
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
                      <button className="btn-ghost text-xs py-1 px-2" onClick={() => openEdit(s)}>✏️</button>
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
                <button className="btn-primary mt-3" onClick={() => setPOFormOpen(true)}>+ Нова PO</button>
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
                        <td className={`text-sm ${po.expected_date && new Date(po.expected_date) < new Date() && po.status !== 'RECEIVED' ? 'text-danger' : 'text-gray-300'}`}>
                          {fmt(po.expected_date)}
                        </td>
                        <td>
                          <div className="flex gap-1.5">
                            {po.status === 'DRAFT' && (
                              <button className="btn-ghost text-xs py-1 px-2 text-blue-400"
                                onClick={() => updatePOStatus(po.id, 'SENT')}>Изпрати</button>
                            )}
                            {po.status === 'SENT' && (
                              <button className="btn-ghost text-xs py-1 px-2 text-green-400"
                                onClick={() => updatePOStatus(po.id, 'RECEIVED')}>✓ Получи</button>
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
    </div>
  )
}
