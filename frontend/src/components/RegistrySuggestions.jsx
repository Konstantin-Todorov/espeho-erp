import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X, Building2, BadgeCheck, Search, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import RegistryLookup from './RegistryLookup'
import { eurRound } from '../utils/labels'

const CONF = {
  high:   { label: 'Сигурно', cls: 'bg-green-500/15 text-green-400' },
  medium: { label: 'Вероятно', cls: 'bg-yellow-500/15 text-yellow-400' },
  low:    { label: 'За проверка', cls: 'bg-orange-500/15 text-orange-400' },
  none:   { label: 'Няма съвпадение', cls: 'bg-border text-muted' },
}

function Field({ label, value, current }) {
  if (!value) return null
  const differs = current && String(current).trim().toLowerCase() !== String(value).trim().toLowerCase()
  return (
    <div className="text-xs">
      <span className="text-muted">{label}: </span>
      <span className="text-gray-200">{value}</span>
      {differs && <span className="text-yellow-400"> (сега: {current} — няма да се промени)</span>}
    </div>
  )
}

// Proposed register matches for the biggest clients. The office confirms each one —
// accepting fills ЕИК, ДДС №, official name and any empty contact fields; existing data is never overwritten.
export default function RegistrySuggestions({ onChanged }) {
  const [rows, setRows] = useState(null)
  const [busy, setBusy] = useState(null)
  const [manual, setManual] = useState(null) // suggestion opened in the manual lookup

  const load = () => api.get('/clients/registry-suggestions').then(r => setRows(r.data)).catch(() => setRows([]))
  useEffect(() => { load() }, [])

  const decide = async (s, action, eik) => {
    setBusy(s.id)
    try {
      await api.post(`/clients/registry-suggestions/${s.id}/${action}`, eik ? { eik } : {})
      toast.success(action === 'accept' ? `${s.client_name}: данните са попълнени` : 'Отхвърлено')
      setRows(r => r.filter(x => x.id !== s.id))
      onChanged?.()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setBusy(null) }
  }

  if (!rows) return <p className="text-muted text-sm py-8 text-center"><Loader2 className="w-4 h-4 inline animate-spin" /> Зареждане…</p>
  if (!rows.length) return <div className="card text-center text-muted py-10">Няма чакащи предложения.</div>

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        За най-големите клиенти без ЕИК системата е потърсила фирмата в Търговския регистър.
        „Приеми“ попълва ЕИК, ДДС №, официалното име и празните полета (МОЛ, адрес, телефон, имейл). Попълнените данни не се променят.
      </p>
      {rows.map(s => {
        const c = s.candidate
        const conf = CONF[s.confidence] || CONF.none
        return (
          <div key={s.id} className="card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <Link to={`/clients/${s.client_id}`} className="font-semibold text-white hover:text-accent">{s.client_name}</Link>
                <p className="text-xs text-muted">{s.orders} поръчки · {eurRound(s.turnover)}</p>
              </div>
              <span className={`badge ${conf.cls}`}>{conf.label}</span>
            </div>

            {c ? (
              <div className="mt-3 p-3 rounded-xl bg-bg border border-border space-y-1">
                <p className="text-sm text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-accent" /> {c.full_name || c.name}
                  {c.vat_registered && <BadgeCheck className="w-4 h-4 text-green-400" title="Регистрирана по ДДС" />}
                </p>
                <Field label="ЕИК" value={c.eik} />
                <Field label="ДДС №" value={c.vat_number} />
                <Field label="МОЛ" value={c.manager} current={s.client_mol} />
                <Field label="Адрес" value={c.address} current={s.client_address} />
                <Field label="Телефон" value={c.phone} current={s.client_phone} />
                <Field label="Имейл" value={c.email} current={s.client_email} />
              </div>
            ) : null}
            <p className="text-xs text-muted mt-2">{s.reason}</p>

            {s.alternatives?.length > 0 && c && (
              <div className="mt-2 text-xs text-muted">
                Други фирми със същото име:{' '}
                {s.alternatives.map(a => (
                  <button key={a.eik} className="text-accent hover:underline mr-2" disabled={busy === s.id}
                    title={`${a.address || ''} · МОЛ ${a.manager || '—'}`} onClick={() => decide(s, 'accept', a.eik)}>
                    {a.full_name || a.name} ({a.city || a.eik})
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-end mt-3">
              <button className="btn-secondary text-sm" onClick={() => setManual(s)}><Search className="w-4 h-4" /> Търси ръчно</button>
              <button className="btn-secondary text-sm" disabled={busy === s.id} onClick={() => decide(s, 'reject')}>
                <X className="w-4 h-4" /> {c ? 'Не е тази фирма' : 'Пропусни'}
              </button>
              {c && (
                <button className="btn-primary text-sm" disabled={busy === s.id} onClick={() => decide(s, 'accept')}>
                  <Check className="w-4 h-4" /> Приеми
                </button>
              )}
            </div>
          </div>
        )
      })}

      <RegistryLookup open={!!manual} onClose={() => setManual(null)}
        client={manual ? { name: manual.client_name, mol: manual.client_mol, address: manual.client_address, phone: manual.client_phone, email: manual.client_email } : null}
        onApply={async body => {
          await api.patch(`/clients/${manual.client_id}`, body)
          await api.post(`/clients/registry-suggestions/${manual.id}/reject`, { filled_manually: true }).catch(() => {})
          setRows(r => r.filter(x => x.id !== manual.id))
          onChanged?.()
        }} />
    </div>
  )
}
