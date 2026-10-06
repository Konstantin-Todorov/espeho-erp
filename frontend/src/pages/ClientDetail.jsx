import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { OrderStatusBadge, PaymentStatusBadge, CategoryBadge } from '../components/ui/StatusBadge'
import { PageLoader } from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import ClientPrices from '../components/ClientPrices'
import RegistryLookup from '../components/RegistryLookup'
import useOptions from '../hooks/useOptions'
import { Building2, BadgeCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { SOURCE_LABELS, TYPE_LABELS, orderNo, eur, num, dateBg } from '../utils/labels'
import { Check, Pencil, X } from 'lucide-react'

// Merge duplicate client records (e.g. "АЛЕМАР" and "Алемар ЕООД") into this one
function MergeModal({ open, onClose, client, onMerged }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [picked, setPicked] = useState([])
  const [saving, setSaving] = useState(false)
  const [asRef, setAsRef] = useState(true)

  useEffect(() => {
    if (!open) { setQ(''); setPicked([]); return }
    const first = client.name.split(/[\s.,-]+/).find(w => w.length >= 3) || client.name
    setQ(first)
  }, [open])
  useEffect(() => {
    if (!open || q.trim().length < 2) { setResults([]); return }
    const t = setTimeout(() => api.get('/clients', { params: { search: q, limit: 20 } })
      .then(r => setResults(r.data.data.filter(c => c.id !== client.id))), 250)
    return () => clearTimeout(t)
  }, [q, open])

  const toggle = c => setPicked(p => p.some(x => x.id === c.id) ? p.filter(x => x.id !== c.id) : [...p, c])
  const merge = async () => {
    setSaving(true)
    try {
      const { data } = await api.post(`/clients/${client.id}/merge`, { from_ids: picked.map(p => p.id), keep_as_ref: asRef })
      toast.success(`Обединени ${data.merged} клиента · ${data.orders_moved} поръчки преместени`)
      onMerged(); onClose()
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
    finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Обедини дубликати в „${client.name}“`} size="md">
      <p className="text-sm text-muted mb-3">Изберете записите, които са същият клиент (или негови обекти/етапи). Поръчките и офертите им ще се преместят тук, а дубликатите ще се изтрият. Старите имена се запомнят за бъдещо внасяне от Excel.</p>
      <input className="input mb-3" placeholder="Търси…" value={q} onChange={e => setQ(e.target.value)} autoFocus />
      <div className="max-h-72 overflow-y-auto space-y-1">
        {results.map(c => {
          const on = picked.some(x => x.id === c.id)
          return (
            <label key={c.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${on ? 'bg-accent/10' : 'hover:bg-border'}`}>
              <input type="checkbox" checked={on} onChange={() => toggle(c)} />
              <span className="flex-1 text-sm text-white">{c.name}</span>
              <span className="text-xs text-muted">{c.order_count} поръчки</span>
            </label>
          )
        })}
        {q.trim().length >= 2 && !results.length && <p className="text-center text-muted text-sm py-4">Няма съвпадения</p>}
      </div>
      <label className="flex items-start gap-2 mt-3 text-sm cursor-pointer">
        <input type="checkbox" className="mt-1" checked={asRef} onChange={e => setAsRef(e.target.checked)} />
        <span>
          <span className="text-white">Запази разликата в името като референция</span>
          <span className="block text-xs text-muted">Напр. „{client.name}-ЕТАП 1“ → поръчките отиват при „{client.name}“ с реф. „ЕТАП 1“ (обект, етап, клон).</span>
        </span>
      </label>
      <div className="flex gap-2 justify-end mt-4">
        <button className="btn-secondary" onClick={onClose}>Откажи</button>
        <button className="btn-primary" disabled={!picked.length || saving} onClick={merge}>
          {saving ? '…' : `Обедини (${picked.length})`}
        </button>
      </div>
    </Modal>
  )
}

function InlineEdit({ label, value, onSave, type = 'text', textarea = false }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value || '')
  const [saving, setSaving] = useState(false)

  const start = () => { setVal(value || ''); setEditing(true) }
  const cancel = () => setEditing(false)

  const save = async () => {
    if (val === (value || '')) { setEditing(false); return }
    setSaving(true)
    try {
      await onSave(val)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleKey = e => {
    if (e.key === 'Escape') cancel()
    if (e.key === 'Enter' && !textarea) save()
  }

  return (
    <div>
      <p className="text-muted text-xs uppercase tracking-wide mb-0.5">{label}</p>
      {editing ? (
        <div className="flex items-center gap-2">
          {textarea ? (
            <textarea
              className="input text-sm flex-1 resize-none"
              rows={3}
              value={val}
              onChange={e => setVal(e.target.value)}
              onKeyDown={handleKey}
              autoFocus
            />
          ) : (
            <input
              type={type}
              className="input text-sm flex-1"
              value={val}
              onChange={e => setVal(e.target.value)}
              onKeyDown={handleKey}
              autoFocus
            />
          )}
          <button onClick={save} disabled={saving} className="btn-primary text-xs py-1 px-2" title="Запази" aria-label="Запази">
            {saving ? '...' : <Check className="w-4 h-4" strokeWidth={2} />}
          </button>
          <button onClick={cancel} className="btn-secondary text-xs py-1 px-2" title="Откажи" aria-label="Откажи"><X className="w-4 h-4" strokeWidth={2} /></button>
        </div>
      ) : (
        <p
          className="text-white text-sm cursor-pointer hover:text-accent transition-colors group flex items-center gap-1 min-h-[1.5rem]"
          onClick={start}
        >
          {value || <span className="text-muted italic">—</span>}
          <Pencil className="w-3 h-3 text-muted opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </p>
      )}
    </div>
  )
}

function InlineSelect({ label, value, options, onSave }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value || '')
  const [saving, setSaving] = useState(false)

  const save = async (newVal) => {
    setSaving(true)
    try {
      await onSave(newVal)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <p className="text-muted text-xs uppercase tracking-wide mb-0.5">{label}</p>
      {editing ? (
        <div className="flex items-center gap-2">
          <select className="select text-sm flex-1" value={val}
            onChange={e => { setVal(e.target.value); save(e.target.value) }} autoFocus>
            {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {saving && <span className="text-muted text-xs">...</span>}
          <button onClick={() => setEditing(false)} className="btn-secondary text-xs py-1 px-2" title="Откажи" aria-label="Откажи"><X className="w-4 h-4" strokeWidth={2} /></button>
        </div>
      ) : (
        <p
          className="text-white text-sm cursor-pointer hover:text-accent transition-colors group flex items-center gap-1 min-h-[1.5rem]"
          onClick={() => { setVal(value || ''); setEditing(true) }}
        >
          {options.find(([v]) => v === value)?.[1] || value || <span className="text-muted italic">—</span>}
          <Pencil className="w-3 h-3 text-muted opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </p>
      )}
    </div>
  )
}

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isOffice, canSeePrices } = useAuth()
  const [client, setClient] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [mergeOpen, setMergeOpen] = useState(false)
  const [registryOpen, setRegistryOpen] = useState(false)
  const { lists: optLists, label: optLabel } = useOptions()

  const fetchClient = async () => {
    try {
      const { data } = await api.get(`/clients/${id}`)
      const { orders: ord, ...clientData } = data
      setClient(clientData)
      setOrders(ord || [])
    } catch {
      toast.error('Клиентът не е намерен')
      navigate('/clients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClient() }, [id])

  const patchField = async (field, value) => {
    try {
      const { data } = await api.patch(`/clients/${id}`, { [field]: value })
      setClient(c => ({ ...c, ...data }))
      toast.success('Запазено')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка при запазване')
      throw err
    }
  }

  if (loading) return <PageLoader />
  if (!client) return null

  const stats = client.stats || {}

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <Link to="/clients" className="text-muted hover:text-white text-sm">← Клиенти</Link>
          <div className="mt-1">
            {isOffice
              ? <div className="text-2xl font-bold [&_p]:text-2xl [&_p]:font-bold"><InlineEdit label="" value={client.name} onSave={v => patchField('name', v)} /></div>
              : <h1 className="text-2xl font-bold text-white">{client.name}</h1>}
          </div>
          <p className="text-muted text-sm mt-0.5">
            {client.city && `${client.city} · `}
            {client.phone && <a href={`tel:${client.phone}`} className="hover:text-accent">{client.phone}</a>}
            {!client.active && <span className="ml-2 badge bg-red-500/20 text-red-400">Неактивен</span>}
            {client.registry_checked_at && (
              <span className="ml-2 badge bg-green-500/15 text-green-400 inline-flex items-center gap-1" title={`Сверен с Търговския регистър на ${dateBg(client.registry_checked_at)}`}>
                <BadgeCheck className="w-3.5 h-3.5" /> Търговски регистър
              </span>
            )}
          </p>
        </div>
        {isOffice && (
          <div className="flex gap-2 flex-wrap">
            <button className="btn-primary" onClick={() => navigate(`/orders?new=1&client=${client.id}`)}>+ Нова поръчка</button>
            <button className="btn-secondary text-sm" onClick={() => setRegistryOpen(true)} title="Търси фирмата в Търговския регистър и попълни ЕИК, адрес, МОЛ…">
              <Building2 className="w-4 h-4" /> Търговски регистър
            </button>
            <button className="btn-secondary text-sm" onClick={() => setMergeOpen(true)} title="Обедини с дублиран запис на същия клиент">Обедини дубликати</button>
            <button className="btn-secondary text-sm" onClick={() => patchField('active', !client.active)}>
              {client.active ? 'Деактивирай' : 'Активирай'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: info + orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info card */}
          <div className="card">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Информация за клиента</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InlineEdit label="Телефон" value={client.phone}
                onSave={v => patchField('phone', v)} />
              <InlineEdit label="Email" value={client.email} type="email"
                onSave={v => patchField('email', v)} />
              <InlineEdit label="Град" value={client.city}
                onSave={v => patchField('city', v)} />
              <InlineEdit label="ЕИК" value={client.eik}
                onSave={v => patchField('eik', v)} />
              <InlineEdit label="МОЛ" value={client.mol}
                onSave={v => patchField('mol', v)} />
              <InlineEdit label="ДДС №" value={client.vat_number}
                onSave={v => patchField('vat_number', v)} />
              <InlineEdit label="Сайт" value={client.website}
                onSave={v => patchField('website', v)} />
              <div className="sm:col-span-2">
                <InlineEdit label="Официално наименование" value={client.legal_name}
                  onSave={v => patchField('legal_name', v)} />
              </div>
              <InlineSelect
                label="Откъде научи за нас"
                value={client.source}
                options={(optLists.source || []).map(o => [o.value, o.label])}
                onSave={v => patchField('source', v)}
              />
              <div className="sm:col-span-2">
                <InlineEdit label="Адрес" value={client.address}
                  onSave={v => patchField('address', v)} />
              </div>
              <div className="sm:col-span-2">
                <InlineEdit label="Бележки" value={client.notes} textarea
                  onSave={v => patchField('notes', v)} />
              </div>
            </div>
          </div>

          {/* Orders table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">История на поръчките</h2>
              {stats.total_orders > orders.length && (
                <Link to={`/orders?tab=all&q=${encodeURIComponent(client.name)}`} className="text-xs text-accent hover:underline">
                  Всички {stats.total_orders} →
                </Link>
              )}
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Номер</th>
                    <th>Статус</th>
                    <th className="hidden md:table-cell">Вид</th>
                    <th>Срок</th>
                    {canSeePrices && <th className="text-right">Сума</th>}
                    <th>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-muted">Няма поръчки</td>
                    </tr>
                  )}
                  {orders.map(o => (
                    <tr key={o.id} className="cursor-pointer"
                      onClick={() => navigate(`/orders/${o.id}`)}>
                      <td>
                        <span className="font-bold text-accent">{orderNo(o)}</span>
                        {o.client_ref && <span className="block text-[11px] text-purple-300">реф. {o.client_ref}</span>}
                        {o.is_urgent && <span className="ml-1 inline-block w-2 h-2 rounded-full bg-danger align-middle" title="Спешна" />}
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          <OrderStatusBadge status={o.status} />
                          <CategoryBadge category={o.order_category} />
                          {canSeePrices && o.payment_status !== 'платена' && o.order_category === 'нормална' && +o.sale_price > 0 && <PaymentStatusBadge status={o.payment_status} />}
                        </div>
                      </td>
                      <td className="hidden md:table-cell"><span className="text-xs text-muted">{TYPE_LABELS[o.order_type] || o.order_type}</span></td>
                      <td className="text-muted text-sm">{dateBg(o.deadline)}</td>
                      {canSeePrices && <td className="text-right text-gray-200">{eur(o.sale_price)}</td>}
                      <td className="text-muted text-xs">{dateBg(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: stats */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="card">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Статистика</h3>
            <div className="space-y-4">
              <div>
                <p className="text-muted text-xs uppercase tracking-wide">Поръчки</p>
                <p className="text-2xl font-bold text-white mt-0.5">{num(stats.total_orders, 0)}</p>
                {stats.active_orders > 0 && <p className="text-xs text-orange-400">{stats.active_orders} активни</p>}
              </div>
              {canSeePrices && (
                <>
                  <div>
                    <p className="text-muted text-xs uppercase tracking-wide">Оборот (с ДДС)</p>
                    <p className="text-2xl font-bold text-green-400 mt-0.5">{eur(stats.total_revenue, { dash: false })}</p>
                  </div>
                  <div>
                    <p className="text-muted text-xs uppercase tracking-wide">Средна поръчка</p>
                    <p className="text-xl font-bold text-white mt-0.5">{eur(stats.avg_order_value, { dash: false })}</p>
                  </div>
                  {+stats.unpaid_amount > 0 && (
                    <div>
                      <p className="text-muted text-xs uppercase tracking-wide">Дължи</p>
                      <p className="text-xl font-bold text-danger mt-0.5">{eur(stats.unpaid_amount)}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {canSeePrices && <ClientPrices clientId={client.id} />}

          {/* Quick info */}
          <div className="card text-sm space-y-3">
            <p className="text-muted text-xs uppercase tracking-wide">Бърза справка</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted">Активен</span>
                <span className={client.active ? 'text-green-400' : 'text-danger'}>
                  {client.active ? 'Да' : 'Не'}
                </span>
              </div>
              {client.eik && (
                <div className="flex justify-between">
                  <span className="text-muted">ЕИК</span>
                  <span className="text-white font-mono text-xs">{client.eik}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Откъде</span>
                <span className="text-white">{optLabel('source', client.source, SOURCE_LABELS)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Първа поръчка</span>
                <span className="text-muted text-xs">{dateBg(stats.first_order_at || client.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Последна поръчка</span>
                <span className="text-muted text-xs">{dateBg(stats.last_order_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <RegistryLookup open={registryOpen} onClose={() => setRegistryOpen(false)} client={client}
        onApply={async body => { const { data } = await api.patch(`/clients/${id}`, body); setClient(c => ({ ...c, ...data })) }} />
      {mergeOpen && <MergeModal open={mergeOpen} onClose={() => setMergeOpen(false)} client={client} onMerged={fetchClient} />}
    </div>
  )
}
