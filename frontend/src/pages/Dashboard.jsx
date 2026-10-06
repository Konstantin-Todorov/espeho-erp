import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { OrderStatusBadge } from '../components/ui/StatusBadge'
import { orderNo, eur, eurRound, num, dateBg, isOverdue } from '../utils/labels'
import Board from './Board'
import { PageLoader } from '../components/ui/Spinner'
import TooltipUI from '../components/ui/Tooltip'
import { format, parseISO } from 'date-fns'
import { bg } from 'date-fns/locale'

const STATUS_COLORS = {
  'НОВА':'#3b82f6','МАТЕРИАЛИ':'#f59e0b','ПРОИЗВОДСТВО':'#f97316',
  'ГОТОВА':'#22c55e','ДОСТАВЕНА':'#6b7280','ОТКАЗАНА':'#ef4444',
}

function StatCard({ label, value, sub, color = 'text-white', icon, tooltip, delta, to }) {
  const card = (
    <div className={`card flex items-start gap-4 h-full ${to ? 'hover:border-accent/50 transition-colors' : ''}`}>
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
          </svg>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
          {tooltip && (
            <TooltipUI text={tooltip}>
              <svg className="w-3.5 h-3.5 text-muted/60 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </TooltipUI>
          )}
        </div>
        <p className={`text-xl xl:text-2xl font-bold whitespace-nowrap tabular-nums ${color}`}>{value}</p>
        {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
        {delta !== undefined && (
          <p className={`text-xs mt-0.5 font-medium ${delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-muted'}`}>
            {delta > 0 ? '↑' : delta < 0 ? '↓' : '='} {Math.abs(delta)}% спрямо миналия месец
          </p>
        )}
      </div>
    </div>
  )
  return to ? <Link to={to} className="block">{card}</Link> : card
}

// Admin/Office dashboard
const ICONS = {
  prod: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  ready: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  late: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  week: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  money: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  trend: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  area: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z M4 12h16 M12 4v16',
  unpaid: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
  quote: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  truck: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h1m8 0H9m4 0h5m-9 0H5m9-10v0a4 4 0 014 4v6',
  defect: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z',
  box: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
}

function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { isAdmin, canSeePrices } = useAuth()

  useEffect(() => {
    api.get('/reports/dashboard')
      .then(res => setData(res.data))
      .catch(() => toast.error('Грешка при зареждане на началната страница'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />
  if (!data) return null

  const statusMap = {}
  data.orderStats.forEach(s => { statusMap[s.status] = s.count })
  const pieData = data.orderStats.filter(s => !['ДОСТАВЕНА','ОТКАЗАНА'].includes(s.status))

  const inProduction = statusMap['ПРОИЗВОДСТВО'] || 0
  const readyForDelivery = statusMap['ГОТОВА'] || 0
  const overdueCount = data.urgentActive?.overdue || 0
  const dueThisWeek = data.urgentActive?.due_this_week || 0
  const ytd = data.ytd || {}
  const ytdMarginPct = +ytd.revenue_net > 0 ? (+ytd.margin / +ytd.revenue_net * 100).toFixed(1) : null
  const monthly = (data.monthly || []).map(m => ({ ...m, revenue: +m.revenue, m2: +m.m2 }))
  const year = new Date().getFullYear()

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Начало</h1>
          <p className="text-sm text-muted">{format(new Date(), 'EEEE, d MMMM yyyy', { locale: bg })}</p>
        </div>
        <Link to="/board" className="btn-primary">Работен ден →</Link>
      </div>

      {/* Row 1 — what needs attention now */}
      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Сега</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard to="/orders?status=ПРОИЗВОДСТВО" label="В производство" value={inProduction} color="text-orange-400"
          tooltip="Поръчки, които се работят в цеха в момента" icon={ICONS.prod} />
        <StatCard to="/orders?status=ГОТОВА" label="Готови за предаване" value={readyForDelivery} color="text-green-400"
          tooltip="Завършени — чакат клиента да ги вземе или доставка" icon={ICONS.ready} />
        <StatCard to="/orders?tab=active" label="Просрочени" value={overdueCount}
          color={overdueCount > 0 ? 'text-danger' : 'text-muted'}
          tooltip="Активни поръчки с изминал срок" icon={ICONS.late} />
        <StatCard to="/calendar" label="Срок тази седмица" value={dueThisWeek}
          color={dueThisWeek > 3 ? 'text-yellow-400' : 'text-white'}
          tooltip="Поръчки със срок в следващите 7 дни" icon={ICONS.week} />
      </div>

      {/* Row 2 — the year so far (money only for admin/office) */}
      {canSeePrices && (
        <>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">{year} до днес</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard to="/reports" label="Приход" value={eurRound(ytd.revenue)} color="text-green-400"
              sub={`${num(ytd.orders, 0)} предадени поръчки · с ДДС`}
              tooltip="Предадени поръчки (без гаранции/вътрешни), по дата на предаване" icon={ICONS.money} />
            <StatCard to="/reports" label="Марж" value={ytdMarginPct !== null ? `${ytdMarginPct}%` : '—'}
              sub={`${eurRound(ytd.margin)} без ДДС`}
              color={+ytd.margin > 0 ? 'text-green-400' : 'text-danger'}
              tooltip="(Приход без ДДС − себестойност) / приход без ДДС" icon={ICONS.trend} />
            <StatCard to="/reports" label="Произведени м²" value={num(ytd.m2, 0)} color="text-accent"
              sub={+ytd.m2 > 0 ? `≈ ${eur(+ytd.revenue / +ytd.m2, { dash: false })} на м²` : ''}
              tooltip="Квадратура на предадените поръчки" icon={ICONS.area} />
            <StatCard to="/orders?tab=unpaid" label="Неплатени" value={eurRound(data.receivables?.amount)}
              sub={`${num(data.receivables?.count, 0)} поръчки`}
              color={+data.receivables?.amount > 0 ? 'text-yellow-400' : 'text-muted'}
              tooltip="Поръчки (без отказаните), които не са платени изцяло" icon={ICONS.unpaid} />
          </div>
        </>
      )}

      {/* Row 3 — follow-ups */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard to="/quotations" label="Оферти чакат отговор" value={data.quotationsPending ?? 0}
          color={(data.quotationsPending ?? 0) > 0 ? 'text-accent' : 'text-muted'} icon={ICONS.quote} />
        <StatCard to="/deliveries" label="Планирани доставки" value={data.deliveriesPending ?? 0}
          color={(data.deliveriesPending ?? 0) > 0 ? 'text-blue-400' : 'text-muted'} icon={ICONS.truck} />
        <StatCard to="/defects" label="Брак този месец" value={data.defects.count}
          sub={canSeePrices && +data.defects.total_cost > 0 ? `${eur(data.defects.total_cost)} загуба` : ''}
          color={data.defects.count > 5 ? 'text-danger' : 'text-white'} icon={ICONS.defect} />
        {isAdmin || data.lowStockCount > 0 ? (
          <StatCard to="/warehouse?tab=low-stock" label="Материали под минимум" value={data.lowStockCount}
            color={data.lowStockCount > 0 ? 'text-yellow-400' : 'text-muted'} icon={ICONS.box} />
        ) : <div className="hidden lg:block" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Активни поръчки по статус</h2>
          {pieData.length === 0 ? (
            <p className="text-center text-muted text-sm py-12">Няма активни поръчки</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={65} innerRadius={30}>
                    {pieData.map(entry => <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#6b7280'} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background:'var(--chart-bg)', border:'1px solid var(--chart-border)', borderRadius:8, fontSize:12 }}
                    formatter={(val, name) => [`${val} поръчки`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1">
                {pieData.map(entry => (
                  <Link key={entry.status} to={`/orders?status=${entry.status}`} className="flex items-center gap-1.5 text-xs hover:text-accent">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[entry.status] || '#6b7280' }} />
                    <span className="text-muted">{entry.status}</span>
                    <span className="text-white font-medium ml-auto">{entry.count}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="card lg:col-span-2">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">
            {canSeePrices ? 'Приход по месеци (с ДДС)' : 'Предадени поръчки по месеци'}
          </h2>
          {monthly.length === 0 ? (
            <p className="text-center text-muted text-sm py-16">Още няма предадени поръчки за последните 12 месеца</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthly} margin={{ top: 0, right: 0, left: canSeePrices ? 10 : -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill:'var(--chart-tick)', fontSize:11 }}
                  tickFormatter={d => format(parseISO(d), 'LLL yy', { locale: bg })} />
                <YAxis tick={{ fill:'var(--chart-tick)', fontSize:11 }} allowDecimals={false}
                  tickFormatter={v => canSeePrices ? `${Math.round(v / 1000)}k` : v} />
                <Tooltip contentStyle={{ background:'var(--chart-bg)', border:'1px solid var(--chart-border)', borderRadius:8, fontSize:12 }}
                  labelFormatter={d => format(parseISO(d), 'LLLL yyyy', { locale: bg })}
                  formatter={(v, name, item) => name === 'revenue'
                    ? [`${eur(v, { dash: false })} · ${num(item.payload.m2, 0)} м² · ${item.payload.orders} поръчки`, 'Приход']
                    : [v, 'Поръчки']} />
                <Bar dataKey={canSeePrices ? 'revenue' : 'orders'} fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Active orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Активни поръчки — по срок</h2>
          <Link to="/orders" className="text-xs text-accent hover:underline">Виж всички →</Link>
        </div>
        {data.recentOrders.length === 0 ? (
          <p className="text-center text-muted text-sm py-8">Няма активни поръчки. Създайте нова с бутона „+ Нов“.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Номер</th><th>Клиент</th><th>Статус</th><th>Срок</th>
                  {canSeePrices && <th className="text-right">Сума</th>}
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map(o => {
                  const overdue = isOverdue(o)
                  return (
                    <tr key={o.id}>
                      <td>
                        <Link to={`/orders/${o.id}`} className="text-accent hover:underline font-medium">{orderNo(o)}</Link>
                        {o.is_urgent && <span className="ml-2 text-xs text-danger">●</span>}
                      </td>
                      <td>{o.client_name}</td>
                      <td><OrderStatusBadge status={o.status} /></td>
                      <td className={overdue ? 'text-danger font-medium' : 'text-muted'}>
                        {dateBg(o.deadline)}{overdue && ' ⚠'}
                      </td>
                      {canSeePrices && <td className="text-right text-gray-300">{eur(o.sale_price)}</td>}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()

  // Each role starts where its work is: shop floor → tasks, office → the day's board
  if (user?.role === 'production') return <Navigate to="/production" replace />
  if (user?.role === 'office') return <Board />
  if (user?.role === 'warehouse') {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Склад — начало</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/warehouse?new=receive" className="card hover:border-accent/50 transition-colors block text-center py-8">
            <p className="text-3xl mb-2">📥</p>
            <p className="font-semibold text-white">Приеми стока</p>
          </Link>
          <Link to="/deliveries" className="card hover:border-accent/50 transition-colors block text-center py-8">
            <p className="text-3xl mb-2">🚚</p>
            <p className="font-semibold text-white">Доставки</p>
          </Link>
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
