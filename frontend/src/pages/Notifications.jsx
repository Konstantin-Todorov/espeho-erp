import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { formatDistanceToNow, format, parseISO } from 'date-fns'
import { bg } from 'date-fns/locale'
import { PageLoader } from '../components/ui/Spinner'

const TYPE_ICONS = {
  order_ready:      '✅',
  order_production: '⚙️',
  order_cancelled:  '❌',
  order_delivered:  '🚚',
  low_stock:        '📦',
  overdue:          '⚠️',
  defect:           '🔴',
}

const TYPE_LABELS = {
  order_ready:      'Готова поръчка',
  order_production: 'Производство',
  order_cancelled:  'Отказана',
  order_delivered:  'Доставена',
  low_stock:        'Нисък склад',
  overdue:          'Просрочена',
  defect:           'Брак',
}

const TYPE_COLORS = {
  order_ready:      'text-green-400',
  order_production: 'text-orange-400',
  order_cancelled:  'text-red-400',
  order_delivered:  'text-blue-400',
  low_stock:        'text-yellow-400',
  overdue:          'text-red-400',
  defect:           'text-red-500',
}

export default function Notifications() {
  const [notifications, setNots] = useState([])
  const [loading, setLoading]    = useState(true)
  const [unread, setUnread]      = useState(0)
  const [total, setTotal]        = useState(0)
  const [filter, setFilter]      = useState('all') // all | unread
  const [typeFilter, setTypeFilter] = useState('')
  const navigate = useNavigate()

  const fetchNots = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: 100 })
      if (filter === 'unread') params.set('unread_only', 'true')
      const { data } = await api.get(`/notifications?${params}`)
      setNots(data.notifications)
      setUnread(data.unread)
      setTotal(data.total)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [filter])

  useEffect(() => { fetchNots() }, [fetchNots])

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`).catch(() => {})
    setNots(ns => ns.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    setUnread(u => Math.max(0, u - 1))
  }

  const markAllRead = async () => {
    await api.patch('/notifications/read-all').catch(() => {})
    setNots(ns => ns.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })))
    setUnread(0)
  }

  const handleClick = (n) => {
    if (!n.read_at) markRead(n.id)
    if (n.link) navigate(n.link)
  }

  const allTypes = [...new Set(notifications.map(n => n.type))]
  const filtered = typeFilter ? notifications.filter(n => n.type === typeFilter) : notifications

  // Group by date
  const grouped = filtered.reduce((acc, n) => {
    const day = format(parseISO(n.created_at), 'd MMMM yyyy', { locale: bg })
    if (!acc[day]) acc[day] = []
    acc[day].push(n)
    return acc
  }, {})

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Известия</h1>
          <p className="text-sm text-muted mt-0.5">{total} общо · {unread} непрочетени</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            className="btn-secondary text-sm">
            Маркирай всички прочетени
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex rounded-lg overflow-hidden border border-border">
          {[['all','Всички'], ['unread','Непрочетени']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === val ? 'bg-accent text-white' : 'text-muted hover:text-white hover:bg-border'
              }`}>
              {label}
              {val === 'unread' && unread > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-danger text-white text-xs rounded-full">{unread}</span>
              )}
            </button>
          ))}
        </div>

        {allTypes.length > 1 && (
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="input py-1.5 text-sm">
            <option value="">Всички типове</option>
            {allTypes.map(t => (
              <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>
            ))}
          </select>
        )}
      </div>

      {/* List */}
      {loading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🔔</div>
          <p className="text-lg text-white font-medium">Няма известия</p>
          <p className="text-sm text-muted mt-1">
            {filter === 'unread' ? 'Всички са прочетени' : 'Все още нямате известия'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([day, items]) => (
            <div key={day}>
              <p className="text-xs text-muted uppercase tracking-wide font-medium mb-2 px-1">{day}</p>
              <div className="card p-0 overflow-hidden divide-y divide-border/50">
                {items.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`flex gap-4 px-4 py-3.5 cursor-pointer hover:bg-border/20 transition-colors ${
                      !n.read_at ? 'bg-accent/5' : ''
                    }`}
                  >
                    <div className="text-2xl flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type] || '🔔'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={`text-xs font-medium ${TYPE_COLORS[n.type] || 'text-muted'} mr-2`}>
                            {TYPE_LABELS[n.type] || n.type}
                          </span>
                          <p className={`text-sm leading-snug inline ${!n.read_at ? 'text-white font-medium' : 'text-gray-300'}`}>
                            {n.title}
                          </p>
                        </div>
                        {!n.read_at && (
                          <button
                            onClick={e => { e.stopPropagation(); markRead(n.id) }}
                            className="flex-shrink-0 w-2 h-2 rounded-full bg-accent mt-1.5"
                            title="Маркирай прочетено"
                          />
                        )}
                      </div>
                      {n.body && <p className="text-xs text-muted mt-0.5">{n.body}</p>}
                      <p className="text-xs text-muted/60 mt-1">
                        {formatDistanceToNow(parseISO(n.created_at), { addSuffix: true, locale: bg })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
