import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Modal, { ConfirmDialog } from '../components/ui/Modal'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'
import { bg } from 'date-fns/locale'

const STATUS_LABELS = {
  DRAFT:    { label: 'Чернова',   color: 'bg-gray-500/20 text-gray-400' },
  SENT:     { label: 'Изпратена', color: 'bg-blue-500/20 text-blue-400' },
  ACCEPTED: { label: 'Приета',    color: 'bg-green-500/20 text-green-400' },
  REJECTED: { label: 'Отказана',  color: 'bg-red-500/20 text-red-400' },
  EXPIRED:  { label: 'Изтекла',   color: 'bg-gray-500/20 text-gray-500' },
}

function QuoteStatusBadge({ status }) {
  const s = STATUS_LABELS[status] || { label: status, color: 'bg-gray-500/20 text-gray-400' }
  return <span className={`badge ${s.color}`}>{s.label}</span>
}

function fmt(d) {
  if (!d) return '—'
  try { return format(parseISO(d), 'd MMM yyyy', { locale: bg }) } catch { return d }
}

// ─── Quote Form Modal ─────────────────────────────────────────────────────────
function QuoteFormModal({ open, onClose, onSaved, clients, editData }) {
  const isEdit = !!editData
  const blank = { client_id: '', valid_until: '', notes: '', items: [] }
  const [form, setForm] = useState(blank)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(editData ? {
        client_id: editData.client_id || '',
        valid_until: editData.valid_until?.slice(0,10) || '',
        notes: editData.notes || '',
        items: editData.items || [],
      } : blank)
    }
  }, [open, editData])

  const addItem = () => setForm(f => ({
    ...f, items: [...f.items, { product_desc: '', width: '', height: '', qty: 1, unit_price: '', notes: '' }]
  }))

  const updateItem = (i, field, val) => setForm(f => ({
    ...f, items: f.items.map((it, idx) => idx === i ? { ...it, [field]: val } : it)
  }))

  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))

  const total = form.items.reduce((s, it) => s + (Number(it.qty || 1) * Number(it.unit_price || 0)), 0)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/quotations/${editData.id}`, form)
        toast.success('Офертата е обновена')
      } else {
        await api.post('/quotations', form)
        toast.success('Офертата е създадена')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Редактирай оферта' : 'Нова оферта'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Клиент *</label>
            <select className="select" value={form.client_id} onChange={e => setForm(f => ({...f,client_id:e.target.value}))} required>
              <option value="">— Изберете клиент</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Валидна до</label>
            <input type="date" className="input" value={form.valid_until}
              onChange={e => setForm(f => ({...f,valid_until:e.target.value}))} />
          </div>
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Позиции</label>
            <button type="button" className="btn-secondary text-xs py-1 px-2" onClick={addItem}>+ Добави позиция</button>
          </div>
          {form.items.length === 0 && (
            <div className="text-muted text-sm text-center py-4 border border-dashed border-border rounded-xl">
              Добавете позиции
            </div>
          )}
          <div className="space-y-2">
            {form.items.map((it, i) => (
              <div key={i} className="bg-bg border border-border rounded-xl p-3">
                <div className="grid grid-cols-12 gap-2 mb-2">
                  <div className="col-span-4">
                    <input className="input text-xs" placeholder="Описание…" value={it.product_desc}
                      onChange={e => updateItem(i,'product_desc',e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <input type="number" className="input text-xs" placeholder="Ш (мм)" value={it.width}
                      onChange={e => updateItem(i,'width',e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <input type="number" className="input text-xs" placeholder="В (мм)" value={it.height}
                      onChange={e => updateItem(i,'height',e.target.value)} />
                  </div>
                  <div className="col-span-1">
                    <input type="number" className="input text-xs" placeholder="Кол." min="1" value={it.qty}
                      onChange={e => updateItem(i,'qty',e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <input type="number" className="input text-xs" placeholder="Цена €" step="0.01" value={it.unit_price}
                      onChange={e => updateItem(i,'unit_price',e.target.value)} />
                  </div>
                  <div className="col-span-1 flex items-center justify-end">
                    <button type="button" onClick={() => removeItem(i)} className="text-danger hover:text-red-400 text-sm">✕</button>
                  </div>
                </div>
                <input className="input text-xs" placeholder="Бележка към позицията…" value={it.notes || ''}
                  onChange={e => updateItem(i,'notes',e.target.value)} />
              </div>
            ))}
          </div>
          {form.items.length > 0 && (
            <div className="text-right mt-2 text-sm font-semibold text-white">
              Общо: {total.toFixed(2)} €
            </div>
          )}
        </div>

        <div>
          <label className="label">Бележки</label>
          <textarea className="input resize-none" rows={3} value={form.notes}
            onChange={e => setForm(f => ({...f,notes:e.target.value}))} placeholder="Условия, забележки…" />
        </div>

        <div className="flex gap-3 justify-end pt-1">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Записва...' : isEdit ? '✓ Запази промените' : '+ Създай оферта'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Convert to Order Modal ───────────────────────────────────────────────────
function ConvertModal({ open, onClose, quote, onConverted }) {
  const [form, setForm] = useState({ order_type: 'стъклопакет', deadline: '', is_urgent: false, delivery_address: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleConvert = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post(`/quotations/${quote.id}/convert`, form)
      toast.success(`Офертата е конвертирана → Поръчка ${data.order_number}`)
      onConverted()
      onClose()
      navigate(`/orders/${data.order_id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Конвертирай към поръчка — ${quote?.quote_number}`} size="md">
      <div className="mb-4 p-3 bg-accent/10 rounded-xl text-sm text-accent">
        Ще бъде създадена нова поръчка с данните от офертата.
      </div>
      <form onSubmit={handleConvert} className="space-y-4">
        <div>
          <label className="label">Тип поръчка</label>
          <select className="select" value={form.order_type} onChange={e => setForm(f => ({...f,order_type:e.target.value}))}>
            <option value="стъклопакет">Стъклопакет</option>
            <option value="единично_стъкло">Единично стъкло</option>
            <option value="смесена">Смесена</option>
          </select>
        </div>
        <div>
          <label className="label">Краен срок</label>
          <input type="date" className="input" value={form.deadline}
            onChange={e => setForm(f => ({...f,deadline:e.target.value}))} />
        </div>
        <div>
          <label className="label">Адрес за доставка</label>
          <input className="input" value={form.delivery_address} placeholder="Незадължително…"
            onChange={e => setForm(f => ({...f,delivery_address:e.target.value}))} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="accent-accent" checked={form.is_urgent}
            onChange={e => setForm(f => ({...f,is_urgent:e.target.checked}))} />
          <span className="text-sm text-gray-300">Спешна поръчка</span>
        </label>
        <div className="flex gap-3 justify-end pt-1">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Конвертира...' : '✓ Конвертирай в поръчка'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Print Quote ──────────────────────────────────────────────────────────────
function printQuote(q) {
  const total = (q.items || []).reduce((s, it) => s + (Number(it.qty || 1) * Number(it.unit_price || 0)), 0)
  const html = `<!DOCTYPE html><html lang="bg"><head><meta charset="UTF-8">
<title>Оферта ${q.quote_number}</title>
<style>
* { margin:0;padding:0;box-sizing:border-box; }
body { font-family:Arial,sans-serif;font-size:12px;color:#111;padding:20mm;background:white; }
.header { display:flex;justify-content:space-between;margin-bottom:20px; }
.logo { font-size:22px;font-weight:900; }
h2 { font-size:13px;font-weight:bold;margin:14px 0 6px;border-bottom:1.5px solid #111;padding-bottom:3px; }
table { width:100%;border-collapse:collapse;font-size:11px; }
th { background:#f3f4f6;padding:5px 8px;text-align:left;border:1px solid #d1d5db;font-size:10px;text-transform:uppercase; }
td { padding:5px 8px;border:1px solid #d1d5db; }
.total { font-weight:bold;font-size:14px;text-align:right;margin-top:10px; }
.notes { border:1px solid #d1d5db;border-radius:4px;padding:8px;margin-top:10px;min-height:40px; }
.sig { display:flex;gap:30px;margin-top:24px; }
.sig-box { flex:1;border-top:1px solid #999;padding-top:4px;font-size:10px;color:#666; }
@media print { button { display:none!important; } }
</style></head><body>
<div class="header">
  <div><div class="logo">🏭 ЕСПЕХО ООД</div><div style="color:#666;font-size:11px;">Оферта</div></div>
  <div style="text-align:right">
    <div style="font-size:18px;font-weight:bold;">${q.quote_number}</div>
    <div style="font-size:11px;color:#555">Дата: ${format(new Date(), 'd MMM yyyy', { locale: bg })}</div>
    ${q.valid_until ? `<div style="font-size:11px;color:#555">Валидна до: ${fmt(q.valid_until)}</div>` : ''}
  </div>
</div>
<h2>Клиент</h2>
<p><strong>${q.client_name}</strong></p>
${q.client_phone ? `<p>${q.client_phone}</p>` : ''}
${q.client_email ? `<p>${q.client_email}</p>` : ''}
<h2>Позиции</h2>
<table>
<thead><tr><th>#</th><th>Описание</th><th>Ш</th><th>В</th><th>Кол.</th><th>Ед. цена</th><th>Сума</th></tr></thead>
<tbody>
${(q.items || []).map((it, i) => `
<tr>
  <td>${i+1}</td><td>${it.product_desc || '—'}</td><td>${it.width || '—'}</td><td>${it.height || '—'}</td>
  <td>${it.qty}</td><td>${it.unit_price ? Number(it.unit_price).toFixed(2)+' €' : '—'}</td>
  <td>${it.unit_price && it.qty ? (Number(it.unit_price)*Number(it.qty)).toFixed(2)+' €' : '—'}</td>
</tr>`).join('')}
</tbody>
</table>
<div class="total">Общо: <strong>${total.toFixed(2)} €</strong></div>
${q.notes ? `<div class="notes"><strong style="font-size:10px;text-transform:uppercase;color:#666;">Бележки:</strong><div style="margin-top:4px;">${q.notes}</div></div>` : ''}
<div class="sig">
  <div class="sig-box">ЕСПЕХО ООД: _________________________</div>
  <div class="sig-box">Клиент: _________________________</div>
</div>
<div style="text-align:center;margin-top:14px;">
  <button onclick="window.print()" style="padding:8px 20px;background:#3b82f6;color:white;border:none;border-radius:6px;font-size:13px;cursor:pointer;">🖨️ Принтирай</button>
</div>
</body></html>`
  const win = window.open('', '_blank', 'width=900,height=700')
  win.document.write(html)
  win.document.close()
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Quotations() {
  const [quotes, setQuotes]         = useState([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [clients, setClients]       = useState([])
  const [filter, setFilter]         = useState({ status: '', search: '' })
  const [formOpen, setFormOpen]     = useState(false)
  const [editData, setEditData]     = useState(null)
  const [convertQ, setConvertQ]     = useState(null)
  const [deleteId, setDeleteId]     = useState(null)

  const fetchQuotes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.status) params.set('status', filter.status)
      if (filter.search) params.set('search', filter.search)
      const { data } = await api.get(`/quotations?${params}`)
      setQuotes(data.data)
      setTotal(data.total)
    } catch { toast.error('Грешка при зареждане') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    api.get('/clients?limit=500').then(r => setClients(r.data.data || r.data)).catch(() => {})
    fetchQuotes()
  }, [filter])

  const openNew = () => { setEditData(null); setFormOpen(true) }
  const openEdit = (q) => {
    api.get(`/quotations/${q.id}`).then(r => { setEditData(r.data); setFormOpen(true) }).catch(() => toast.error('Грешка'))
  }

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/quotations/${id}`, { status })
      toast.success('Статусът е обновен')
      fetchQuotes()
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Оферти</h1>
          <p className="text-muted text-sm mt-1">{total} оферти общо</p>
        </div>
        <button className="btn-primary" onClick={openNew}>+ Нова оферта</button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input className="input max-w-xs" placeholder="Търси клиент или номер…"
          value={filter.search} onChange={e => setFilter(f => ({...f,search:e.target.value}))} />
        <select className="select w-44" value={filter.status} onChange={e => setFilter(f => ({...f,status:e.target.value}))}>
          <option value="">Всички статуси</option>
          {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-muted">Зарежда се…</div>
      ) : quotes.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">📄</div>
          <p className="text-white font-semibold mb-1">Няма оферти</p>
          <p className="text-muted text-sm mb-4">Създайте първата оферта за клиент</p>
          <button className="btn-primary" onClick={openNew}>+ Нова оферта</button>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Номер</th>
                <th>Клиент</th>
                <th>Статус</th>
                <th>Позиции</th>
                <th>Обща сума</th>
                <th>Валидна до</th>
                <th>Дата</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => (
                <tr key={q.id}>
                  <td className="font-mono font-medium text-white">{q.quote_number}</td>
                  <td>
                    <p className="text-white font-medium">{q.client_name}</p>
                    <p className="text-muted text-xs">{q.client_phone}</p>
                  </td>
                  <td><QuoteStatusBadge status={q.status} /></td>
                  <td className="text-muted">{q.items_count || '—'}</td>
                  <td className="font-medium text-white">{Number(q.total_price).toFixed(2)} €</td>
                  <td className={`text-sm ${q.valid_until && new Date(q.valid_until) < new Date() && q.status === 'SENT' ? 'text-danger' : 'text-gray-300'}`}>
                    {fmt(q.valid_until)}
                  </td>
                  <td className="text-muted text-xs">{fmt(q.created_at)}</td>
                  <td>
                    <div className="flex gap-1.5 flex-wrap">
                      <button className="btn-ghost text-xs py-1 px-2" onClick={() => openEdit(q)}
                        disabled={!!q.converted_to} title="Редактирай">✏️</button>
                      <button className="btn-ghost text-xs py-1 px-2" onClick={() => printQuote(q)} title="Принтирай">🖨️</button>
                      {q.status === 'DRAFT' && (
                        <button className="btn-ghost text-xs py-1 px-2 text-blue-400"
                          onClick={() => updateStatus(q.id, 'SENT')}>Изпрати</button>
                      )}
                      {['DRAFT','SENT'].includes(q.status) && !q.converted_to && (
                        <button className="btn-ghost text-xs py-1 px-2 text-green-400"
                          onClick={() => setConvertQ(q)}>→ Поръчка</button>
                      )}
                      {['DRAFT','SENT'].includes(q.status) && (
                        <button className="btn-ghost text-xs py-1 px-2 text-danger"
                          onClick={() => updateStatus(q.id, 'REJECTED')}>Откажи</button>
                      )}
                      {q.converted_to && (
                        <span className="text-xs text-green-400 px-2">✓ Конвертирана</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <QuoteFormModal
        open={formOpen} onClose={() => setFormOpen(false)}
        onSaved={fetchQuotes} clients={clients} editData={editData}
      />

      {convertQ && (
        <ConvertModal
          open={!!convertQ} onClose={() => setConvertQ(null)}
          quote={convertQ} onConverted={fetchQuotes}
        />
      )}
    </div>
  )
}
