import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { bg } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { OrderStatusBadge } from '../components/ui/StatusBadge'
import { PageLoader } from '../components/ui/Spinner'
import { TYPE_LABELS, orderNo, isOverdue } from '../utils/labels'
import { Zap, AlertTriangle } from 'lucide-react'

const STATUS_DOT = {
  'НОВА':'bg-blue-400','МАТЕРИАЛИ':'bg-yellow-400','ПРОИЗВОДСТВО':'bg-orange-400',
  'ГОТОВА':'bg-green-400','ДОСТАВЕНА':'bg-gray-400','ОТКАЗАНА':'bg-red-400',
}

export default function Calendar() {
  const [month, setMonth] = useState(new Date())
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    setLoading(true)
    const from = format(startOfMonth(month), 'yyyy-MM-dd')
    const to = format(endOfMonth(month), 'yyyy-MM-dd')
    api.get('/orders', { params: { deadline_from: from, deadline_to: to, limit: 500 } })
      .then(r => setOrders(r.data.data.filter(o => o.deadline)))
      .catch(err => toast.error(err.response?.data?.error || 'Грешка при зареждане'))
      .finally(() => setLoading(false))
  }, [month])

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const firstDayOfWeek = (startOfMonth(month).getDay() + 6) % 7 // Mon=0

  // deadline is a plain 'YYYY-MM-DD' (DATE column) — compare as strings, no timezone shifts
  const ordersForDay = day => {
    const key = format(day, 'yyyy-MM-dd')
    return orders.filter(o => String(o.deadline).slice(0, 10) === key)
  }
  const selectedOrders = selected ? ordersForDay(selected) : []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Производствен календар</h1>
        <div className="flex items-center gap-2">
          <button className="btn-secondary px-3" onClick={() => setMonth(m => subMonths(m, 1))}>‹</button>
          <span className="text-white font-semibold min-w-36 text-center capitalize">
            {format(month, 'MMMM yyyy', { locale: bg })}
          </span>
          <button className="btn-secondary px-3" onClick={() => setMonth(m => addMonths(m, 1))}>›</button>
          <button className="btn-secondary text-xs" onClick={() => setMonth(new Date())}>Днес</button>
        </div>
      </div>

      {loading ? <PageLoader /> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar grid */}
          <div className="lg:col-span-2 card p-0 overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {['Пон','Вт','Ср','Чет','Пет','Съб','Нед'].map(d => (
                <div key={d} className="py-2 text-center text-xs text-muted font-medium">{d}</div>
              ))}
            </div>
            {/* Day cells */}
            <div className="grid grid-cols-7">
              {Array(firstDayOfWeek).fill(null).map((_, i) => (
                <div key={`e${i}`} className="h-16 border-r border-b border-border/30 bg-surface/30" />
              ))}
              {days.map(day => {
                const dayOrders = ordersForDay(day)
                const isSelected = selected && isSameDay(day, selected)
                const hasOverdue = dayOrders.some(isOverdue)
                const hasUrgent = dayOrders.some(o => o.is_urgent)
                return (
                  <div key={day.toISOString()}
                    onClick={() => setSelected(isSelected ? null : day)}
                    className={`min-h-[4.5rem] border-r border-b border-border/30 p-1.5 cursor-pointer transition-colors
                      ${isToday(day) ? 'bg-accent/10' : 'hover:bg-surface/60'}
                      ${isSelected ? 'ring-1 ring-inset ring-accent bg-accent/5' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
                        ${isToday(day) ? 'bg-accent text-white' : 'text-muted'}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="flex gap-0.5">
                        {hasUrgent && <Zap className="w-3 h-3 text-yellow-400" strokeWidth={2.25} aria-label="Спешна" />}
                        {hasOverdue && <span className="text-red-400 text-xs leading-none">!</span>}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      {dayOrders.slice(0, 2).map(o => (
                        <div key={o.id} className="flex items-center gap-1 min-w-0">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[o.status] || 'bg-gray-400'}`} />
                          <span className="text-xs text-gray-400 truncate leading-tight">{o.client_name || orderNo(o)}</span>
                        </div>
                      ))}
                      {dayOrders.length > 2 && (
                        <span className="text-xs text-muted">+{dayOrders.length - 2} още</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Day detail / legend */}
          <div className="space-y-4">
            {selected ? (
              <div className="card">
                <h3 className="font-semibold text-white mb-3 capitalize">
                  {format(selected, 'EEEE, d MMMM', { locale: bg })}
                </h3>
                {selectedOrders.length === 0 ? (
                  <p className="text-muted text-sm">Няма поръчки с дедлайн за този ден</p>
                ) : selectedOrders.map(o => {
                  const overdue = isOverdue(o)
                  return (
                    <Link key={o.id} to={`/orders/${o.id}`}
                      className="block py-2.5 border-b border-border/40 last:border-0 hover:bg-surface/40 -mx-2 px-2 rounded-lg transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white text-sm">{orderNo(o)}</span>
                        <OrderStatusBadge status={o.status} />
                      </div>
                      <p className="text-sm text-gray-300 mt-0.5">{o.client_name}</p>
                      {o.order_type && <p className="text-xs text-muted mt-0.5">{TYPE_LABELS[o.order_type] || o.order_type}</p>}
                      <div className="flex gap-2 mt-1">
                        {o.is_urgent && <span className="text-xs text-yellow-400 inline-flex items-center gap-1"><Zap className="w-3 h-3" strokeWidth={2} />Спешна</span>}
                        {overdue && <span className="text-xs text-red-400 inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" strokeWidth={2} />Просрочена</span>}
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="card">
                <p className="text-muted text-sm">Кликнете върху ден за да видите поръчките с дедлайн</p>
              </div>
            )}

            {/* Summary */}
            <div className="card">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Месечен преглед</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Общо с дедлайн</span>
                  <span className="text-white font-medium">{orders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">В производство</span>
                  <span className="text-orange-400 font-medium">{orders.filter(o=>o.status==='ПРОИЗВОДСТВО').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Готови</span>
                  <span className="text-green-400 font-medium">{orders.filter(o=>o.status==='ГОТОВА').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Спешни</span>
                  <span className="text-danger font-medium">{orders.filter(o=>o.is_urgent).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
