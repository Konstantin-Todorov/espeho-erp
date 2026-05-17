import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { OrderStatusBadge } from '../components/ui/StatusBadge'
import { PageLoader } from '../components/ui/Spinner'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'
import { bg } from 'date-fns/locale'

const SOURCE_LABELS = {
  phone: 'Телефон', email: 'Email', office: 'Офис',
  website: 'Уебсайт', referral: 'Препоръка', other: 'Друго',
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
          <button onClick={save} disabled={saving} className="btn-primary text-xs py-1 px-2">
            {saving ? '...' : '✓'}
          </button>
          <button onClick={cancel} className="btn-secondary text-xs py-1 px-2">✕</button>
        </div>
      ) : (
        <p
          className="text-white text-sm cursor-pointer hover:text-accent transition-colors group flex items-center gap-1 min-h-[1.5rem]"
          onClick={start}
        >
          {value || <span className="text-muted italic">—</span>}
          <svg className="w-3 h-3 text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
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
          <button onClick={() => setEditing(false)} className="btn-secondary text-xs py-1 px-2">✕</button>
        </div>
      ) : (
        <p
          className="text-white text-sm cursor-pointer hover:text-accent transition-colors group flex items-center gap-1 min-h-[1.5rem]"
          onClick={() => { setVal(value || ''); setEditing(true) }}
        >
          {options.find(([v]) => v === value)?.[1] || value || <span className="text-muted italic">—</span>}
          <svg className="w-3 h-3 text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </p>
      )}
    </div>
  )
}

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin, isOffice } = useAuth()
  const [client, setClient] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

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
      setClient(data)
      toast.success('Запазено')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка при запазване')
      throw err
    }
  }

  if (loading) return <PageLoader />
  if (!client) return null

  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.sale_price || 0), 0)
  const avgValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <Link to="/clients" className="text-muted hover:text-white text-sm">← Клиенти</Link>
          <h1 className="text-2xl font-bold text-white mt-1">{client.name}</h1>
          <p className="text-muted text-sm mt-0.5">
            {client.city && `${client.city} · `}
            {SOURCE_LABELS[client.source] || client.source}
            {!client.active && <span className="ml-2 badge bg-red-500/20 text-red-400">Неактивен</span>}
          </p>
        </div>
        {isOffice && (
          <button
            className="btn-secondary text-sm"
            onClick={() => patchField('active', !client.active)}
          >
            {client.active ? 'Деактивирай' : 'Активирай'}
          </button>
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
              <InlineSelect
                label="Канал"
                value={client.source}
                options={Object.entries(SOURCE_LABELS)}
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
            <h2 className="text-lg font-semibold text-white mb-3">История на поръчките</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Статус</th>
                    <th>Тип</th>
                    <th>Краен срок</th>
                    <th>Цена</th>
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
                        <span className="font-bold text-accent">#{o.order_number}</span>
                        {o.is_urgent && <span className="ml-1 text-danger text-xs">●</span>}
                      </td>
                      <td><OrderStatusBadge status={o.status} /></td>
                      <td><span className="text-xs text-muted">{o.order_type}</span></td>
                      <td className="text-muted text-sm">
                        {o.deadline ? format(parseISO(o.deadline), 'd MMM yyyy', { locale: bg }) : '—'}
                      </td>
                      <td className="text-muted">
                        {o.sale_price ? `${Number(o.sale_price).toLocaleString()} €` : '—'}
                      </td>
                      <td className="text-muted text-xs">
                        {format(parseISO(o.created_at), 'd MMM yyyy', { locale: bg })}
                      </td>
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
                <p className="text-muted text-xs uppercase tracking-wide">Общо поръчки</p>
                <p className="text-2xl font-bold text-white mt-0.5">{totalOrders}</p>
              </div>
              {isAdmin && (
                <>
                  <div>
                    <p className="text-muted text-xs uppercase tracking-wide">Общ приход</p>
                    <p className="text-2xl font-bold text-green-400 mt-0.5">
                      {totalRevenue.toLocaleString('bg-BG', { minimumFractionDigits: 2 })} €
                    </p>
                  </div>
                  <div>
                    <p className="text-muted text-xs uppercase tracking-wide">Средна поръчка</p>
                    <p className="text-xl font-bold text-white mt-0.5">
                      {avgValue.toLocaleString('bg-BG', { minimumFractionDigits: 2 })} €
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

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
                <span className="text-muted">Канал</span>
                <span className="text-white">{SOURCE_LABELS[client.source] || client.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Клиент от</span>
                <span className="text-muted text-xs">
                  {client.created_at ? format(parseISO(client.created_at), 'd MMM yyyy', { locale: bg }) : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
