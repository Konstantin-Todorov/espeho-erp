import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { PageLoader } from '../components/ui/Spinner'
import { format, parseISO, startOfMonth, endOfMonth, startOfYear, subMonths, subYears, endOfYear } from 'date-fns'
import { bg } from 'date-fns/locale'
import { TYPE_LABELS, PAYMENT_LABELS, orderNo, eur, num, dateBg } from '../utils/labels'

const ymd = d => format(d, 'yyyy-MM-dd')
const PRESETS = [
  { label: 'Този месец', range: () => [startOfMonth(new Date()), new Date()] },
  { label: 'Миналия месец', range: () => [startOfMonth(subMonths(new Date(), 1)), endOfMonth(subMonths(new Date(), 1))] },
  { label: 'Тази година', range: () => [startOfYear(new Date()), new Date()] },
  { label: 'Миналата година', range: () => [startOfYear(subYears(new Date(), 1)), endOfYear(subYears(new Date(), 1))] },
]

const COLORS = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4']

// ─── CSV Export ───────────────────────────────────────────────────────────────
function exportCSV(data, filename) {
  if (!data || data.length === 0) return
  const headers = Object.keys(data[0]).join(',')
  const rows = data.map(row =>
    Object.values(row).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
  )
  const csv = [headers, ...rows].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }) // BOM for Excel
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function ExportButton({ data, filename, label = 'Експорт Excel' }) {
  if (!data || data.length === 0) return null
  return (
    <button
      className="btn-secondary text-sm flex items-center gap-2"
      onClick={() => exportCSV(data, filename)}
    >
      <Download className="w-4 h-4" />
      {label}
    </button>
  )
}

// ─── Date Range Filter ────────────────────────────────────────────────────────
function DateRangeFilter({ from, to, onChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {PRESETS.map(p => {
        const [a, b] = p.range().map(ymd)
        const on = a === from && b === to
        return (
          <button key={p.label} type="button" onClick={() => { onChange('from', a); onChange('to', b) }}
            className={`text-xs px-2.5 py-1.5 rounded-lg border ${on ? 'bg-accent text-white border-accent' : 'border-border text-muted hover:text-white'}`}>
            {p.label}
          </button>
        )
      })}
      <input type="date" className="input w-36 text-sm" value={from} onChange={e => onChange('from', e.target.value)} />
      <span className="text-muted">—</span>
      <input type="date" className="input w-36 text-sm" value={to} onChange={e => onChange('to', e.target.value)} />
    </div>
  )
}

// ─── Main Reports Page ────────────────────────────────────────────────────────
export default function Reports() {
  const [tab, setTab] = useState('costs')
  const navigate = useNavigate()
  // Default: the year so far — a single month is often empty and looks like the system is broken
  const defaultFrom = ymd(startOfYear(new Date()))
  const defaultTo = ymd(new Date())
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleDate = (key, val) => { key === 'from' ? setFrom(val) : setTo(val) }

  useEffect(() => {
    setLoading(true)
    setData(null)
    const params = `from=${from}&to=${to}`
    const endpoints = {
      costs:       `/reports/costs?${params}`,
      orders:      `/reports/orders?${params}`,
      production:  `/reports/production?${params}`,
      materials:   `/reports/materials?${params}`,
      defects:     `/defects/summary?${params}`,
      clients:     `/reports/clients?${params}&limit=100`,
      order_types: `/reports/order-types?${params}`,
      products:    `/reports/products?${params}`,
      receivables: `/reports/receivables`,
    }
    api.get(endpoints[tab])
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [tab, from, to])

  // Flatten data for CSV export per tab
  const getExportData = () => {
    if (!data) return null
    if (tab === 'costs') {
      if (!data.monthly || data.monthly.length === 0) return null
      return data.monthly.map(m => ({
        месец: m.month,
        поръчки: m.orders,
        'м2': Number(m.m2 || 0).toFixed(1),
        'приход_с_ДДС_€': Number(m.revenue || 0).toFixed(2),
        'приход_без_ДДС_€': Number(m.revenue_net || 0).toFixed(2),
        'себестойност_€': Number(m.cost || 0).toFixed(2),
        'марж_€': Number(m.margin || 0).toFixed(2),
      }))
    }
    if (tab === 'orders') {
      return (data || []).map(o => ({
        номер: o.external_ref || o.order_number,
        вътрешен_номер: o.order_number,
        дата: o.created_at?.slice(0, 10),
        клиент: o.client_name,
        статус: o.status,
        вид: TYPE_LABELS[o.order_type] || o.order_type,
        категория: o.order_category,
        плащане: o.payment_status,
        срок: o.deadline || '',
        'м2': o.m2 || '',
        'цена_с_ДДС_€': o.sale_price || '',
        'цена_без_ДДС_€': o.sale_price_net || '',
        'себестойност_€': o.total_cost || '',
        марж_процент: o.margin_pct || '',
      }))
    }
    if (tab === 'production') {
      return (data || []).map(w => ({
        работник: w.name,
        поръчки: w.orders_worked,
        часове: (w.total_minutes / 60).toFixed(1),
        'разход_труд_€': Number(w.labor_cost).toFixed(2),
        брак: w.defects_caused,
      }))
    }
    if (tab === 'materials') {
      return (data || []).map(m => ({
        материал: m.name,
        категория: m.category,
        консумирано: Number(m.total_consumed).toFixed(2),
        единица: m.unit,
        'стойност_€': Number(m.total_value).toFixed(2),
      }))
    }
    if (tab === 'products') {
      return (data || []).map(p => ({ продукт: p.product_desc, вид: TYPE_LABELS[p.product_type] || p.product_type,
        поръчки: p.orders, бройки: p.pieces, 'м2': p.m2, 'приход_€': p.revenue }))
    }
    if (tab === 'receivables') {
      return (data || []).map(o => ({ номер: o.external_ref || o.order_number, клиент: o.client_name, телефон: o.client_phone || '',
        статус: o.status, 'цена_€': o.sale_price, 'платено_€': o.paid, 'дължи_€': o.due }))
    }
    if (tab === 'clients') {
      return (data || []).map(c => ({ клиент: c.name, телефон: c.phone || '', поръчки: c.total_orders,
        предадени: c.delivered_orders, 'м2': c.total_m2, 'оборот_€': c.total_revenue, 'ср_поръчка_€': c.avg_order_value }))
    }
    if (tab === 'defects') {
      return data.byCause?.map(c => ({
        причина: c.cause_type,
        брой: c.count,
        'стойност_€': Number(c.total_cost).toFixed(2),
      })) || null
    }
    return null
  }

  const exportData = getExportData()

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white">Отчети</h1>
        <div className="flex items-center gap-3 flex-wrap">
          {tab !== 'receivables' && <DateRangeFilter from={from} to={to} onChange={handleDate} />}
          <ExportButton data={exportData} filename={`espeho-${tab}-${from}-${to}.csv`} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-1 mb-6 overflow-x-auto">
        {[
          { id:'costs',       label:'Финанси' },
          { id:'receivables', label:'Неплатени' },
          { id:'orders',      label:'Поръчки' },
          { id:'clients',     label:'По клиенти' },
          { id:'products',    label:'По продукти' },
          { id:'order_types', label:'По вид' },
          { id:'production',  label:'Производство' },
          { id:'materials',   label:'Материали' },
          { id:'defects',     label:'Брак' },
        ].map(t => (
          <button key={t.id} onClick={() => { setData(null); setTab(t.id) }}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap
              ${tab===t.id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <PageLoader />}

      {/* COSTS report */}
      {!loading && tab === 'costs' && data && (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label:'Приход с ДДС', val: eur(data.summary.total_revenue, { dash: false }), sub: `без ДДС: ${eur(data.summary.total_revenue_net, { dash: false })}`, color:'text-green-400' },
              { label:'Себестойност', val: eur(data.summary.total_cost, { dash: false }), sub: 'без ДДС', color:'text-white' },
              { label:'Марж', val: eur(data.summary.total_margin, { dash: false }),
                sub: +data.summary.total_revenue_net > 0 ? `${(data.summary.total_margin / data.summary.total_revenue_net * 100).toFixed(1)}% от приход без ДДС` : '',
                color: Number(data.summary.total_margin)>0?'text-green-400':'text-danger' },
              { label:'Предадени поръчки', val: num(data.summary.order_count, 0),
                sub: +data.summary.total_m2 > 0 ? `${num(data.summary.total_m2, 0)} м² · ${eur(data.summary.total_revenue / data.summary.total_m2)} /м²` : '', color:'text-white' },
            ].map(c => (
              <div key={c.label} className="card">
                <p className="text-xs text-muted uppercase tracking-wide mb-1">{c.label}</p>
                <p className={`text-xl font-bold ${c.color}`}>{c.val}</p>
                {c.sub && <p className="text-xs text-muted mt-0.5">{c.sub}</p>}
              </div>
            ))}
          </div>

          {/* Cost breakdown */}
          <div className="card">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Структура на разходите</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {[
                { label:'Материали', val:data.summary.total_material },
                { label:'Труд', val:data.summary.total_labor },
                { label:'Машини', val:data.summary.total_machine },
                { label:'Режийни', val:data.summary.total_overhead },
              ].map(c => (
                <div key={c.label}>
                  <p className="text-muted">{c.label}</p>
                  <p className="text-white font-medium mt-0.5">{eur(c.val, { dash: false })}</p>
                  <p className="text-xs text-muted">
                    {data.summary.total_cost > 0 ? ((c.val/data.summary.total_cost)*100).toFixed(1) : 0}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly chart */}
          {data.monthly.length > 0 && (
            <div className="card">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">По месец (без ДДС)</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.monthly} margin={{ left:-10, right:0, top:0, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="month" tick={{ fill:'var(--chart-tick)', fontSize:11 }}
                    tickFormatter={d => format(parseISO(d), 'MMM yy', { locale: bg })} />
                  <YAxis tick={{ fill:'var(--chart-tick)', fontSize:11 }} tickFormatter={v => `${Math.round(v / 1000)}k`} />
                  <Tooltip contentStyle={{ background:'var(--chart-bg)', border:'1px solid var(--chart-border)', borderRadius:8 }}
                    formatter={(v, name) => [eur(v, { dash: false }), name]} />
                  <Legend />
                  <Bar dataKey="revenue_net" name="Приход" fill="#22c55e" radius={[4,4,0,0]} />
                  <Bar dataKey="cost"    name="Разходи" fill="#3b82f6" radius={[4,4,0,0]} />
                  <Bar dataKey="margin"  name="Марж"    fill="#8b5cf6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {data.monthly.length > 0 && (
            <div className="table-container">
              <table>
                <thead><tr><th>Месец</th><th className="text-right">Поръчки</th><th className="text-right">м²</th><th className="text-right">Приход с ДДС</th><th className="text-right">Себестойност</th><th className="text-right">Марж</th></tr></thead>
                <tbody>
                  {data.monthly.map(m => (
                    <tr key={m.month}>
                      <td className="capitalize">{format(parseISO(m.month), 'LLLL yyyy', { locale: bg })}</td>
                      <td className="text-right">{m.orders}</td>
                      <td className="text-right text-muted">{num(m.m2, 0)}</td>
                      <td className="text-right text-green-400">{eur(m.revenue)}</td>
                      <td className="text-right text-muted">{eur(m.cost)}</td>
                      <td className={`text-right font-medium ${+m.margin > 0 ? 'text-green-400' : 'text-danger'}`}>{eur(m.margin)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* RECEIVABLES */}
      {!loading && tab === 'receivables' && data && (
        <div className="space-y-3">
          <div className="card flex flex-wrap gap-6">
            <div><p className="text-xs text-muted uppercase">Поръчки</p><p className="text-xl font-bold text-white">{data.length}</p></div>
            <div><p className="text-xs text-muted uppercase">Общо дължимо</p><p className="text-xl font-bold text-danger">{eur(data.reduce((s, o) => s + +o.due, 0), { dash: false })}</p></div>
            <div><p className="text-xs text-muted uppercase">От тях предадени</p><p className="text-xl font-bold text-yellow-400">{eur(data.filter(o => o.status === 'ДОСТАВЕНА').reduce((s, o) => s + +o.due, 0), { dash: false })}</p></div>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Номер</th><th>Клиент</th><th>Статус</th><th>Плащане</th><th className="text-right">Цена</th><th className="text-right">Платено</th><th className="text-right">Дължи</th></tr></thead>
              <tbody>
                {data.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-muted">Няма неплатени поръчки</td></tr>}
                {data.map(o => (
                  <tr key={o.id} className="cursor-pointer" onClick={() => navigate(`/orders/${o.id}`)}>
                    <td className="font-bold text-accent">{orderNo(o)}</td>
                    <td>{o.client_name}{o.client_phone && <div className="text-xs text-muted">{o.client_phone}</div>}</td>
                    <td><span className="badge bg-border text-muted">{o.status}</span></td>
                    <td className="text-xs text-muted">{PAYMENT_LABELS[o.payment_status]}</td>
                    <td className="text-right">{eur(o.sale_price)}</td>
                    <td className="text-right text-green-400">{eur(o.paid)}</td>
                    <td className="text-right font-semibold text-danger">{eur(o.due)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      {!loading && tab === 'products' && data && (
        <div className="table-container">
          <table>
            <thead><tr><th>Продукт / услуга</th><th>Вид</th><th className="text-right">Поръчки</th><th className="text-right">Бройки</th><th className="text-right">м²</th><th className="text-right">Приход</th></tr></thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-muted">Няма данни за периода</td></tr>}
              {data.map((p, i) => (
                <tr key={i}>
                  <td className="text-white">{p.product_desc}</td>
                  <td className="text-xs text-muted">{TYPE_LABELS[p.product_type] || p.product_type}</td>
                  <td className="text-right">{p.orders}</td>
                  <td className="text-right text-muted">{num(p.pieces, 0)}</td>
                  <td className="text-right">{num(p.m2, 1)}</td>
                  <td className="text-right font-medium">{eur(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-muted p-3">Приходът е по редовете с цена. При дилърски поръчки цялата сума често стои на първия ред.</p>
        </div>
      )}

      {/* ORDERS report */}
      {!loading && tab === 'orders' && data && (
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Номер</th><th>Клиент</th><th>Статус</th><th>Вид</th><th>Дата</th><th className="text-right">м²</th><th className="text-right">Цена с ДДС</th><th className="text-right">Себест.</th><th className="text-right">Марж</th></tr>
            </thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-muted">Няма данни</td></tr>}
              {data.slice(0, 500).map((o, i) => (
                <tr key={i} className="cursor-pointer" onClick={() => navigate(`/orders/${o.id}`)}>
                  <td className="font-bold text-accent whitespace-nowrap">{orderNo(o)}</td>
                  <td>{o.client_name}</td>
                  <td><span className="badge bg-border text-muted">{o.status}</span></td>
                  <td className="text-muted text-xs">{TYPE_LABELS[o.order_type] || o.order_type}</td>
                  <td className="text-muted whitespace-nowrap">{dateBg(o.created_at, 'd MMM yy')}</td>
                  <td className="text-right text-muted">{+o.m2 ? num(o.m2, 2) : '—'}</td>
                  <td className="text-right text-green-400">{eur(o.sale_price)}</td>
                  <td className="text-right text-muted">{eur(o.total_cost)}</td>
                  <td className={`text-right ${o.margin_pct > 0 ? 'text-green-400 font-medium' : o.margin_pct !== null ? 'text-danger' : 'text-muted'}`}>
                    {o.margin_pct !== null ? `${o.margin_pct}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 500 && <p className="text-xs text-muted p-3">Показани са първите 500 от {data.length}. Свалете Excel за всички.</p>}
        </div>
      )}

      {/* PRODUCTION report */}
      {!loading && tab === 'production' && data && (
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Работник</th><th>Поръчки</th><th>Часове</th><th>Разход труд</th><th>Брак</th></tr>
            </thead>
            <tbody>
              {data.map((w, i) => (
                <tr key={i}>
                  <td className="font-medium text-white">{w.name}</td>
                  <td>{w.orders_worked}</td>
                  <td>{(w.total_minutes / 60).toFixed(1)} ч</td>
                  <td className="text-danger">{Number(w.labor_cost).toFixed(2)} €</td>
                  <td className={w.defects_caused > 0 ? 'text-danger font-medium' : 'text-muted'}>{w.defects_caused}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MATERIALS report */}
      {!loading && tab === 'materials' && data && (
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Материал</th><th>Категория</th><th>Консумирано</th><th className="text-right">Стойност</th></tr>
            </thead>
            <tbody>
              {data.map((m, i) => (
                <tr key={i}>
                  <td className="font-medium text-white">{m.name}</td>
                  <td className="text-muted">{m.category}</td>
                  <td>{Number(m.total_consumed).toFixed(2)} {m.unit}</td>
                  <td className="text-right font-medium">{Number(m.total_value).toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CLIENTS report */}
      {!loading && tab === 'clients' && data && (
        <div className="space-y-4">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Клиент</th>
                  <th className="text-right">Поръчки</th>
                  <th className="text-right">Предадени</th>
                  <th className="text-right">м²</th>
                  <th className="text-right">Оборот</th>
                  <th className="text-right">Ср. поръчка</th>
                  <th>Последна</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-muted">Няма данни</td></tr>
                )}
                {data.map((c, i) => (
                  <tr key={i} className="cursor-pointer" onClick={() => navigate(`/clients/${c.id}`)}>
                    <td>
                      <p className="font-medium text-white">{c.name}</p>
                      {c.phone && <p className="text-muted text-xs">{c.phone}</p>}
                    </td>
                    <td className="text-right">{c.total_orders}</td>
                    <td className="text-right text-green-400">{c.delivered_orders}</td>
                    <td className="text-right text-muted">{num(c.total_m2, 0)}</td>
                    <td className="text-right font-semibold text-white">{eur(c.total_revenue)}</td>
                    <td className="text-right text-muted">{eur(c.avg_order_value)}</td>
                    <td className="text-muted text-xs">{dateBg(c.last_order_at, 'd MMM yy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Топ клиенти по приход</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.slice(0,10).map(c => ({ ...c, total_revenue: +c.total_revenue }))} layout="vertical" margin={{ left: 80, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis type="number" tick={{ fill:'var(--chart-tick)', fontSize:11 }} tickFormatter={v => `${v}€`} />
                  <YAxis type="category" dataKey="name" tick={{ fill:'var(--chart-tick-y)', fontSize:11 }} width={80} />
                  <Tooltip contentStyle={{ background:'var(--chart-bg)', border:'1px solid var(--chart-border)', borderRadius:8 }}
                    formatter={v => [`${Number(v).toFixed(2)} €`]} />
                  <Bar dataKey="total_revenue" name="Приход" fill="#3b82f6" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ORDER TYPES report */}
      {!loading && tab === 'order_types' && data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.map((t, i) => (
              <div key={i} className="card">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white">{TYPE_LABELS[t.order_type] || t.order_type}</h3>
                  <span className="text-2xl font-bold text-accent">{t.total_orders}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Доставени</span>
                    <span className="text-green-400">{t.delivered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Отказани</span>
                    <span className={t.cancelled > 0 ? 'text-danger' : 'text-muted'}>{t.cancelled}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Приход</span>
                    <span className="text-white font-medium">{eur(t.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">м²</span>
                    <span className="text-muted">{num(t.m2, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Ср. цена</span>
                    <span className="text-muted">{Number(t.avg_price).toFixed(2)} €</span>
                  </div>
                  {t.total_orders > 0 && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <div className="flex justify-between text-xs text-muted mb-1">
                        <span>Успех</span>
                        <span>{Math.round(t.delivered/t.total_orders*100)}%</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: `${Math.round(t.delivered/t.total_orders*100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DEFECTS report */}
      {!loading && tab === 'defects' && data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-xs text-muted uppercase tracking-wide mb-1">Общо брак</p>
              <p className="text-xl font-bold text-danger">{data.totals?.total_count || 0}</p>
            </div>
            <div className="card">
              <p className="text-xs text-muted uppercase tracking-wide mb-1">Стойност</p>
              <p className="text-xl font-bold text-danger">{Number(data.totals?.total_cost||0).toFixed(2)} €</p>
            </div>
            <div className="card">
              <p className="text-xs text-muted uppercase tracking-wide mb-1">Преработки</p>
              <p className="text-xl font-bold text-orange-400">{data.totals?.remake_count || 0}</p>
            </div>
            <div className="card">
              <p className="text-xs text-muted uppercase tracking-wide mb-1">Отписвания</p>
              <p className="text-xl font-bold text-muted">{data.totals?.writeoff_count || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* By cause */}
            <div className="card">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">По причина</h3>
              {data.byCause?.map((c, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-border/50 text-sm last:border-0">
                  <span className="text-gray-300">{String(c.cause_type).replace('_',' ')}</span>
                  <div className="text-right">
                    <span className="text-white font-medium">{c.count}</span>
                    <span className="text-danger ml-2">{Number(c.total_cost).toFixed(2)} €</span>
                  </div>
                </div>
              ))}
            </div>

            {/* By worker */}
            <div className="card">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">По работник</h3>
              {data.byWorker?.map((w, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-border/50 text-sm last:border-0">
                  <span className="text-gray-300">{w.name}</span>
                  <div className="text-right">
                    <span className="text-white font-medium">{w.count}</span>
                    <span className="text-danger ml-2">{Number(w.total_cost).toFixed(2)} €</span>
                  </div>
                </div>
              ))}
            </div>

            {/* By machine */}
            <div className="card">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">По машина</h3>
              {data.byMachine?.length === 0 && <p className="text-muted text-sm">Няма данни</p>}
              {data.byMachine?.map((m, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-border/50 text-sm last:border-0">
                  <span className="text-gray-300">{m.name}</span>
                  <div className="text-right">
                    <span className="text-white font-medium">{m.count}</span>
                    <span className="text-danger ml-2">{Number(m.total_cost).toFixed(2)} €</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
