import { Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import api from '../../api/axios'
import { PageLoader } from '../ui/Spinner'
import OrderExpenses from '../order/OrderExpenses'
import { orderNo, eur, eurRound, dateBg } from '../../utils/labels'

// Paid orders for a period: what came in, the cost, extra expenses (editable here) and the profit.
// Owner only. Sale prices are with VAT; cost, expenses and profit are without VAT.
export default function PaidReport({ from, to, onExport }) {
  const [data, setData] = useState(null)
  const [open, setOpen] = useState(null)

  const load = () => api.get('/reports/paid', { params: { from, to } }).then(r => {
    setData(r.data)
    onExport?.(r.data.rows.map(o => ({
      номер: o.external_ref || o.order_number, клиент: o.client_name, референция: o.client_ref || '',
      платена_на: o.paid_on, 'платено_€': o.paid, 'цена_без_ДДС_€': o.sale_net, 'себестойност_€': o.cost,
      'разходи_€': o.expenses, 'печалба_€': o.profit, 'комисионна_€': o.commission,
    })))
  }).catch(() => setData({ rows: [], totals: {} }))
  useEffect(() => { setData(null); load() }, [from, to])

  if (!data) return <PageLoader />
  const t = data.totals || {}
  const cpct = +data.commission_pct || 0
  const pct = t.sale_net > 0 ? (t.profit / t.sale_net * 100).toFixed(1) : null

  // Update one row locally after its expenses change (no full reload)
  const setExpenses = (id, total) => setData(d => {
    const rows = d.rows.map(r => {
      if (r.id !== id) return r
      const profit = +r.sale_net - +r.cost - total
      return { ...r, expenses: total, profit, commission: profit > 0 ? Math.round(profit * (+d.commission_pct || 0)) / 100 : 0 }
    })
    const sum = k => rows.reduce((s, r) => s + (+r[k] || 0), 0)
    return { ...d, rows, totals: { ...d.totals, expenses: sum('expenses'), profit: sum('profit'), commission: sum('commission') } }
  })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          ['Платени поръчки', t.orders ?? 0, 'text-white'],
          ['Постъпило (с ДДС)', eurRound(t.paid), 'text-green-400'],
          ['Себестойност', eurRound(t.cost), 'text-white'],
          ['Допълнителни разходи', eurRound(t.expenses), 'text-white'],
          ['Печалба', `${eurRound(t.profit)}${pct ? ` · ${pct}%` : ''}`, +t.profit > 0 ? 'text-green-400' : 'text-danger'],
          [`Комисионна ${cpct}%`, eurRound(t.commission), 'text-white'],
        ].map(([label, value, color]) => (
          <div key={label} className="card">
            <p className="text-xs text-muted uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-lg font-bold ${color} whitespace-nowrap`}>{value}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted">
        Печалба = цена без ДДС − себестойност − допълнителни разходи. Комисионна = {cpct}% от печалбата (колона „по 7,7%“ в таблицата; процентът е в Настройки).
        Отворете ред, за да добавите разход (транспорт, монтаж…).
      </p>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th /><th>Номер</th><th>Клиент</th><th>Платена</th>
              <th className="text-right">Цена без ДДС</th><th className="text-right">Себестойност</th>
              <th className="text-right">Разходи</th><th className="text-right">Печалба</th><th className="text-right">Комисионна</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.length === 0 && <tr><td colSpan={9} className="text-center py-10 text-muted">Няма платени поръчки за периода</td></tr>}
            {data.rows.slice(0, 500).map(o => (
              <Fragment key={o.id}>
                <tr className="cursor-pointer" onClick={() => setOpen(open === o.id ? null : o.id)}>
                  <td className="w-6 text-muted">{open === o.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</td>
                  <td className="whitespace-nowrap">
                    <Link to={`/orders/${o.id}`} onClick={e => e.stopPropagation()} className="font-bold text-accent hover:underline">{orderNo(o)}</Link>
                    {o.payment_status === 'частично' && <span className="badge bg-yellow-500/15 text-yellow-400 text-[10px] ml-1">частично</span>}
                  </td>
                  <td>{o.client_name}{o.client_ref && <span className="text-xs text-purple-300"> · {o.client_ref}</span>}</td>
                  <td className="text-muted text-xs whitespace-nowrap">{dateBg(o.paid_on, 'd MMM yy')}</td>
                  <td className="text-right">{eur(o.sale_net)}</td>
                  <td className="text-right text-muted">{eur(o.cost)}</td>
                  <td className="text-right text-muted">{eur(o.expenses)}</td>
                  <td className={`text-right font-semibold ${+o.profit > 0 ? 'text-green-400' : 'text-danger'}`}>{eur(o.profit, { dash: false })}</td>
                  <td className="text-right text-muted">{eur(o.commission)}</td>
                </tr>
                {open === o.id && (
                  <tr>
                    <td />
                    <td colSpan={8} className="bg-bg/50">
                      <div className="max-w-md py-1">
                        <OrderExpenses orderId={o.id} initial={o.expense_items} compact onChange={total => setExpenses(o.id, total)} />
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {data.rows.length > 500 && <p className="text-xs text-muted p-3">Показани са първите 500 от {data.rows.length}. Свалете Excel за всички.</p>}
      </div>
    </div>
  )
}
