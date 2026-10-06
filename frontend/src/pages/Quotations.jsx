import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import Modal from '../components/ui/Modal'
import ClientPicker from '../components/ui/ClientPicker'
import useSettings from '../hooks/useSettings'
import { priceLine, sumLines } from '../utils/pricing'
import { TYPE_LABELS, UOM_LABELS, UOM_HINTS, eur, num, dateBg, todayStr } from '../utils/labels'
import toast from 'react-hot-toast'
import { Check, FileText, Pencil, Printer, X } from 'lucide-react'

const STATUS_LABELS = {
  DRAFT:    { label: 'Чернова',   color: 'bg-gray-500/20 text-gray-400' },
  SENT:     { label: 'Изпратена', color: 'bg-blue-500/20 text-blue-400' },
  ACCEPTED: { label: 'Приета',    color: 'bg-green-500/20 text-green-400' },
  REJECTED: { label: 'Отказана',  color: 'bg-red-500/20 text-red-400' },
  EXPIRED:  { label: 'Изтекла',   color: 'bg-gray-500/20 text-gray-500' },
}
// „Приета“ is set only by „→ Поръчка“ (convert), never by hand
const EDITABLE_STATUSES = ['DRAFT', 'SENT', 'REJECTED', 'EXPIRED']
// Line kinds: decide the minimum billable area and the production stages after conversion
const LINE_TYPES = ['стъклопакет', 'единично_стъкло', 'друго']
const STAGE_TYPES = ['стъклопакет', 'единично_стъкло', 'смесена']
const UOM_UNITS = { m2: 'м²', lm: 'л.м.', pcs: 'бр.', fixed: '' }

const emptyLine = type => ({ product_type: type || 'стъклопакет', product_desc: '', width: '', height: '', qty: 1, uom: 'm2', unit_price: '', notes: '' })

function QuoteStatusBadge({ status }) {
  const s = STATUS_LABELS[status] || { label: status, color: 'bg-gray-500/20 text-gray-400' }
  return <span className={`badge ${s.color}`}>{s.label}</span>
}

const fmt = d => dateBg(d)

// Order type the server will pick from the quote lines (same rule as the convert endpoint)
function typeFromItems(items = []) {
  const types = [...new Set(items.map(it => it.product_type).filter(t => STAGE_TYPES.includes(t)))]
  return types.length === 1 ? types[0] : types.length > 1 ? 'смесена' : 'стъклопакет'
}

// ─── Quote Form Modal ─────────────────────────────────────────────────────────
function QuoteFormModal({ open, onClose, onSaved, editData }) {
  const settings = useSettings()
  const isEdit = !!editData
  const blank = () => ({ client: null, valid_until: '', notes: '', status: 'DRAFT', items: [emptyLine()] })
  const [form, setForm] = useState(blank)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(editData ? {
      client: editData.client_id ? { id: editData.client_id, name: editData.client_name, phone: editData.client_phone } : null,
      valid_until: editData.valid_until ? String(editData.valid_until).slice(0, 10) : '',
      notes: editData.notes || '',
      status: EDITABLE_STATUSES.includes(editData.status) ? editData.status : 'DRAFT',
      // Lines saved before units existed were priced per piece — keep that meaning
      items: (editData.items || []).map(it => ({ ...it, uom: it.uom || 'pcs', notes: it.notes || '' })),
    } : blank())
  }, [open, editData])

  const set = patch => setForm(f => ({ ...f, ...patch }))
  const setItem = (i, patch) => setForm(f => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, ...patch } : it) }))
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, emptyLine(f.items[f.items.length - 1]?.product_type)] }))
  const removeItem = i => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))

  const total = sumLines(form.items, settings)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.client?.id) return toast.error('Изберете клиент')
    const items = form.items.filter(it => String(it.product_desc || '').trim())
    if (!items.length) return toast.error('Добавете поне една позиция с описание')
    const payload = {
      client_id: form.client.id,
      valid_until: form.valid_until || null,
      notes: form.notes,
      items: items.map(({ product_type, product_desc, width, height, qty, uom, unit_price, notes }) =>
        ({ product_type, product_desc, width, height, qty, uom, unit_price, notes })),
    }
    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/quotations/${editData.id}`, { ...payload, status: form.status })
        toast.success('Офертата е обновена')
      } else {
        await api.post('/quotations', payload)
        toast.success('Офертата е създадена')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? `Редактирай оферта ${editData.quote_number || ''}` : 'Нова оферта'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="label">Клиент *</label>
            <ClientPicker value={form.client?.id} selected={form.client} onChange={c => set({ client: c })} />
          </div>
          <div>
            <label className="label">Валидна до</label>
            <input type="date" className="input" value={form.valid_until} onChange={e => set({ valid_until: e.target.value })} />
          </div>
          {isEdit && (
            <div>
              <label className="label">Статус</label>
              <select className="select" value={form.status} onChange={e => set({ status: e.target.value })}>
                {EDITABLE_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s].label}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Lines */}
        <section>
          <p className="label mb-0">Позиции</p>
          <p className="text-xs text-muted">Размерите са в мм. Цените са с ДДС. Сумата се смята сама — включително минималната площ.</p>
          <div className="space-y-3 mt-2">
            {form.items.length === 0 && (
              <div className="text-muted text-sm text-center py-4 border border-dashed border-border rounded-xl">Добавете позиции</div>
            )}
            {form.items.map((item, i) => {
              const p = priceLine(item, settings)
              const noSize = item.uom === 'pcs' || item.uom === 'fixed'
              return (
                <div key={i} className="p-3 rounded-xl border border-border bg-bg/40">
                  <div className="flex gap-2 items-start">
                    <span className="text-xs text-muted w-5 pt-2.5 text-right flex-shrink-0">{i + 1}.</span>
                    <div className="flex-1 grid grid-cols-6 md:grid-cols-12 gap-2">
                      <select className="select text-sm col-span-6 md:col-span-2 px-2" value={item.product_type || ''} title="Вид — определя минималната площ"
                        onChange={e => setItem(i, { product_type: e.target.value })}>
                        {!item.product_type && <option value="">— вид —</option>}
                        {LINE_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>)}
                      </select>
                      <input className="input text-sm col-span-6 md:col-span-4" placeholder="Описание, напр. БЯЛО 4ММ/БЯЛО 4ММ"
                        value={item.product_desc} onChange={e => setItem(i, { product_desc: e.target.value })} />
                      <input className="input text-sm text-center px-1 col-span-2 md:col-span-1" placeholder="Ш мм" type="number" min="0"
                        aria-label="Ширина мм" value={item.width ?? ''} disabled={noSize} onChange={e => setItem(i, { width: e.target.value })} />
                      <input className="input text-sm text-center px-1 col-span-2 md:col-span-1" placeholder="В мм" type="number" min="0"
                        aria-label="Височина мм" value={item.height ?? ''} disabled={noSize} onChange={e => setItem(i, { height: e.target.value })} />
                      <input className="input text-sm text-center px-1 col-span-2 md:col-span-1" placeholder="Бр." type="number" min="0" step="any"
                        aria-label="Брой" value={item.qty ?? ''} disabled={item.uom === 'fixed'} onChange={e => setItem(i, { qty: e.target.value })} />
                      <select className="select text-sm col-span-3 md:col-span-1 px-2" value={item.uom} title={UOM_HINTS[item.uom]}
                        onChange={e => setItem(i, { uom: e.target.value })}>
                        {Object.entries(UOM_LABELS).map(([k, v]) => <option key={k} value={k} title={UOM_HINTS[k]}>{v}</option>)}
                      </select>
                      <input className="input text-sm text-right col-span-3 md:col-span-2" placeholder="Цена" type="number" step="0.01" min="0"
                        aria-label="Цена" value={item.unit_price ?? ''} onChange={e => setItem(i, { unit_price: e.target.value })} />
                    </div>
                    <button type="button" className="text-muted hover:text-danger p-2 flex-shrink-0" title="Премахни реда" onClick={() => removeItem(i)}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5 pl-7 pr-9">
                    <input className="input text-xs py-1 flex-1 min-w-[12rem]" placeholder="Бележка към позицията…" value={item.notes || ''}
                      onChange={e => setItem(i, { notes: e.target.value })} />
                    <p className="text-xs text-muted ml-auto">
                      {item.uom === 'm2' && p.area !== null && (
                        <>{num(p.area, 3)} м²{p.minApplied && <span className="text-warning" title="Под минималната площ — таксува се минимумът"> (мин. площ)</span>}
                          {(+item.qty || 1) !== 1 && <> × {num(item.qty)}</>} · </>
                      )}
                      {item.uom === 'lm' && p.billed ? <>{num(p.billed, 2)} л.м. · </> : null}
                      <span className={p.total ? 'text-white font-semibold' : ''}>{p.total ? eur(p.total) : '—'}</span>
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
          <button type="button" className="btn-ghost text-sm mt-2" onClick={addItem}>+ Добави ред</button>
        </section>

        <div>
          <label className="label">Бележки</label>
          <textarea className="input resize-none" rows={3} value={form.notes}
            onChange={e => set({ notes: e.target.value })} placeholder="Условия, срок за изпълнение, забележки…" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-4 border-t border-border">
          <p className="text-2xl font-bold text-accent">{eur(total, { dash: false })} <span className="text-xs font-normal text-muted">с ДДС</span></p>
          <div className="flex gap-3 justify-end">
            <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Записва…' : isEdit ? <><Check className="w-4 h-4" strokeWidth={2} />Запази промените</> : '+ Създай оферта'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

// ─── Convert to Order Modal ───────────────────────────────────────────────────
function ConvertModal({ open, onClose, quote, onConverted }) {
  const [form, setForm] = useState({ order_type: '', deadline: '', is_urgent: false, delivery_address: '' })
  const [items, setItems] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open || !quote) return
    setForm({ order_type: '', deadline: '', is_urgent: false, delivery_address: '' })
    api.get(`/quotations/${quote.id}`).then(r => setItems(r.data.items || [])).catch(() => setItems([]))
  }, [open, quote?.id])

  const autoType = typeFromItems(items || [])

  const handleConvert = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const body = { deadline: form.deadline || null, is_urgent: form.is_urgent, delivery_address: form.delivery_address || null }
      if (form.order_type) body.order_type = form.order_type // empty = server decides from the lines
      const { data } = await api.post(`/quotations/${quote.id}/convert`, body)
      toast.success(`Офертата е превърната в поръчка #${data.order_number}`)
      onConverted()
      onClose()
      navigate(`/orders/${data.order_id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Създай поръчка от оферта ${quote?.quote_number || ''}`} size="md">
      <div className="mb-4 p-3 bg-accent/10 rounded-xl text-sm text-accent">
        Ще бъде създадена нова поръчка с позициите и цената от офертата. Офертата става „Приета“.
      </div>
      <form onSubmit={handleConvert} className="space-y-4">
        <div>
          <label className="label">Вид поръчка</label>
          <select className="select" value={form.order_type} onChange={e => setForm(f => ({ ...f, order_type: e.target.value }))}>
            <option value="">Автоматично по позициите{items ? ` (${TYPE_LABELS[autoType]})` : ''}</option>
            {STAGE_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>
          <p className="text-xs text-muted mt-1">Определя етапите в цеха.</p>
        </div>
        <div>
          <label className="label">Краен срок</label>
          <input type="date" className="input" value={form.deadline} min={todayStr()}
            onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
        </div>
        <div>
          <label className="label">Адрес за доставка</label>
          <input className="input" value={form.delivery_address} placeholder="Незадължително…"
            onChange={e => setForm(f => ({ ...f, delivery_address: e.target.value }))} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="accent-accent" checked={form.is_urgent}
            onChange={e => setForm(f => ({ ...f, is_urgent: e.target.checked }))} />
          <span className="text-sm text-gray-300">Спешна поръчка</span>
        </label>
        <div className="flex gap-3 justify-end pt-1">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Създава…' : <><Check className="w-4 h-4" strokeWidth={2} />Създай поръчка</>}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Print Quote ──────────────────────────────────────────────────────────────
// Everything typed by users goes through esc() before it lands in the print HTML
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const money = v => (v === null || v === undefined || v === '' ? '—' : `${Number(v).toFixed(2)} €`)

function printQuoteHtml(q, settings) {
  const items = q.items || []
  const lines = items.map(it => {
    const p = priceLine({ ...it, uom: it.uom || 'pcs' }, settings)
    return { it, uom: it.uom || 'pcs', p, total: it.line_total ?? p.total }
  })
  const total = q.total_price ?? lines.reduce((s, l) => s + (Number(l.total) || 0), 0)
  return `<!DOCTYPE html><html lang="bg"><head><meta charset="UTF-8">
<title>Оферта ${esc(q.quote_number)}</title>
<style>
* { margin:0;padding:0;box-sizing:border-box; }
body { font-family:Arial,sans-serif;font-size:12px;color:#111;padding:20mm;background:white; }
.header { display:flex;justify-content:space-between;margin-bottom:20px; }
.logo { font-size:22px;font-weight:900; }
h2 { font-size:13px;font-weight:bold;margin:14px 0 6px;border-bottom:1.5px solid #111;padding-bottom:3px; }
table { width:100%;border-collapse:collapse;font-size:11px; }
th { background:#f3f4f6;padding:5px 8px;text-align:left;border:1px solid #d1d5db;font-size:10px;text-transform:uppercase; }
td { padding:5px 8px;border:1px solid #d1d5db; }
td.r, th.r { text-align:right; }
.sub { color:#666;font-size:10px; }
.total { font-weight:bold;font-size:14px;text-align:right;margin-top:10px; }
.notes { border:1px solid #d1d5db;border-radius:4px;padding:8px;margin-top:10px;min-height:40px;white-space:pre-wrap; }
.sig { display:flex;gap:30px;margin-top:24px; }
.sig-box { flex:1;border-top:1px solid #999;padding-top:4px;font-size:10px;color:#666; }
@media print { button { display:none!important; } }
</style></head><body>
<div class="header">
  <div><div class="logo">ЕСПЕХО ООД</div><div style="color:#666;font-size:11px;">Оферта</div></div>
  <div style="text-align:right">
    <div style="font-size:18px;font-weight:bold;">${esc(q.quote_number)}</div>
    <div style="font-size:11px;color:#555">Дата: ${esc(dateBg(q.created_at || new Date()))}</div>
    ${q.valid_until ? `<div style="font-size:11px;color:#555">Валидна до: ${esc(fmt(q.valid_until))}</div>` : ''}
  </div>
</div>
<h2>Клиент</h2>
<p><strong>${esc(q.client_name)}</strong></p>
${q.client_phone ? `<p>${esc(q.client_phone)}</p>` : ''}
${q.client_email ? `<p>${esc(q.client_email)}</p>` : ''}
<h2>Позиции</h2>
<table>
<thead><tr><th>#</th><th>Описание</th><th class="r">Ш × В (мм)</th><th class="r">Бр.</th><th class="r">Количество</th><th class="r">Ед. цена</th><th class="r">Сума</th></tr></thead>
<tbody>
${lines.map(({ it, uom, p, total: lt }, i) => `
<tr>
  <td>${i + 1}</td>
  <td>${esc(it.product_desc || '—')}${it.product_type && TYPE_LABELS[it.product_type] ? `<div class="sub">${esc(TYPE_LABELS[it.product_type])}</div>` : ''}${it.notes ? `<div class="sub">${esc(it.notes)}</div>` : ''}</td>
  <td class="r">${it.width && it.height ? `${esc(it.width)} × ${esc(it.height)}` : '—'}</td>
  <td class="r">${esc(it.qty ?? 1)}</td>
  <td class="r">${uom === 'fixed' ? '—' : `${esc(num(it.billed_qty ?? p.billed, 3))} ${UOM_UNITS[uom]}${p.minApplied ? ' <span class="sub">(мин. площ)</span>' : ''}`}</td>
  <td class="r">${it.unit_price !== '' && it.unit_price != null ? `${esc(money(it.unit_price))}${uom !== 'fixed' ? `/${UOM_UNITS[uom]}` : ''}` : '—'}</td>
  <td class="r">${esc(money(lt))}</td>
</tr>`).join('')}
</tbody>
</table>
<div class="total">Общо (с ДДС): <strong>${esc(money(total))}</strong></div>
${q.notes ? `<div class="notes"><strong style="font-size:10px;text-transform:uppercase;color:#666;">Бележки:</strong><div style="margin-top:4px;">${esc(q.notes)}</div></div>` : ''}
<div class="sig">
  <div class="sig-box">ЕСПЕХО ООД: _________________________</div>
  <div class="sig-box">Клиент: _________________________</div>
</div>
<div style="text-align:center;margin-top:14px;">
  <button onclick="window.print()" style="padding:8px 20px;background:#3b82f6;color:white;border:none;border-radius:6px;font-size:13px;cursor:pointer;">Принтирай</button>
</div>
</body></html>`
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Quotations() {
  const settings = useSettings()
  const [quotes, setQuotes]         = useState([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState({ status: '', search: '' })
  const [formOpen, setFormOpen]     = useState(false)
  const [editData, setEditData]     = useState(null)
  const [convertQ, setConvertQ]     = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const fetchQuotes = useCallback(async () => {
    setLoading(true)
    try {
      const params = { limit: 200 }
      if (filter.status) params.status = filter.status
      if (filter.search) params.search = filter.search
      const { data } = await api.get('/quotations', { params })
      setQuotes(data.data)
      setTotal(data.total)
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка при зареждане') }
    finally { setLoading(false) }
  }, [filter])

  useEffect(() => {
    const t = setTimeout(fetchQuotes, filter.search ? 250 : 0)
    return () => clearTimeout(t)
  }, [fetchQuotes])

  const openNew = () => { setEditData(null); setFormOpen(true) }

  // ?new=1 from the global "+ Нов" menu
  const newParam = searchParams.get('new')
  useEffect(() => {
    if (newParam) {
      openNew()
      const next = new URLSearchParams(searchParams)
      next.delete('new')
      setSearchParams(next, { replace: true })
    }
  }, [newParam])

  const openEdit = q => {
    api.get(`/quotations/${q.id}`).then(r => { setEditData(r.data); setFormOpen(true) })
      .catch(err => toast.error(err.response?.data?.error || 'Грешка'))
  }

  // The list has no lines — load the full quote, then print
  const printQuote = async q => {
    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) return toast.error('Браузърът блокира прозореца за печат')
    win.document.write('<p style="font-family:Arial;padding:20px">Зареждане…</p>')
    try {
      const { data } = await api.get(`/quotations/${q.id}`)
      win.document.open()
      win.document.write(printQuoteHtml(data, settings))
      win.document.close()
    } catch (err) {
      win.close()
      toast.error(err.response?.data?.error || 'Офертата не може да бъде заредена')
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/quotations/${id}`, { status })
      toast.success('Статусът е обновен')
      fetchQuotes()
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
  }

  const today = todayStr()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Оферти</h1>
          <p className="text-muted text-sm mt-1">{total} оферти общо{total > quotes.length && ` · показани ${quotes.length}`}</p>
        </div>
        <button className="btn-primary" onClick={openNew}>+ Нова оферта</button>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input className="input max-w-xs" placeholder="Търси клиент или номер…"
          value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} />
        <select className="select w-44" value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">Всички статуси</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted">Зарежда се…</div>
      ) : quotes.length === 0 ? (
        <div className="card text-center py-16">
          <FileText className="w-10 h-10 mx-auto mb-3 text-muted" strokeWidth={1.5} />
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
                <th className="text-right">Сума с ДДС</th>
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
                  <td className="font-medium text-white text-right whitespace-nowrap">{eur(q.total_price, { dash: false })}</td>
                  <td className={`text-sm whitespace-nowrap ${q.valid_until && String(q.valid_until).slice(0, 10) < today && q.status === 'SENT' ? 'text-danger' : 'text-gray-300'}`}>
                    {fmt(q.valid_until)}
                  </td>
                  <td className="text-muted text-xs whitespace-nowrap">{fmt(q.created_at)}</td>
                  <td>
                    <div className="flex gap-1.5 flex-wrap">
                      {!q.converted_to && (
                        <button className="btn-ghost text-xs py-1 px-2" onClick={() => openEdit(q)} title="Редактирай" aria-label="Редактирай"><Pencil className="w-3.5 h-3.5" strokeWidth={2} /></button>
                      )}
                      <button className="btn-ghost text-xs py-1 px-2" onClick={() => printQuote(q)} title="Принтирай" aria-label="Принтирай"><Printer className="w-3.5 h-3.5" strokeWidth={2} /></button>
                      {q.status === 'DRAFT' && (
                        <button className="btn-ghost text-xs py-1 px-2 text-blue-400"
                          onClick={() => updateStatus(q.id, 'SENT')}>Изпратена</button>
                      )}
                      {['DRAFT', 'SENT'].includes(q.status) && !q.converted_to && (
                        <button className="btn-ghost text-xs py-1 px-2 text-green-400"
                          onClick={() => setConvertQ(q)}>→ Поръчка</button>
                      )}
                      {['DRAFT', 'SENT'].includes(q.status) && !q.converted_to && (
                        <button className="btn-ghost text-xs py-1 px-2 text-danger"
                          onClick={() => updateStatus(q.id, 'REJECTED')}>Отказана</button>
                      )}
                      {q.converted_to && (
                        <Link to={`/orders/${q.converted_to}`} className="text-xs text-green-400 px-2 hover:underline inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" strokeWidth={2} />Към поръчката
                        </Link>
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
        onSaved={fetchQuotes} editData={editData}
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
