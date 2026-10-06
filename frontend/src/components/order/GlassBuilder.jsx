import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import useGlass from '../../hooks/useGlass'
import useSettings from '../../hooks/useSettings'
import { GLASS_KINDS, KIND_LABELS, KIND_TYPE, glassCost, glassKey, specFromDesc } from '../../utils/pricing'

const n = v => (v === '' || v === null || v === undefined || isNaN(+v) ? null : +v)

// Build a line from glasses, the way the office spreadsheet does: Единично / Двоен / Троен,
// glass 1-2-3 from the list and waste (фира) per glass. The description comes out in the
// spreadsheet's own naming („БЯЛО 4ММ/МФ 4ММ“) and the server computes the cost from it.
// The owner also sees the cost per m² as it is being built.
export default function GlassBuilder({ item, onApply, onClose }) {
  const { canSeeCost } = useAuth()
  const glasses = useGlass()
  const settings = useSettings()
  const ref = useRef(null)
  const byName = useMemo(() => new Map(glasses.map(g => [g.name, g])), [glasses])
  const byId = useMemo(() => new Map(glasses.map(g => [g.id, g])), [glasses])

  // Start from what the line already is (builder spec, or a recognisable description)
  const start = item.glass_spec || specFromDesc(item.product_desc, glasses)
  const [kind, setKind] = useState(start?.kind || (item.product_type === 'единично_стъкло' ? 'single' : 'double'))
  const [layers, setLayers] = useState(() => (start?.layers || []).map(l => ({ name: byId.get(+l.id)?.name || '', waste: l.waste ?? '' })))
  useEffect(() => {
    if (!layers.length && glasses.length && start) {
      setLayers(start.layers.map(l => ({ name: byId.get(+l.id)?.name || '', waste: l.waste ?? '' })))
    }
  }, [glasses.length])

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])

  const count = GLASS_KINDS[kind]
  const rows = Array.from({ length: count }, (_, i) => layers[i] || { name: '', waste: '' })
  const setRow = (i, patch) => setLayers(ls => {
    const next = Array.from({ length: Math.max(count, ls.length) }, (_, j) => ls[j] || { name: '', waste: '' })
    const row = { ...next[i], ...patch }
    // Picking a glass fills its usual waste, unless one was typed already
    if ('name' in patch && byName.get(patch.name) && (next[i].waste === '' || next[i].name !== patch.name)) {
      row.waste = n(byName.get(patch.name).waste_pct) ?? ''
    }
    next[i] = row
    return next
  })

  const chosen = rows.map(r => byName.get(r.name))
  const ready = chosen.every(Boolean)
  const spec = ready ? { kind, layers: rows.map((r, i) => ({ id: chosen[i].id, waste: n(r.waste) ?? n(chosen[i].waste_pct) ?? 0 })) } : null
  const desc = rows.map(r => r.name).filter(Boolean).join('/')
  const cost = canSeeCost && spec ? glassCost(spec, glasses, settings) : null

  // Most used first in the suggestions; a single pane offers everything, units skip processing services
  const options = useMemo(() => glasses
    .filter(g => kind === 'single' || g.category !== 'Обработка')
    .slice().sort((a, b) => (b.uses || 0) - (a.uses || 0)), [glasses, kind])

  const apply = () => {
    if (!spec) return
    onApply({ product_desc: desc, product_type: KIND_TYPE[kind], uom: 'm2', glass_spec: spec })
    onClose()
  }

  return (
    <div ref={ref} className="absolute z-40 top-full mt-1 left-0 w-[min(30rem,92vw)] bg-surface border border-border rounded-xl shadow-2xl p-3 space-y-3">
      <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-bg border border-border">
        {Object.keys(GLASS_KINDS).map(k => (
          <button key={k} type="button" onClick={() => setKind(k)}
            className={`text-xs py-1.5 rounded-lg ${kind === k ? 'bg-accent text-white' : 'text-muted hover:text-white'}`}>
            {KIND_LABELS[k]}
          </button>
        ))}
      </div>

      <datalist id="glass-names">{options.map(g => <option key={g.id} value={g.name}>{g.category}</option>)}</datalist>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-end gap-2">
            <label className="flex-1 min-w-0">
              <span className="text-[11px] text-muted">{count === 1 ? 'Стъкло' : `Стъкло ${i + 1}`}</span>
              <input className={`input text-sm ${r.name && !byName.get(r.name) ? 'border-warning' : ''}`} list="glass-names"
                autoFocus={i === 0} placeholder="бяло 4, мф, огледало…" value={r.name}
                onChange={e => setRow(i, { name: e.target.value })}
                onBlur={e => {
                  // Accept „бяло 4“ for „БЯЛО 4ММ“ when it is the only match
                  const t = e.target.value.trim().toUpperCase()
                  if (!t) return
                  if (byName.get(t)) { if (t !== e.target.value) setRow(i, { name: t }); return }
                  const same = options.find(g => glassKey(g.name) === glassKey(t))
                  if (same) return setRow(i, { name: same.name })
                  const hits = options.filter(g => g.name.includes(t))
                  if (hits.length === 1) setRow(i, { name: hits[0].name })
                }} />
            </label>
            <label className="w-20">
              <span className="text-[11px] text-muted" title="Фира — загуба при рязане">Фира %</span>
              <input className="input text-sm text-right px-2" inputMode="decimal" value={r.waste}
                onChange={e => setRow(i, { waste: e.target.value.replace(',', '.') })} />
            </label>
            {canSeeCost && (
              <span className="w-20 text-right text-[11px] text-muted pb-2 tabular-nums">
                {cost?.parts[i] ? `${cost.parts[i].value.toFixed(2)} €` : ''}
              </span>
            )}
          </div>
        ))}
      </div>

      {rows.some(r => r.name && !byName.get(r.name)) && (
        <p className="text-[11px] text-warning">Изберете стъкло от списъка. Ако липсва — добавете го в Каталог → Стъкла.</p>
      )}

      {cost && (
        <div className="text-xs rounded-lg bg-bg/60 border border-border p-2 space-y-0.5">
          <p className="text-muted">
            {cost.parts.map(p => `${p.price.toFixed(2)}×${(1 + p.waste / 100).toFixed(3)}`).join(' + ')}
            {cost.extras.map(([label, v]) => ` + ${label} ${v.toFixed(2)}`).join('')}
          </p>
          <p className="text-white">Себестойност: <b>{cost.rate.toFixed(2)} €/м²</b> <span className="text-muted">без ДДС</span></p>
        </div>
      )}
      {canSeeCost && spec && !cost && <p className="text-[11px] text-warning">Някое от стъклата няма цена — попълнете я в Каталог → Стъкла.</p>}

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-white truncate" title={desc}>{desc || <span className="text-muted">изберете стъклата</span>}</p>
        <div className="flex gap-2 flex-shrink-0">
          <button type="button" className="btn-secondary text-xs py-1" onClick={onClose}>Откажи</button>
          <button type="button" className="btn-primary text-xs py-1" disabled={!spec} onClick={apply}>Приложи</button>
        </div>
      </div>
    </div>
  )
}

// Owner-only hint under an order line: cost per m² by the spreadsheet formula and the margin at the
// entered price. Works for lines built with the builder and for typed names found in the glass list.
export function LineCostHint({ item }) {
  const { canSeeCost } = useAuth()
  const glasses = useGlass()
  const settings = useSettings()
  if (!canSeeCost || !glasses.length) return null
  const spec = item.glass_spec || specFromDesc(item.product_desc, glasses)
  const cost = spec ? glassCost(spec, glasses, settings) : null
  if (!cost) return null
  const net = n(item.unit_price) ? n(item.unit_price) / (1 + (n(settings.vat_pct) ?? 20) / 100) : null
  const margin = net ? ((net - cost.rate) / net) * 100 : null
  return (
    <span className="text-[11px] text-muted" title="Себестойност по формулата от таблицата (без ДДС)">
      себест. <span className="text-white">{cost.rate.toFixed(2)} €/м²</span>
      {margin !== null && (
        <> · марж <span className={margin < 15 ? 'text-danger' : margin < 30 ? 'text-yellow-400' : 'text-green-400'}>{margin.toFixed(0)}%</span></>
      )}
    </span>
  )
}
