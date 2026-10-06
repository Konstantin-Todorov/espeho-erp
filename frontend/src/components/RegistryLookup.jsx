import { useEffect, useState } from 'react'
import { Search, Building2, BadgeCheck, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import Modal from './ui/Modal'

// Fields we can fill from the register: [client field, label, value from the record]
const MAP = [
  ['legal_name', 'Официално име', r => r.full_name],
  ['eik', 'ЕИК', r => r.eik],
  ['vat_number', 'ДДС №', r => r.vat_number],
  ['mol', 'МОЛ (управител)', r => r.manager],
  ['address', 'Адрес', r => r.address],
  ['city', 'Град', r => r.city],
  ['phone', 'Телефон', r => r.phone],
  ['email', 'Имейл', r => r.email],
  ['website', 'Сайт', r => r.website],
]

// Find the company in Търговски регистър (by name or ЕИК), check VAT registration in VIES,
// and fill the client's card with the chosen record. Nothing is overwritten without a tick.
export default function RegistryLookup({ open, onClose, client, onApply }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [rec, setRec] = useState(null)
  const [pick, setPick] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setRec(null); setResults(null)
    const start = client?.eik || client?.name || ''
    setQ(start)
    if (start) search(start)
  }, [open])

  const search = async term => {
    if (!term || term.trim().length < 2) return
    setLoading(true); setRec(null)
    try {
      const { data } = await api.get('/clients/lookup', { params: { q: term.trim() } })
      setResults(data)
      if (data.length === 1 && /^\d{9}/.test(term.trim())) choose(data[0].eik)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Регистърът не отговаря')
      setResults([])
    } finally { setLoading(false) }
  }

  const choose = async eik => {
    setLoading(true)
    try {
      const { data } = await api.get(`/clients/lookup/${eik}`)
      setRec(data)
      // Pre-tick: empty fields get filled; fields that already have a different value stay unticked
      const p = {}
      for (const [k, , get] of MAP) {
        const v = get(data)
        if (v && !client?.[k]) p[k] = true
      }
      setPick(p)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setLoading(false) }
  }

  const apply = async () => {
    const body = { registry_checked_at: true }
    for (const [k, , get] of MAP) if (pick[k]) body[k] = get(rec)
    setSaving(true)
    try {
      await onApply(body)
      toast.success('Данните са попълнени от Търговския регистър')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка при запис')
    } finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Данни от Търговския регистър" size="lg">
      {!rec ? (
        <div className="space-y-3">
          <form onSubmit={e => { e.preventDefault(); search(q) }} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input className="input pl-9" autoFocus placeholder="Име на фирмата или ЕИК" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <button className="btn-primary" disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Търси'}</button>
          </form>
          <p className="text-xs text-muted">Официални публични данни: Търговски регистър (Агенция по вписванията) и VIES за регистрация по ДДС.</p>
          {results && results.length === 0 && !loading && (
            <p className="text-sm text-muted text-center py-6">Няма фирма с това име. Опитайте с по-кратко име или с ЕИК.</p>
          )}
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {(results || []).map(r => (
              <button key={r.eik} onClick={() => choose(r.eik)} disabled={loading}
                className={`w-full text-left px-3 py-2.5 rounded-xl border flex items-center gap-3 hover:border-accent/60 ${r.exact ? 'border-accent/40 bg-accent/5' : 'border-border'}`}>
                <Building2 className="w-4 h-4 text-muted flex-shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm text-white truncate">{r.full_name || r.name}</span>
                  <span className="block text-xs text-muted">ЕИК {r.eik}{r.exact ? ' · същото име' : ''}</span>
                </span>
              </button>
            ))}
          </div>
          {results && results.length > 1 && (
            <p className="text-xs text-muted">Може да има няколко фирми с едно име — отворете, за да видите града и управителя.</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <button className="text-sm text-accent hover:underline inline-flex items-center gap-1" onClick={() => setRec(null)}>
            <ArrowLeft className="w-4 h-4" /> Към резултатите
          </button>
          <div className="flex items-start gap-3">
            <Building2 className="w-6 h-6 text-accent mt-0.5" />
            <div>
              <p className="font-semibold text-white">{rec.full_name || rec.name}</p>
              <p className="text-xs text-muted">{rec.legal_form} · ЕИК {rec.eik}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {rec.vat_registered && <span className="badge bg-green-500/15 text-green-400 inline-flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5" /> Регистрирана по ДДС</span>}
                {rec.vat_registered === false && <span className="badge bg-border text-muted">Без ДДС регистрация</span>}
                {rec.closed && <span className="badge bg-red-500/15 text-red-400 inline-flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Има вписване за ликвидация / прекратяване — проверете</span>}
              </div>
              {rec.activity && <p className="text-xs text-muted mt-2 line-clamp-2">{rec.activity}</p>}
            </div>
          </div>

          <div className="border border-border rounded-xl divide-y divide-border">
            {MAP.map(([k, label, get]) => {
              const v = get(rec)
              if (!v) return null
              const cur = client?.[k]
              const same = cur && String(cur).trim().toLowerCase() === String(v).trim().toLowerCase()
              return (
                <label key={k} className={`flex items-start gap-3 px-3 py-2.5 ${same ? 'opacity-60' : 'cursor-pointer'}`}>
                  <input type="checkbox" className="mt-1" disabled={same} checked={!!pick[k] && !same}
                    onChange={e => setPick(p => ({ ...p, [k]: e.target.checked }))} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs text-muted">{label}</span>
                    <span className="block text-sm text-white break-words">{v}</span>
                    {cur && !same && <span className="block text-xs text-yellow-400">сега: {cur}</span>}
                    {same && <span className="block text-xs text-muted">вече е попълнено</span>}
                  </span>
                </label>
              )
            })}
          </div>
          {!rec.phone && !rec.email && (
            <p className="text-xs text-muted">Фирмата не е подала телефон и имейл в регистъра — те се попълват ръчно.</p>
          )}
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={onClose}>Откажи</button>
            <button className="btn-primary" disabled={saving || !Object.values(pick).some(Boolean)} onClick={apply}>
              {saving ? '…' : `Попълни избраните (${Object.values(pick).filter(Boolean).length})`}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
