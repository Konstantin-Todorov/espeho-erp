import { useState, useEffect, useCallback, useRef } from 'react'
import { AlertTriangle, ChevronDown, ChevronRight, Plus, X } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { OrderStatusBadge, PaymentStatusBadge, CategoryBadge } from '../components/ui/StatusBadge'
import { PageLoader } from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import ClientPicker from '../components/ui/ClientPicker'
import OptionSelect from '../components/ui/OptionSelect'
import useSettings from '../hooks/useSettings'
import { priceLine, sumLines } from '../utils/pricing'
import {
  TYPE_LABELS, TYPE_OPTIONS, CATEGORY_LABELS, CATEGORY_OPTIONS,
  FULFILLMENT_LABELS, FULFILLMENT_OPTIONS, UOM_LABELS, UOM_HINTS, STATUS_HINTS, PAYMENT_LABELS, INSTALL_LABELS,
  orderNo, eur, num, dateBg, isOverdue,
} from '../utils/labels'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['НОВА','МАТЕРИАЛИ','ПРОИЗВОДСТВО','ГОТОВА','ДОСТАВЕНА','ОТКАЗАНА']
const PAGE_SIZE = 30

const UNIT_SHORT = { m2: 'м²', lm: 'л.м.', pcs: 'бр.', fixed: 'сума' }

const emptyLine = type => ({ product_desc: '', product_type: type, width: '', height: '', qty: 1, uom: 'm2', unit_price: '' })

// ─── Product catalog picker (glass build-ups / services) ─────────────────────
function CatalogPicker({ onSelect, onClose, markupPct, vatPct }) {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const ref = useRef(null)

  useEffect(() => { api.get('/products').then(r => setTemplates(r.data)).finally(() => setLoading(false)) }, [])
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])

  const q = filter.toLowerCase()
  const filtered = templates.filter(t => !q || t.name.toLowerCase().includes(q) || t.default_description?.toLowerCase().includes(q))
  const groups = filtered.reduce((acc, t) => { (acc[t.order_type] ||= []).push(t); return acc }, {})
  const suggested = cost => cost ? +cost * (1 + (+markupPct || 0) / 100) * (1 + (+vatPct || 20) / 100) : null

  return (
    <div ref={ref} className="absolute z-40 top-full mt-1 left-0 w-[min(28rem,90vw)] bg-surface border border-border rounded-xl shadow-2xl">
      <div className="p-2 border-b border-border">
        <input className="input text-sm w-full" placeholder="Търси: бяло 4, сиво, кант, огледало…" value={filter}
          onChange={e => setFilter(e.target.value)} autoFocus />
      </div>
      <div className="max-h-72 overflow-y-auto">
        {loading && <p className="text-center text-muted text-sm py-4">Зареждане…</p>}
        {!loading && !filtered.length && <p className="text-center text-muted text-sm py-4">Няма намерени</p>}
        {Object.entries(groups).map(([type, items]) => (
          <div key={type}>
            <p className="px-3 py-1.5 text-xs font-semibold text-muted uppercase tracking-wide bg-bg/50">{TYPE_LABELS[type] || type}</p>
            {items.map(t => (
              <button key={t.id} type="button" onClick={() => { onSelect(t, t.sale_price ? +t.sale_price : suggested(t.unit_price)); onClose() }}
                className="w-full text-left px-3 py-2 hover:bg-border flex justify-between items-center gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{t.name}</p>
                  {t.default_description && <p className="text-xs text-muted">{t.default_description}</p>}
                </div>
                {(t.sale_price || t.unit_price) && (
                  <div className="text-right flex-shrink-0">
                    {t.unit_price && <p className="text-[11px] text-muted">себест. {(+t.unit_price).toFixed(2)} €</p>}
                    <p className="text-xs text-accent">
                      {t.sale_price ? `${(+t.sale_price).toFixed(2)} €` : `≈ ${suggested(t.unit_price).toFixed(2)} €`}/{UNIT_SHORT[t.uom] || 'м²'}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Usual price for a line (from past sales) — shown under the price field
function PriceHint({ desc, uom, clientId, onUse }) {
  const [hint, setHint] = useState(null)
  useEffect(() => {
    if (!desc || desc.trim().length < 3) { setHint(null); return }
    const t = setTimeout(() => {
      api.get('/orders/price-hints', { params: { desc, uom, client_id: clientId || undefined } })
        .then(r => setHint(r.data)).catch(() => {})
    }, 400)
    return () => clearTimeout(t)
  }, [desc, uom, clientId])
  if (!hint || (!hint.usual && !hint.client_last)) return null
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted">
      {hint.client_last && (
        <button type="button" className="hover:text-accent" onClick={() => onUse(hint.client_last.unit_price)}
          title="Цената, на която този клиент е купувал последно">
          последно за клиента: <span className="text-accent">{(+hint.client_last.unit_price).toFixed(2)} €</span> ({dateBg(hint.client_last.created_at, 'd.MM.yy')})
        </button>
      )}
      {hint.usual && (
        <button type="button" className="hover:text-accent" onClick={() => onUse(hint.usual.median)}
          title={`${hint.usual.n} продажби за 12 месеца, от ${hint.usual.min} до ${hint.usual.max} €`}>
          обичайна: <span className="text-accent">{(+hint.usual.median).toFixed(2)} €</span>
        </button>
      )}
    </div>
  )
}

// ─── Create Order Modal ───────────────────────────────────────────────────────
function CreateOrderModal({ open, onClose, onCreated, presetClient }) {
  const settings = useSettings()
  const empty = () => ({
    client: presetClient || null, order_type: 'стъклопакет', order_category: 'нормална', fulfillment: 'вземане',
    deadline: '', is_urgent: false, sale_price: '', notes: '', delivery_address: '', source: 'office', external_ref: '',
    items: [emptyLine('стъклопакет')],
  })
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [catalogIdx, setCatalogIdx] = useState(null)
  const [more, setMore] = useState(false)

  useEffect(() => { if (open) { setForm(empty()); setMore(false) } }, [open, presetClient?.id])

  const set = patch => setForm(f => ({ ...f, ...patch }))
  const setItem = (i, patch) => setForm(f => {
    const items = [...f.items]; items[i] = { ...items[i], ...patch }; return { ...f, items }
  })
  const addItem = () => setForm(f => {
    const last = f.items[f.items.length - 1]
    // A new line repeats the previous product — dealer orders are many sizes of the same glass
    return { ...f, items: [...f.items, { ...emptyLine(last?.product_type || f.order_type),
      product_desc: last?.product_desc || '', uom: last?.uom || 'm2', unit_price: last?.unit_price || '' }] }
  })
  const removeItem = i => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))

  const applyTemplate = (i, tpl, suggested) => {
    setItem(i, { product_desc: tpl.name, product_type: tpl.order_type === 'друго' ? form.items[i].product_type : tpl.order_type,
      uom: tpl.uom || 'm2',
      width: tpl.default_width || form.items[i].width, height: tpl.default_height || form.items[i].height,
      unit_price: suggested ? suggested.toFixed(2) : form.items[i].unit_price })
    // The order type follows the lines unless they are mixed
    const types = new Set(form.items.map((it, idx) => idx === i ? tpl.order_type : it.product_type).filter(t => t && t !== 'друго'))
    if (types.size) set({ order_type: types.size > 1 ? 'смесена' : [...types][0] })
  }

  const lines = form.items.filter(it => it.product_desc.trim())
  const total = sumLines(lines, settings)
  const finalPrice = form.sale_price !== '' ? +form.sale_price : total
  const totalM2 = lines.reduce((s, it) => {
    const p = priceLine(it, settings); return s + (it.uom === 'm2' && p.area ? p.area * (+it.qty || 1) : 0)
  }, 0)

  const handleSubmit = async (e, initialStatus) => {
    e?.preventDefault()
    if (!form.client) return toast.error('Изберете клиент')
    if (!lines.length) return toast.error('Добавете поне един ред')
    setLoading(true)
    try {
      const { client, ...rest } = form
      const res = await api.post('/orders', {
        ...rest, client_id: client.id, items: lines,
        sale_price: form.sale_price === '' ? null : form.sale_price,
        initial_status: initialStatus,
      })
      toast.success('Поръчката е създадена')
      onCreated(res.data)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка при създаване')
    } finally { setLoading(false) }
  }

  const needsAddress = form.fulfillment !== 'вземане'

  return (
    <Modal open={open} onClose={onClose} title="Нова поръчка" size="xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. Client */}
        <section>
          <p className="label">1. Клиент *</p>
          <ClientPicker value={form.client?.id} selected={form.client} onChange={c => set({ client: c })} autoFocus={!presetClient} />
        </section>

        {/* 2. Lines */}
        <section>
          <div className="flex items-end justify-between mb-1 gap-2">
            <div>
              <p className="label mb-0">2. Какво поръчва</p>
              <p className="text-xs text-muted">Размерите са в мм. Цените са с ДДС. Сумата се смята сама — включително минималната площ.</p>
            </div>
          </div>

          <div className="space-y-3 mt-2">
            {form.items.map((item, i) => {
              const p = priceLine(item, settings)
              return (
                <div key={i} className="p-3 rounded-xl border border-border bg-bg/40">
                  <div className="flex gap-2 items-start">
                    <span className="text-xs text-muted w-5 pt-2.5 text-right flex-shrink-0">{i + 1}.</span>
                    <div className="flex-1 grid grid-cols-6 md:grid-cols-12 gap-2">
                      <div className="col-span-6 md:col-span-5 relative">
                        <div className="flex gap-1">
                          <input className="input text-sm flex-1" placeholder="Стъкло / услуга, напр. БЯЛО 4ММ/БЯЛО 4ММ"
                            value={item.product_desc} onChange={e => setItem(i, { product_desc: e.target.value })} />
                          <button type="button" className="btn-secondary px-2 text-xs flex-shrink-0" title="Избери от каталога"
                            onClick={() => setCatalogIdx(catalogIdx === i ? null : i)}>Каталог</button>
                        </div>
                        {catalogIdx === i && (
                          <CatalogPicker onSelect={(t, sug) => applyTemplate(i, t, sug)} onClose={() => setCatalogIdx(null)}
                            markupPct={settings.price_markup_pct} vatPct={settings.vat_pct} />
                        )}
                      </div>
                      <label className="col-span-2 md:col-span-1">
                        <span className="sr-only">Ширина мм</span>
                        <input className="input text-sm text-center px-1" placeholder="Ш мм" type="number" min="0" value={item.width}
                          disabled={item.uom === 'pcs' || item.uom === 'fixed'} onChange={e => setItem(i, { width: e.target.value })} />
                      </label>
                      <label className="col-span-2 md:col-span-1">
                        <span className="sr-only">Височина мм</span>
                        <input className="input text-sm text-center px-1" placeholder="В мм" type="number" min="0" value={item.height}
                          disabled={item.uom === 'pcs' || item.uom === 'fixed'} onChange={e => setItem(i, { height: e.target.value })} />
                      </label>
                      <label className="col-span-2 md:col-span-1">
                        <span className="sr-only">Брой</span>
                        <input className="input text-sm text-center px-1" placeholder="Бр." type="number" min="0" step="any" value={item.qty}
                          disabled={item.uom === 'fixed'} onChange={e => setItem(i, { qty: e.target.value })} />
                      </label>
                      <select className="select text-sm col-span-3 md:col-span-2 px-2" value={item.uom} title={UOM_HINTS[item.uom]}
                        onChange={e => setItem(i, { uom: e.target.value })}>
                        {Object.entries(UOM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <input className="input text-sm text-right col-span-3 md:col-span-2" placeholder="Цена" type="number" step="0.01" min="0"
                        value={item.unit_price} onChange={e => setItem(i, { unit_price: e.target.value })} />
                    </div>
                    <button type="button" className="text-muted hover:text-danger p-2 flex-shrink-0 disabled:opacity-30" title="Премахни реда"
                      onClick={() => removeItem(i)} disabled={form.items.length === 1}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5 pl-7 pr-9">
                    <PriceHint desc={item.product_desc} uom={item.uom} clientId={form.client?.id}
                      onUse={v => setItem(i, { unit_price: (+v).toFixed(2) })} />
                    <p className="text-xs text-muted ml-auto">
                      {item.uom === 'm2' && p.area !== null && (
                        <>{num(p.area, 3)} м²{p.minApplied && <span className="text-warning" title="Под минималната площ — таксува се минимумът"> (мин.)</span>}
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

        {/* 3. Details */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label" htmlFor="o-deadline">3. Срок за изпълнение</label>
            <input id="o-deadline" type="date" className="input" value={form.deadline} onChange={e => set({ deadline: e.target.value })} />
          </div>
          <div>
            <p className="label">Как се предава</p>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-bg border border-border">
              {FULFILLMENT_OPTIONS.map(f => (
                <button key={f} type="button" onClick={() => set({ fulfillment: f })}
                  className={`text-xs py-1.5 rounded-lg transition-colors ${form.fulfillment === f ? 'bg-accent text-white' : 'text-muted hover:text-white'}`}>
                  {FULFILLMENT_LABELS[f]}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-3 md:pt-6 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-danger" checked={form.is_urgent} onChange={e => set({ is_urgent: e.target.checked })} />
            <span className="text-sm text-gray-200">Спешна поръчка</span>
          </label>
          {needsAddress && (
            <div className="md:col-span-3">
              <label className="label" htmlFor="o-addr">Адрес за {form.fulfillment === 'монтаж' ? 'монтаж' : 'доставка'}</label>
              <input id="o-addr" className="input" placeholder="гр. София, ул. …" value={form.delivery_address}
                onChange={e => set({ delivery_address: e.target.value })} />
            </div>
          )}
          <div className="md:col-span-3">
            <label className="label" htmlFor="o-notes">Бележки</label>
            <textarea id="o-notes" className="input resize-none" rows={2} value={form.notes} onChange={e => set({ notes: e.target.value })} />
          </div>
        </section>

        {/* More options — rarely needed */}
        <section>
          <button type="button" className="text-sm text-accent hover:underline" onClick={() => setMore(m => !m)}>
            {more ? <ChevronDown className="w-4 h-4 inline align-[-3px]" /> : <ChevronRight className="w-4 h-4 inline align-[-3px]" />} Още настройки (вид, категория, канал, номер от кочана, ръчна цена)
          </button>
          {more && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 p-4 rounded-xl border border-border">
              <div>
                <label className="label" htmlFor="o-type">Вид поръчка</label>
                <select id="o-type" className="select" value={form.order_type} onChange={e => set({ order_type: e.target.value })}>
                  {TYPE_OPTIONS.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
                <p className="text-xs text-muted mt-1">Определя етапите в цеха (рязане, миене, сглобяване…).</p>
              </div>
              <div>
                <label className="label" htmlFor="o-cat">Категория</label>
                <select id="o-cat" className="select" value={form.order_category} onChange={e => set({ order_category: e.target.value })}>
                  {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                </select>
                <p className="text-xs text-muted mt-1">Гаранция/вътрешна/мостра не влизат в приходите.</p>
              </div>
              <div>
                <label className="label" htmlFor="o-src">Откъде дойде поръчката</label>
                <OptionSelect id="o-src" listKey="source" value={form.source} onChange={v => set({ source: v })} />
              </div>
              <div>
                <label className="label" htmlFor="o-ref">Номер от кочана / офиса</label>
                <input id="o-ref" className="input" placeholder="напр. 326-00512" value={form.external_ref}
                  onChange={e => set({ external_ref: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="label" htmlFor="o-price">Ръчна крайна цена (с ДДС)</label>
                <input id="o-price" type="number" step="0.01" className="input" placeholder={total ? `автоматично: ${total.toFixed(2)}` : 'автоматично от редовете'}
                  value={form.sale_price} onChange={e => set({ sale_price: e.target.value })} />
                <p className="text-xs text-muted mt-1">Попълнете само ако договорената цена е различна от сумата на редовете (напр. отстъпка).</p>
              </div>
            </div>
          )}
        </section>

        {/* Total + actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted">Общо {totalM2 > 0 && <>· {num(totalM2, 2)} м²</>} {form.sale_price !== '' && <span className="text-warning">· ръчна цена</span>}</p>
            <p className="text-2xl font-bold text-accent">{eur(finalPrice, { dash: false })} <span className="text-xs font-normal text-muted">с ДДС</span></p>
          </div>
          <div className="flex gap-2 justify-end flex-wrap">
            <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
            <button type="button" className="btn-secondary" disabled={loading} onClick={e => handleSubmit(e, 'ПРОИЗВОДСТВО')}
              title="Създава поръчката и я пуска директно в цеха">
              Създай и пусни в цеха
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Създаване…' : 'Създай поръчка'}</button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

// ─── Orders page ──────────────────────────────────────────────────────────────
const TABS = [
  { key: 'active', label: 'Активни', params: { active: 'true' } },
  { key: 'all', label: 'Всички', params: {} },
  { key: 'unpaid', label: 'Неплатени', params: { payment_status: 'неплатена' }, finance: true },
  { key: 'partial', label: 'Частично платени', params: { payment_status: 'частично' }, finance: true },
  { key: 'install', label: 'Чакат монтаж', params: { installation_status: 'ЗА_МОНТАЖ' } },
]

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useSearchParams()
  const [createOpen, setCreateOpen] = useState(false)
  const [presetClient, setPresetClient] = useState(null)
  const { isOffice, canSeePrices } = useAuth()
  const navigate = useNavigate()

  const tab = params.get('tab') || 'active'
  const status = params.get('status') || ''
  const urgent = params.get('urgent') === '1'
  const page = Math.max(1, +params.get('page') || 1)
  const [search, setSearch] = useState(params.get('q') || '')

  const update = patch => setParams(p => {
    const next = new URLSearchParams(p)
    for (const [k, v] of Object.entries(patch)) { if (v === '' || v === null || v === false) next.delete(k); else next.set(k, v) }
    if (!('page' in patch)) next.delete('page')
    return next
  }, { replace: true })

  // Quick create: /orders?new=1 (optionally &client=<id>)
  useEffect(() => {
    if (params.get('new') && isOffice) {
      const cid = params.get('client')
      if (cid) api.get(`/clients/${cid}`).then(r => setPresetClient({ id: r.data.id, name: r.data.name, phone: r.data.phone }))
      else setPresetClient(null)
      setCreateOpen(true)
      update({ new: '', client: '' })
    }
  }, [params.get('new')])

  // Debounced search into the URL
  useEffect(() => {
    const t = setTimeout(() => { if ((params.get('q') || '') !== search) update({ q: search }) }, 300)
    return () => clearTimeout(t)
  }, [search])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const t = TABS.find(x => x.key === tab) || TABS[0]
      const q = { ...t.params, page, limit: PAGE_SIZE }
      if (status) q.status = status
      if (urgent) q.urgent = 'true'
      if (params.get('q')) q.search = params.get('q')
      const { data } = await api.get('/orders', { params: q })
      setOrders(data.data)
      setTotal(data.total)
    } catch {
      toast.error('Грешка при зареждане на поръчките')
    } finally { setLoading(false) }
  }, [tab, status, urgent, page, params.get('q')])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const tabs = TABS.filter(t => !t.finance || canSeePrices)

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Поръчки</h1>
          <p className="text-sm text-muted mt-0.5">{num(total, 0)} {tab === 'active' ? 'активни' : 'общо'}</p>
        </div>
        {isOffice && (
          <button className="btn-primary" onClick={() => { setPresetClient(null); setCreateOpen(true) }}>
            <Plus className="w-4 h-4" />
            Нова поръчка
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => update({ tab: t.key === 'active' ? '' : t.key })}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${tab === t.key ? 'bg-accent text-white' : 'text-muted hover:text-white hover:bg-border'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input className="input w-full sm:w-72" placeholder="Търси: номер (326-00160), клиент, телефон…" value={search}
          onChange={e => setSearch(e.target.value)} />
        <select className="select w-auto" value={status} onChange={e => update({ status: e.target.value })}>
          <option value="">Всички статуси</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className={`btn ${urgent ? 'btn-danger' : 'btn-secondary'}`} onClick={() => update({ urgent: urgent ? '' : '1' })}>
          Само спешни
        </button>
      </div>

      {loading ? <PageLoader /> : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Номер</th><th>Клиент</th><th className="hidden md:table-cell">Вид</th><th>Статус</th>
                <th className="hidden lg:table-cell">Цех</th><th>Срок</th>
                {canSeePrices && <th className="text-right">Сума</th>}
                <th className="hidden md:table-cell">Дата</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-muted">
                  {params.get('q') ? 'Няма поръчки по това търсене' : tab === 'active' ? 'Няма активни поръчки — всичко е предадено' : 'Няма поръчки'}
                </td></tr>
              )}
              {orders.map(o => {
                const overdue = isOverdue(o)
                const pct = o.total_stages > 0 ? Math.round((o.done_stages / o.total_stages) * 100) : null
                return (
                  <tr key={o.id} className="cursor-pointer" onClick={() => navigate(`/orders/${o.id}`)}>
                    <td className="whitespace-nowrap">
                      <span className="font-bold text-accent">{orderNo(o)}</span>
                      {o.is_urgent && <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-danger align-middle" title="Спешна" />}
                      {o.external_ref && <div className="text-[11px] text-muted">#{o.order_number}</div>}
                      {o.open_defects > 0 && <span className="badge bg-red-500/20 text-red-400 text-[10px]">{o.open_defects} брак</span>}
                    </td>
                    <td className="max-w-[14rem]">
                      <div className="font-medium text-white truncate">{o.client_name}</div>
                      {o.client_phone && <div className="text-xs text-muted">{o.client_phone}</div>}
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="text-xs text-muted">{TYPE_LABELS[o.order_type] || o.order_type}</span>
                      {o.fulfillment !== 'вземане' && <div className="text-[11px] text-muted">{FULFILLMENT_LABELS[o.fulfillment]}</div>}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1 items-center" title={STATUS_HINTS[o.status]}>
                        <OrderStatusBadge status={o.status} />
                        <CategoryBadge category={o.order_category} />
                        {canSeePrices && o.payment_status !== 'платена' && o.order_category === 'нормална' && +o.sale_price > 0 && (
                          <PaymentStatusBadge status={o.payment_status} />
                        )}
                        {o.installation_status && <span className="badge bg-cyan-500/20 text-cyan-400 text-[10px]">{INSTALL_LABELS[o.installation_status]}</span>}
                      </div>
                    </td>
                    <td className="hidden lg:table-cell min-w-[90px]">
                      {pct !== null && o.status !== 'ДОСТАВЕНА' ? (
                        <div className="flex items-center gap-1.5" title={`${o.done_stages} от ${o.total_stages} етапа`}>
                          <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : 'bg-accent'}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-muted">{o.done_stages}/{o.total_stages}</span>
                        </div>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td className={`whitespace-nowrap ${overdue ? 'text-danger font-semibold' : 'text-muted'}`}>
                      {dateBg(o.deadline, 'd MMM')}{overdue && <AlertTriangle className="w-3.5 h-3.5 inline ml-1 align-[-2px]" />}
                    </td>
                    {canSeePrices && <td className="text-right whitespace-nowrap text-gray-200">{eur(o.sale_price)}</td>}
                    <td className="hidden md:table-cell text-muted text-xs whitespace-nowrap">{dateBg(o.created_at, 'd MMM yy')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button className="btn-secondary" disabled={page <= 1} onClick={() => update({ page: page - 1 })}>← Назад</button>
          <span className="px-3 text-sm text-muted">Страница {page} от {pages}</span>
          <button className="btn-secondary" disabled={page >= pages} onClick={() => update({ page: page + 1 })}>Напред →</button>
        </div>
      )}

      <CreateOrderModal open={createOpen} presetClient={presetClient} onClose={() => setCreateOpen(false)}
        onCreated={o => navigate(`/orders/${o.id}`)} />
    </div>
  )
}
