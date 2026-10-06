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
  { title: 'Комисионни', keys: ['commission_measurer_pct', 'commission_office_pct', 'commission_pool_pct'],
    note: 'Процент от продажната цена без ДДС. Може да се променя по всяко време — важи за отчетите занапред.' },
  { title: 'Себестойност', keys: ['default_overhead_pct'],
    note: 'Режийните се добавят автоматично към себестойността на всяка нова поръчка.' },
]
const UNITS = { vat_pct: '%', price_markup_pct: '%', commission_measurer_pct: '%', commission_office_pct: '%',
  commission_pool_pct: '%', default_overhead_pct: '%', min_area_igu_m2: 'м²', min_area_single_m2: 'м²' }

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
                  <div key={k} className="grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-2 sm:gap-6 items-start">
                    <div>
                      <label htmlFor={k} className="text-sm font-medium text-white">{s.label}</label>
                      {s.hint && <p className="text-xs text-muted mt-0.5">{s.hint}</p>}
                      <p className="text-[11px] text-muted/70 mt-0.5">Последна промяна: {dateBg(s.updated_at, 'd MMM yyyy, HH:mm')}</p>
                    </div>
                    <div className="relative">
                      <input id={k} inputMode="decimal" className={`input pr-10 text-right ${dirty ? 'border-accent' : ''}`}
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
