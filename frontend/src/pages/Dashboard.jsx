import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { OrderStatusBadge, UrgentBadge } from '../components/ui/StatusBadge'
import { PageLoader } from '../components/ui/Spinner'
import { format, parseISO } from 'date-fns'
import { bg } from 'date-fns/locale'

const STATUS_COLORS = {
  'НОВА':'#3b82f6','МАТЕРИАЛИ':'#f59e0b','ПРОИЗВОДСТВО':'#f97316',
  'ГОТОВА':'#22c55e','ДОСТАВЕНА':'#6b7280','ОТКАЗАНА':'#ef4444',
}

function StatCard({ label, value, sub, color = 'text-white', icon }) {
  return (
    <div className="card flex items-start gap-4">
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
          </svg>
        </div>
      )}
      <div>
        <p className="text-xs text-muted uppercase tracking-wide mb-1">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// Production dashboard
function ProductionDashboard() {
  const [myWork, setMyWork] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/production/my-work')
      .then(res => setMyWork(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Моята работа днес</h1>
      {myWork.length === 0 ? (
        <div className="card text-center py-12 text-muted">
          <p className="text-lg">Няма възложени задачи</p>
          <p className="text-sm mt-1">Всички текущи етапи са завършени</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myWork.map(item => (
            <Link key={item.id} to={`/orders/${item.order_id}`}
              className="card block hover:border-accent/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white">Поръчка #{item.order_number}</span>
                    {item.is_urgent && <UrgentBadge />}
                  </div>
                  <p className="text-sm text-muted">{item.client_name}</p>
                  <p className="text-sm text-gray-300 mt-1">Етап: <strong>{item.stage_name}</strong></p>
                </div>
                <div className="text-right">
                  <span className="badge bg-orange-500/20 text-orange-400">{item.status === 'В_ПРОЦЕС' ? 'В процес' : 'Чакащ'}</span>
                  {item.deadline && (
                    <p className={`text-xs mt-1 ${new Date(item.deadline) < new Date() ? 'text-danger' : 'text-muted'}`}>
                      До: {format(parseISO(item.deadline), 'd MMM', { locale: bg })}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// Admin/Office dashboard
function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { isAdmin } = useAuth()

  useEffect(() => {
    api.get('/reports/dashboard')
      .then(res => setData(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />
  if (!data) return null

  const statusMap = {}
  data.orderStats.forEach(s => { statusMap[s.status] = s.count })
  const pieData = data.orderStats.filter(s => !['ДОСТАВЕНА','ОТКАЗАНА'].includes(s.status))

  const margin = data.revenue.revenue_delivered - data.revenue.cost_delivered
  const marginPct = data.revenue.revenue_delivered > 0
    ? ((margin / data.revenue.revenue_delivered) * 100).toFixed(1)
    : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Дашборд</h1>
        <p className="text-sm text-muted">{format(new Date(), 'EEEE, d MMMM yyyy', { locale: bg })}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Поръчки този месец"
          value={data.revenue.total_orders}
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
        {isAdmin && (
          <>
            <StatCard
              label="Приход (доставени)"
              value={`${Number(data.revenue.revenue_delivered).toLocaleString()} лв`}
              icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              color="text-green-400"
            />
            <StatCard
              label="Марж"
              value={`${marginPct}%`}
              sub={`${margin.toFixed(0)} лв чиста печалба`}
              color={margin > 0 ? 'text-green-400' : 'text-danger'}
              icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </>
        )}
        <StatCard
          label="Брак този месец"
          value={data.defects.count}
          sub={isAdmin ? `${data.defects.total_cost} лв` : undefined}
          color={data.defects.count > 5 ? 'text-danger' : 'text-white'}
          icon="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
        />
        {data.lowStockCount > 0 && (
          <StatCard
            label="Материали под минимум"
            value={data.lowStockCount}
            color="text-yellow-400"
            icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Orders by status */}
        <div className="card">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Статус поръчки</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70} label={({status, count}) => `${status}: ${count}`} labelLine={false}>
                {pieData.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background:'#181c27', border:'1px solid #252a3a', borderRadius:8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Orders last 30 days */}
        <div className="card lg:col-span-2">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Поръчки последните 30 дни</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.ordersByDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252a3a" />
              <XAxis dataKey="day" tick={{ fill:'#6b7280', fontSize:11 }}
                tickFormatter={d => format(parseISO(d), 'd MMM', { locale: bg })} />
              <YAxis tick={{ fill:'#6b7280', fontSize:11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background:'#181c27', border:'1px solid #252a3a', borderRadius:8 }}
                labelFormatter={d => format(parseISO(d), 'd MMMM', { locale: bg })}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} name="Поръчки" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Активни поръчки</h2>
          <Link to="/orders" className="text-xs text-accent hover:underline">Виж всички →</Link>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Клиент</th><th>Статус</th><th>Краен срок</th>
                {isAdmin && <th className="text-right">Цена</th>}
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map(o => {
                const isOverdue = o.deadline && new Date(o.deadline) < new Date() && !['ГОТОВА','ДОСТАВЕНА'].includes(o.status)
                return (
                  <tr key={o.id}>
                    <td>
                      <Link to={`/orders/${o.id}`} className="text-accent hover:underline font-medium">
                        #{o.order_number}
                      </Link>
                      {o.is_urgent && <span className="ml-2 text-xs text-danger">●</span>}
                    </td>
                    <td>{o.client_name}</td>
                    <td><OrderStatusBadge status={o.status} /></td>
                    <td className={isOverdue ? 'text-danger font-medium' : 'text-muted'}>
                      {o.deadline ? format(parseISO(o.deadline), 'd MMM yyyy', { locale: bg }) : '—'}
                      {isOverdue && ' ⚠'}
                    </td>
                    {isAdmin && <td className="text-right text-gray-300">{o.sale_price ? `${o.sale_price} лв` : '—'}</td>}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()

  if (user?.role === 'production') return <ProductionDashboard />
  if (user?.role === 'warehouse') {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Склад — начало</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/warehouse" className="card hover:border-accent/50 transition-colors block text-center py-8">
            <svg className="w-8 h-8 text-accent mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="font-semibold text-white">Складови наличности</p>
          </Link>
          <Link to="/warehouse?tab=movements" className="card hover:border-accent/50 transition-colors block text-center py-8">
            <svg className="w-8 h-8 text-accent mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <p className="font-semibold text-white">Движения на материали</p>
          </Link>
        </div>
      </div>
    )
  }

  return <AdminDashboard />
}
