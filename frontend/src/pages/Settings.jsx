import { useEffect, useState } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { PageLoader } from '../components/ui/Spinner'
import { invalidateSettingsCache } from '../hooks/useSettings'
import { dateBg } from '../utils/labels'
import OptionListsEditor from '../components/settings/OptionListsEditor'

// Grouped so the owner sees what each number affects
const GROUPS = [
  { title: 'Цени и данъци', keys: ['vat_pct', 'price_markup_pct'],
    note: 'Цените в поръчките се въвеждат С ДДС — както в таблицата. Маржът в отчетите се смята без ДДС.' },
  { title: 'Минимална площ за таксуване', keys: ['min_area_igu_m2', 'min_area_single_m2'],
    note: 'Малките стъкла се таксуват поне с тази площ. Пример: пакет 30×30 см (0,09 м²) се смята като 0,4 м².' },
  { title: 'Комисионна', keys: ['commission_pool_pct'],
    note: 'Процент от печалбата — както колона „по 7,7%“ в таблицата (от юни 2026 — 15,7%). Показва се в отчета „Платени поръчки“.' },
  { title: 'Фирмени данни', keys: ['company_name', 'company_eik', 'company_vat', 'company_address', 'company_workshop', 'company_phone', 'company_email'],
    note: 'Изписват се на доставателните бележки и работните листове.', text: true },
  { title: 'Себестойност — формулата от таблицата', keys: ['igu2_consumables_m2', 'igu2_labor_m2', 'igu3_consumables_m2', 'igu3_labor_m2', 'single_labor_m2', 'default_overhead_pct'],
    note: 'Двоен пакет = стъкло1×(1+фира) + стъкло2×(1+фира) + консумативи + труд (€/м², без ДДС). Цените на стъклата са в Каталог → Стъкла. Режийните (ако има) се добавят отгоре — в таблицата няма такива.' },
]
const UNITS = { vat_pct: '%', price_markup_pct: '%', commission_measurer_pct: '%', commission_office_pct: '%',
  commission_pool_pct: '%', default_overhead_pct: '%', min_area_igu_m2: 'м²', min_area_single_m2: 'м²',
  igu2_consumables_m2: '€/м²', igu2_labor_m2: '€/м²', igu3_consumables_m2: '€/м²', igu3_labor_m2: '€/м²', single_labor_m2: '€/м²' }

export default function Settings() {
  const [rows, setRows] = useState(null)
  const [draft, setDraft] = useState({})
  const [saving, setSaving] = useState(false)

  const load = () => api.get('/settings').then(r => {
    setRows(r.data)
    setDraft(Object.fromEntries(r.data.map(s => [s.key, s.value])))
  })
  useEffect(() => { load() }, [])

  if (!rows) return <PageLoader />
  const byKey = Object.fromEntries(rows.map(r => [r.key, r]))
  const changed = rows.filter(r => String(draft[r.key]).replace(',', '.') !== String(r.value))

  const save = async () => {
    setSaving(true)
    try {
      const body = Object.fromEntries(changed.map(r => [r.key, draft[r.key]]))
      const { data } = await api.patch('/settings', body)
      setRows(data)
      setDraft(Object.fromEntries(data.map(s => [s.key, s.value])))
      invalidateSettingsCache()
      toast.success('Настройките са запазени')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка при запис')
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Настройки</h1>
          <p className="text-sm text-muted mt-0.5">Проценти, правила и списъци, по които работи системата</p>
        </div>
        <button className="btn-primary" disabled={!changed.length || saving} onClick={save}>
          {saving ? 'Запис…' : changed.length ? `Запази (${changed.length})` : 'Запазено'}
        </button>
      </div>

      <div className="space-y-4">
        {GROUPS.map(g => (
          <div key={g.title} className="card">
            <h2 className="font-semibold text-white">{g.title}</h2>
            <p className="text-xs text-muted mt-1 mb-4">{g.note}</p>
            <div className="space-y-4">
              {g.keys.filter(k => byKey[k]).map(k => {
                const s = byKey[k]
                const dirty = String(draft[k]).replace(',', '.') !== String(s.value)
                return (
                  <div key={k} className={`grid grid-cols-1 ${g.text ? 'sm:grid-cols-[1fr_320px]' : 'sm:grid-cols-[1fr_160px]'} gap-2 sm:gap-6 items-start`}>
                    <div>
                      <label htmlFor={k} className="text-sm font-medium text-white">{s.label}</label>
                      {s.hint && <p className="text-xs text-muted mt-0.5">{s.hint}</p>}
                      <p className="text-[11px] text-muted/70 mt-0.5">Последна промяна: {dateBg(s.updated_at, 'd MMM yyyy, HH:mm')}</p>
                    </div>
                    <div className="relative">
                      <input id={k} inputMode={g.text ? 'text' : 'decimal'} className={`input ${g.text ? '' : 'pr-10 text-right'} ${dirty ? 'border-accent' : ''}`}
                        value={draft[k] ?? ''} onChange={e => setDraft(d => ({ ...d, [k]: e.target.value }))} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">{UNITS[k]}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <OptionListsEditor />
      </div>
    </div>
  )
}
