import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, addMonths, subMonths } from 'date-fns'
import { bg } from 'date-fns/locale'
import { OrderStatusBadge } from '../components/ui/StatusBadge'
import { PageLoader } from '../components/ui/Spinner'

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
    api.get(`/orders?from=${from}&to=${to}&limit=200`)
      .then(r => setOrders(r.data.data.filter(o => o.deadline)))
      .finally(() => setLoading(false))
  }, [month])

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const firstDayOfWeek = (startOfMonth(month).getDay() + 6) % 7 // Mon=0

  const ordersForDay = day => orders.filter(o => o.deadline && isSameDay(parseISO(o.deadline), day))
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
                return (
                  <div key={day.toISOString()}
                    onClick={() => setSelected(isSelected ? null : day)}
                    className={`h-16 border-r border-b border-border/30 p-1 cursor-pointer transition-colors
                      ${isToday(day) ? 'bg-accent/10' : 'hover:bg-surface/60'}
                      ${isSelected ? 'ring-1 ring-inset ring-accent' : ''}`}>
                    <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full
                      ${isToday(day) ? 'bg-accent text-white' : 'text-muted'}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-0.5">
                      {dayOrders.slice(0, 2).map(o => (
                        <div key={o.id} className="flex items-center gap-1 truncate">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[o.status] || 'bg-gray-400'}`} />
                          <span className="text-xs text-gray-400 truncate">#{o.order_number}</span>
                        </div>
                      ))}
                      {dayOrders.length > 2 && (
                        <span className="text-xs text-muted">+{dayOrders.length - 2}</span>
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
                  <p className="text-muted text-sm">Няма поръчки с дедлайн</p>
                ) : selectedOrders.map(o => (
                  <Link key={o.id} to={`/orders/${o.id}`}
                    className="block py-2 border-b border-border/40 last:border-0 hover:text-accent transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white text-sm">#{o.order_number}</span>
                      <OrderStatusBadge status={o.status} />
                    </div>
                    <p className="text-xs text-muted mt-0.5">{o.client_name}</p>
                    {o.is_urgent && <span className="text-xs text-danger">⚡ Спешна</span>}
                  </Link>
                ))}
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
