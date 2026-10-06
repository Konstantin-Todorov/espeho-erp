import { useEffect, useMemo, useState } from 'react'
import { Plus, EyeOff, Eye, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { PageLoader } from '../ui/Spinner'
import { invalidateGlassCache } from '../../hooks/useGlass'
import { invalidateSettingsCache } from '../../hooks/useSettings'

const FORMULA_KEYS = [
  ['igu2_consumables_m2', 'Двоен — консумативи'], ['igu2_labor_m2', 'Двоен — труд'],
  ['igu3_consumables_m2', 'Троен — консумативи'], ['igu3_labor_m2', 'Троен — труд'],
  ['single_labor_m2', 'Единично — труд (по подразбиране)'],
]
const money = v => (v === null || v === undefined || v === '' ? null : Number(v))

// Inline-editable number (click → type → Enter)
function Cell({ value, suffix = '€', onSave, width = 'w-20' }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState('')
  const v = money(value)
  const save = async () => {
    setEditing(false)
    if (String(val).replace(',', '.') === String(v ?? '')) return
    await onSave(String(val).replace(',', '.'))
  }
  if (editing) {
    return (
      <input className={`input py-1 text-right ${width} text-sm`} autoFocus inputMode="decimal" value={val}
        onChange={e => setVal(e.target.value)} onBlur={save}
        onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setEditing(false) }} />
    )
  }
  return (
    <button className={`text-right ${width} px-2 py-1 rounded-lg hover:bg-border text-sm tabular-nums`} title="Кликнете за промяна"
      onClick={() => { setVal(v ?? ''); setEditing(true) }}>
      {v !== null ? `${v.toFixed(2)}${suffix === '%' ? '' : ' '}${suffix}` : <span className="text-muted">—</span>}
    </button>
  )
}

// Owner's price list of base glasses + the fixed numbers of the spreadsheet formula.
// Changing a price affects new lines only — existing orders keep the cost they were made with.
export default function GlassPrices() {
  const [rows, setRows] = useState(null)
  const [settings, setSettings] = useState({})
  const [q, setQ] = useState('')
  const [showHidden, setShowHidden] = useState(false)
  const [newName, setNewName] = useState('')

  const load = () => Promise.all([
    api.get('/glass', { params: { all: 1 } }).then(r => setRows(r.data)),
    api.get('/settings').then(r => setSettings(Object.fromEntries(r.data.map(s => [s.key, s.value])))),
  ])
  useEffect(() => { load() }, [])

  const patch = async (g, body) => {
    try {
      const { data } = await api.patch(`/glass/${g.id}`, body)
      setRows(xs => xs.map(x => x.id === data.id ? data : x))
      invalidateGlassCache()
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
  }
  const saveSetting = async (key, value) => {
    try {
      await api.patch('/settings', { [key]: value })
      setSettings(s => ({ ...s, [key]: value }))
      invalidateSettingsCache()
      toast.success('Запазено')
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
  }
  const add = async e => {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      const { data } = await api.post('/glass', { name: newName, category: 'Друго' })
      setRows(xs => [data, ...xs]); setNewName(''); invalidateGlassCache()
      toast.success('Добавено — попълнете цените')
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
  }

  const grouped = useMemo(() => {
    const t = q.trim().toUpperCase()
    return (rows || []).filter(g => (showHidden || g.active) && (!t || g.name.includes(t)))
      .reduce((acc, g) => { (acc[g.category || 'Друго'] ||= []).push(g); return acc }, {})
  }, [rows, q, showHidden])

  if (!rows) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="card space-y-3">
        <div>
          <h2 className="text-white font-semibold">Формула за себестойност — както в таблицата</h2>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            <b className="text-white">Единично:</b> доставна цена × (1 + фира) + труд ·{' '}
            <b className="text-white">Двоен:</b> стъкло1 × (1 + фира1) + стъкло2 × (1 + фира2) + консумативи + труд ·{' '}
            <b className="text-white">Троен:</b> същото с три стъкла. Всичко е в € на м², без ДДС, умножено по таксуваната площ.
            Себестойността на поръчката се събира сама от редовете.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {FORMULA_KEYS.map(([k, label]) => (
            <div key={k} className="rounded-lg border border-border px-2 py-1.5">
              <p className="text-[11px] text-muted">{label}</p>
              <Cell value={settings[k]} onSave={v => saveSetting(k, v)} width="w-full" suffix="€/м²" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input className="input pl-9" placeholder="Търси стъкло…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <form onSubmit={add} className="flex gap-2">
          <input className="input w-56" placeholder="Ново стъкло, напр. СИВО 6ММ" value={newName} onChange={e => setNewName(e.target.value)} />
          <button className="btn-secondary" disabled={!newName.trim()}><Plus className="w-4 h-4" /> Добави</button>
        </form>
        <label className="flex items-center gap-2 text-sm text-muted ml-auto cursor-pointer">
          <input type="checkbox" checked={showHidden} onChange={e => setShowHidden(e.target.checked)} /> Покажи скритите
        </label>
      </div>

      {Object.entries(grouped).map(([category, list]) => (
        <section key={category}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">{category} <span className="font-normal">· {list.length}</span></h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Стъкло</th>
                  <th className="text-right" title="Доставна цена за единично стъкло (лист „Единичен“)">Доставна</th>
                  <th className="text-right" title="Труд за единично стъкло">Труд</th>
                  <th className="text-right" title="Цена на стъклото в пакет (листове „Двойни/Тройни пакети“)">В пакет</th>
                  <th className="text-right" title="Обичайна фира — попълва се автоматично, може да се промени в поръчката">Фира</th>
                  <th className="text-right hidden md:table-cell" title="Колко пъти е използвано в таблицата">Ползвано</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.map(g => (
                  <tr key={g.id} className={g.active ? '' : 'opacity-50'}>
                    <td className="text-white">{g.name}</td>
                    <td className="text-right"><Cell value={g.supply_price} onSave={v => patch(g, { supply_price: v })} /></td>
                    <td className="text-right"><Cell value={g.labor_price} onSave={v => patch(g, { labor_price: v })} /></td>
                    <td className="text-right"><Cell value={g.igu_price} onSave={v => patch(g, { igu_price: v })} /></td>
                    <td className="text-right"><Cell value={g.waste_pct} suffix="%" onSave={v => patch(g, { waste_pct: v })} width="w-16" /></td>
                    <td className="text-right text-xs text-muted hidden md:table-cell">{g.uses || ''}</td>
                    <td className="text-right">
                      <button className="p-1.5 text-muted hover:text-white" title={g.active ? 'Скрий от списъка' : 'Върни в списъка'}
                        onClick={() => patch(g, { active: !g.active })}>
                        {g.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}
