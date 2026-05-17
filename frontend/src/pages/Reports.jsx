import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../api/axios'
import { PageLoader } from '../components/ui/Spinner'
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns'
import { bg } from 'date-fns/locale'

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
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {label}
    </button>
  )
}

// ─── Date Range Filter ────────────────────────────────────────────────────────
function DateRangeFilter({ from, to, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input type="date" className="input w-36 text-sm" value={from} onChange={e => onChange('from', e.target.value)} />
      <span className="text-muted">—</span>
      <input type="date" className="input w-36 text-sm" value={to} onChange={e => onChange('to', e.target.value)} />
    </div>
  )
}

// ─── Main Reports Page ────────────────────────────────────────────────────────
export default function Reports() {
  const [tab, setTab] = useState('costs')
  const defaultFrom = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const defaultTo = format(endOfMonth(new Date()), 'yyyy-MM-dd')
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
      costs:      `/reports/costs?${params}`,
      orders:     `/reports/orders?${params}`,
      production: `/reports/production?${params}`,
      materials:  `/reports/materials?${params}`,
      defects:    `/defects/summary?${params}`,
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
        'приход_€': Number(m.revenue || 0).toFixed(2),
        'разходи_€': Number(m.cost || 0).toFixed(2),
        'марж_€': Number(m.margin || 0).toFixed(2),
      }))
    }
    if (tab === 'orders') {
      return (data || []).map(o => ({
        номер: o.order_number,
        клиент: o.client_name,
        статус: o.status,
        тип: o.order_type,
        краен_срок: o.deadline || '',
        'приход_€': o.sale_price || '',
        'разход_€': o.total_cost || '',
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
        <h1 className="text-2xl font-bold text-white">Репорти</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <DateRangeFilter from={from} to={to} onChange={handleDate} />
          <ExportButton data={exportData} filename={`espeho-${tab}-${from}-${to}.csv`} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-1 mb-6 overflow-x-auto">
        {[
          { id:'costs',      label:'Финанси' },
          { id:'orders',     label:'Поръчки' },
          { id:'production', label:'Производство' },
          { id:'materials',  label:'Материали' },
          { id:'defects',    label:'Брак' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
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
              { label:'Приход', val:`${Number(data.summary.total_revenue).toLocaleString()} €`, color:'text-green-400' },
              { label:'Себестойност', val:`${Number(data.summary.total_cost).toLocaleString()} €`, color:'text-white' },
              { label:'Марж', val:`${Number(data.summary.total_margin).toLocaleString()} €`, color: Number(data.summary.total_margin)>0?'text-green-400':'text-danger' },
              { label:'Поръчки', val:data.summary.order_count, color:'text-white' },
            ].map(c => (
              <div key={c.label} className="card">
                <p className="text-xs text-muted uppercase tracking-wide mb-1">{c.label}</p>
                <p className={`text-xl font-bold ${c.color}`}>{c.val}</p>
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
                  <p className="text-white font-medium mt-0.5">{Number(c.val).toFixed(2)} €</p>
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
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">По месец</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.monthly} margin={{ left:-10, right:0, top:0, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252a3a" />
                  <XAxis dataKey="month" tick={{ fill:'#6b7280', fontSize:11 }}
                    tickFormatter={d => format(parseISO(d), 'MMM yy', { locale: bg })} />
                  <YAxis tick={{ fill:'#6b7280', fontSize:11 }} />
                  <Tooltip contentStyle={{ background:'#181c27', border:'1px solid #252a3a', borderRadius:8 }}
                    formatter={v => [`${Number(v).toFixed(2)} €`]} />
                  <Legend />
                  <Bar dataKey="revenue" name="Приход"  fill="#22c55e" radius={[4,4,0,0]} />
                  <Bar dataKey="cost"    name="Разходи" fill="#3b82f6" radius={[4,4,0,0]} />
                  <Bar dataKey="margin"  name="Марж"    fill="#8b5cf6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ORDERS report */}
      {!loading && tab === 'orders' && data && (
        <div className="table-container">
          <table>
            <thead>
              <tr><th>#</th><th>Клиент</th><th>Статус</th><th>Тип</th><th>Краен срок</th><th>Приход</th><th>Разход</th><th>Марж</th></tr>
            </thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-muted">Няма данни</td></tr>}
              {data.map((o, i) => (
                <tr key={i}>
                  <td className="font-bold text-accent">#{o.order_number}</td>
                  <td>{o.client_name}</td>
                  <td><span className="badge bg-border text-muted">{o.status}</span></td>
                  <td className="text-muted text-xs">{o.order_type}</td>
                  <td className="text-muted">{o.deadline ? format(parseISO(o.deadline), 'd MMM yy', { locale: bg }) : '—'}</td>
                  <td className="text-green-400">{o.sale_price ? `${Number(o.sale_price).toFixed(2)} €` : '—'}</td>
                  <td className="text-danger">{o.total_cost ? `${Number(o.total_cost).toFixed(2)} €` : '—'}</td>
                  <td className={o.margin_pct > 0 ? 'text-green-400 font-medium' : o.margin_pct !== null ? 'text-danger' : 'text-muted'}>
                    {o.margin_pct !== null ? `${o.margin_pct}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                  <span className="text-gray-300">{c.cause_type.replace('_',' ')}</span>
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
