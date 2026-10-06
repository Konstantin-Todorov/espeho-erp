import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Pencil, EyeOff, Eye, Search, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import useSettings from '../hooks/useSettings'
import Modal from '../components/ui/Modal'
import { PageLoader } from '../components/ui/Spinner'
import { TYPE_LABELS, UOM_LABELS, UOM_HINTS } from '../utils/labels'

const UNIT = { m2: 'м²', lm: 'л.м.', pcs: 'бр.', fixed: 'сума' }
const money = v => (v === null || v === undefined || v === '' ? null : Number(v))

// Selling price suggested from cost: cost × (1 + markup) × (1 + VAT)
const suggest = (cost, s) => (cost ? +cost * (1 + (+s.price_markup_pct || 0) / 100) * (1 + (+s.vat_pct || 20) / 100) : null)

function PriceCell({ item, field, onSave }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState('')
  const v = money(item[field])
  const save = async () => {
    setEditing(false)
    if (String(val).replace(',', '.') === String(v ?? '')) return
    await onSave(item, { [field]: val })
  }
  if (editing) {
    return (
      <input className="input py-1 text-right w-24 text-sm" autoFocus inputMode="decimal" value={val}
        onChange={e => setVal(e.target.value)} onBlur={save}
        onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setEditing(false) }} />
    )
  }
  return (
    <button className="text-right w-24 px-2 py-1 rounded-lg hover:bg-border text-sm tabular-nums" title="Кликнете за промяна"
      onClick={() => { setVal(v ?? ''); setEditing(true) }}>
      {v !== null ? `${v.toFixed(2)} €` : <span className="text-muted">—</span>}
    </button>
  )
}

function ItemModal({ open, onClose, item, categories, onSaved }) {
  const empty = { name: '', category: '', order_type: 'стъклопакет', uom: 'm2', unit_price: '', sale_price: '', default_description: '', notes: '' }
  const [f, setF] = useState(empty)
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    if (open) setF(item ? Object.fromEntries(Object.keys(empty).map(k => [k, item[k] ?? ''])) : empty)
  }, [open, item?.id])
  const set = p => setF(x => ({ ...x, ...p }))
  const save = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (item) await api.patch(`/products/${item.id}`, f)
      else await api.post('/products', f)
      toast.success('Запазено')
      onSaved(); onClose()
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
    finally { setSaving(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title={item ? 'Редакция на артикул' : 'Нов артикул в каталога'} size="md">
      <form onSubmit={save} className="space-y-4">
        <label className="block">
          <span className="label">Наименование *</span>
          <input className="input" required autoFocus value={f.name} onChange={e => set({ name: e.target.value })}
            placeholder="напр. БЯЛО 4ММ/БЯЛО 4ММ, Кант праволинеен 4мм, Монтаж" />
          <span className="text-xs text-muted">Така се изписва в поръчката и на производствения лист.</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="label">Категория</span>
            <input className="input" list="catalog-categories" value={f.category} onChange={e => set({ category: e.target.value })} placeholder="Стъклопакети, Обработки…" />
            <datalist id="catalog-categories">{categories.map(c => <option key={c} value={c} />)}</datalist>
          </label>
          <label>
            <span className="label">Вид (за етапите в цеха)</span>
            <select className="select" value={f.order_type} onChange={e => set({ order_type: e.target.value })}>
              {['стъклопакет', 'единично_стъкло', 'друго'].map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Мярка</span>
            <select className="select" value={f.uom} title={UOM_HINTS[f.uom]} onChange={e => set({ uom: e.target.value })}>
              {Object.entries(UOM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <div />
          <label>
            <span className="label">Себестойност без ДДС</span>
            <input className="input text-right" inputMode="decimal" value={f.unit_price} onChange={e => set({ unit_price: e.target.value })} />
          </label>
          <label>
            <span className="label">Продажна цена с ДДС</span>
            <input className="input text-right" inputMode="decimal" value={f.sale_price} onChange={e => set({ sale_price: e.target.value })} />
          </label>
        </div>
        <label className="block">
          <span className="label">Бележка</span>
          <input className="input" value={f.notes} onChange={e => set({ notes: e.target.value })} />
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button className="btn-primary" disabled={saving}>{saving ? '…' : 'Запази'}</button>
        </div>
      </form>
    </Modal>
  )
}

export default function Catalog() {
  const { isAdmin } = useAuth()
  const settings = useSettings()
  const [items, setItems] = useState(null)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [showHidden, setShowHidden] = useState(false)
  const [modal, setModal] = useState(null) // null | 'new' | item
  const [params, setParams] = useSearchParams()

  const load = () => api.get('/products', { params: { all: 1 } }).then(r => setItems(r.data))
  useEffect(() => { load() }, [])
  useEffect(() => { if (params.get('new')) { setModal('new'); setParams({}, { replace: true }) } }, [params])

  const categories = useMemo(() => [...new Set((items || []).map(i => i.category || 'Без категория'))].sort(), [items])
  const visible = useMemo(() => {
    const t = q.trim().toLowerCase()
    return (items || []).filter(i => (showHidden || i.active)
      && (!cat || (i.category || 'Без категория') === cat)
      && (!t || [i.name, i.category, i.default_description].some(v => v?.toLowerCase().includes(t))))
  }, [items, q, cat, showHidden])
  const grouped = useMemo(() => visible.reduce((acc, i) => { (acc[i.category || 'Без категория'] ||= []).push(i); return acc }, {}), [visible])
  const missingPrice = (items || []).filter(i => i.active && !money(i.sale_price)).length

  const patch = async (item, body) => {
    try {
      const { data } = await api.patch(`/products/${item.id}`, body)
      setItems(xs => xs.map(x => x.id === data.id ? data : x))
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
  }

  const fillSuggested = async () => {
    const todo = items.filter(i => i.active && !money(i.sale_price) && money(i.unit_price))
    if (!todo.length) return
    if (!window.confirm(`Да попълня препоръчана продажна цена за ${todo.length} артикула (себестойност + ${settings.price_markup_pct || 0}% надценка + ДДС)? После може да ги коригирате.`)) return
    for (const i of todo) await api.patch(`/products/${i.id}`, { sale_price: suggest(i.unit_price, settings).toFixed(2) })
    toast.success('Цените са попълнени')
    load()
  }

  if (!items) return <PageLoader />

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Каталог и цени</h1>
          <p className="text-sm text-muted mt-0.5">
            {items.filter(i => i.active).length} артикула · цените се предлагат автоматично в новите поръчки и оферти
          </p>
        </div>
        <div className="flex gap-2">
          {missingPrice > 0 && (
            <button className="btn-secondary" onClick={fillSuggested} title="Попълва празните продажни цени по себестойност + надценка">
              <Sparkles className="w-4 h-4" /> Попълни {missingPrice} липсващи цени
            </button>
          )}
          <button className="btn-primary" onClick={() => setModal('new')}><Plus className="w-4 h-4" /> Нов артикул</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input className="input pl-9" placeholder="Търси артикул…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {['', ...categories].map(c => (
            <button key={c || 'all'} onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-lg text-sm ${cat === c ? 'bg-accent text-white' : 'text-muted hover:text-white hover:bg-border'}`}>
              {c || 'Всички'}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-muted ml-auto cursor-pointer">
          <input type="checkbox" checked={showHidden} onChange={e => setShowHidden(e.target.checked)} /> Покажи скритите
        </label>
      </div>

      {Object.keys(grouped).length === 0 && <div className="card text-center text-muted py-10">Няма артикули по това търсене</div>}

      <div className="space-y-5">
        {Object.entries(grouped).map(([category, list]) => (
          <section key={category}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">{category} <span className="font-normal">· {list.length}</span></h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Артикул</th><th className="hidden md:table-cell">Вид</th><th>Мярка</th>
                    <th className="text-right">Себестойност</th><th className="text-right">Продажна (с ДДС)</th>
                    <th className="text-right hidden sm:table-cell">Марж</th><th />
                  </tr>
                </thead>
                <tbody>
                  {list.map(i => {
                    const cost = money(i.unit_price), sale = money(i.sale_price)
                    const net = sale ? sale / (1 + (+settings.vat_pct || 20) / 100) : null
                    const margin = net && cost ? ((net - cost) / net) * 100 : null
                    const sug = !sale ? suggest(cost, settings) : null
                    return (
                      <tr key={i.id} className={i.active ? '' : 'opacity-50'}>
                        <td>
                          <p className="text-white">{i.name}</p>
                          {i.notes && <p className="text-xs text-muted">{i.notes}</p>}
                        </td>
                        <td className="hidden md:table-cell text-xs text-muted">{TYPE_LABELS[i.order_type] || i.order_type}</td>
                        <td className="text-xs text-muted">{UNIT[i.uom] || i.uom}</td>
                        <td className="text-right"><PriceCell item={i} field="unit_price" onSave={patch} /></td>
                        <td className="text-right">
                          <PriceCell item={i} field="sale_price" onSave={patch} />
                          {sug && (
                            <button className="block ml-auto text-[11px] text-accent hover:underline" onClick={() => patch(i, { sale_price: sug.toFixed(2) })}
                              title="Себестойност + надценка от Настройки + ДДС">
                              предложение {sug.toFixed(2)} €
                            </button>
                          )}
                        </td>
                        <td className={`text-right text-sm hidden sm:table-cell ${margin === null ? 'text-muted' : margin < 15 ? 'text-danger' : margin < 30 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {margin === null ? '—' : `${margin.toFixed(0)}%`}
                        </td>
                        <td className="text-right whitespace-nowrap">
                          <button className="p-1.5 text-muted hover:text-white" aria-label="Редактирай" onClick={() => setModal(i)}><Pencil className="w-4 h-4" /></button>
                          {isAdmin && (
                            <button className="p-1.5 text-muted hover:text-white" aria-label={i.active ? 'Скрий' : 'Покажи'}
                              title={i.active ? 'Скрий от каталога' : 'Върни в каталога'} onClick={() => patch(i, { active: !i.active })}>
                              {i.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      <ItemModal open={!!modal} item={modal === 'new' ? null : modal} categories={categories}
        onClose={() => setModal(null)} onSaved={load} />
    </div>
  )
}
