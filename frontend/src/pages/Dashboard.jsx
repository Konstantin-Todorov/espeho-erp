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
import {
  Factory, CheckCircle2, Clock, CalendarDays, Banknote, TrendingUp, Grid2x2, Wallet, FileText,
  Truck, AlertTriangle, Package, PackagePlus, ArrowUpDown, Info,
} from 'lucide-react'

const STATUS_COLORS = {
  'НОВА':'#3b82f6','МАТЕРИАЛИ':'#f59e0b','ПРОИЗВОДСТВО':'#f97316',
  'ГОТОВА':'#22c55e','ДОСТАВЕНА':'#6b7280','ОТКАЗАНА':'#ef4444',
}

function StatCard({ label, value, sub, color = 'text-white', icon: Icon, tooltip, delta, to }) {
  const card = (
    <div className={`card flex items-start gap-4 h-full ${to ? 'hover:border-accent/50 transition-colors' : ''}`}>
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-accent" strokeWidth={1.75} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
          {tooltip && (
            <TooltipUI text={tooltip}>
              <Info className="w-3.5 h-3.5 text-muted/60 cursor-help" strokeWidth={2} />
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
          tooltip="Поръчки, които се работят в цеха в момента" icon={Factory} />
        <StatCard to="/orders?status=ГОТОВА" label="Готови за предаване" value={readyForDelivery} color="text-green-400"
          tooltip="Завършени — чакат клиента да ги вземе или доставка" icon={CheckCircle2} />
        <StatCard to="/orders?tab=active" label="Просрочени" value={overdueCount}
          color={overdueCount > 0 ? 'text-danger' : 'text-muted'}
          tooltip="Активни поръчки с изминал срок" icon={Clock} />
        <StatCard to="/calendar" label="Срок тази седмица" value={dueThisWeek}
          color={dueThisWeek > 3 ? 'text-yellow-400' : 'text-white'}
          tooltip="Поръчки със срок в следващите 7 дни" icon={CalendarDays} />
      </div>

      {/* Row 2 — the year so far (money only for admin/office) */}
      {canSeePrices && (
        <>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">{year} до днес</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard to="/reports" label="Приход" value={eurRound(ytd.revenue)} color="text-green-400"
              sub={`${num(ytd.orders, 0)} предадени поръчки · с ДДС`}
              tooltip="Предадени поръчки (без гаранции/вътрешни), по дата на предаване" icon={Banknote} />
            {ytd.margin !== undefined ? (
              <StatCard to="/reports?tab=paid" label="Марж" value={ytdMarginPct !== null ? `${ytdMarginPct}%` : '—'}
                sub={`${eurRound(ytd.margin)} без ДДС`}
                color={+ytd.margin > 0 ? 'text-green-400' : 'text-danger'}
                tooltip="(Приход без ДДС − себестойност) / приход без ДДС" icon={TrendingUp} />
            ) : (
              <StatCard to="/orders?tab=all" label="Средна поръчка" value={+ytd.orders > 0 ? eurRound(+ytd.revenue / +ytd.orders) : '—'}
                sub="с ДДС" icon={TrendingUp} />
            )}
            <StatCard to="/reports" label="Произведени м²" value={num(ytd.m2, 0)} color="text-accent"
              sub={+ytd.m2 > 0 ? `≈ ${eur(+ytd.revenue / +ytd.m2, { dash: false })} на м²` : ''}
              tooltip="Квадратура на предадените поръчки" icon={Grid2x2} />
            <StatCard to="/orders?tab=unpaid" label="Дължат клиенти" value={eurRound(data.receivables?.amount)}
              sub={`${num(data.receivables?.count, 0)} поръчки`}
              color={+data.receivables?.amount > 0 ? 'text-yellow-400' : 'text-muted'}
              tooltip="Предадени на клиента, но не платени изцяло" icon={Wallet} />
          </div>
        </>
      )}

      {/* Row 3 — follow-ups */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard to="/quotations" label="Оферти чакат отговор" value={data.quotationsPending ?? 0}
          color={(data.quotationsPending ?? 0) > 0 ? 'text-accent' : 'text-muted'} icon={FileText} />
        <StatCard to="/deliveries" label="Планирани доставки" value={data.deliveriesPending ?? 0}
          color={(data.deliveriesPending ?? 0) > 0 ? 'text-blue-400' : 'text-muted'} icon={Truck} />
        <StatCard to="/defects" label="Брак този месец" value={data.defects.count}
          sub={canSeePrices && +data.defects.total_cost > 0 ? `${eur(data.defects.total_cost)} загуба` : ''}
          color={data.defects.count > 5 ? 'text-danger' : 'text-white'} icon={AlertTriangle} />
        {isAdmin || data.lowStockCount > 0 ? (
          <StatCard to="/warehouse?tab=low-stock" label="Материали под минимум" value={data.lowStockCount}
            color={data.lowStockCount > 0 ? 'text-yellow-400' : 'text-muted'} icon={Package} />
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
                        {o.is_urgent && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-danger align-middle" title="Спешна" />}
                      </td>
                      <td>{o.client_name}</td>
                      <td><OrderStatusBadge status={o.status} /></td>
                      <td className={overdue ? 'text-danger font-medium' : 'text-muted'}>
                        {dateBg(o.deadline)}{overdue && <AlertTriangle className="w-3.5 h-3.5 inline-block align-[-2px] ml-1" strokeWidth={2} />}
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
            <PackagePlus className="w-8 h-8 text-accent mx-auto mb-3" strokeWidth={1.5} />
            <p className="font-semibold text-white">Приеми стока</p>
          </Link>
          <Link to="/deliveries" className="card hover:border-accent/50 transition-colors block text-center py-8">
            <Truck className="w-8 h-8 text-accent mx-auto mb-3" strokeWidth={1.5} />
            <p className="font-semibold text-white">Доставки</p>
          </Link>
          <Link to="/warehouse" className="card hover:border-accent/50 transition-colors block text-center py-8">
            <Package className="w-8 h-8 text-accent mx-auto mb-3" strokeWidth={1.5} />
            <p className="font-semibold text-white">Складови наличности</p>
          </Link>
          <Link to="/warehouse?tab=movements" className="card hover:border-accent/50 transition-colors block text-center py-8">
            <ArrowUpDown className="w-8 h-8 text-accent mx-auto mb-3" strokeWidth={1.5} />
            <p className="font-semibold text-white">Движения на материали</p>
          </Link>
        </div>
      </div>
    )
  }

  return <AdminDashboard />
}
