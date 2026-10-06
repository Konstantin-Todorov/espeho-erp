import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Tags } from 'lucide-react'
import api from '../api/axios'
import { orderNo, dateBg } from '../utils/labels'

const UNIT = { m2: 'м²', lm: 'л.м.', pcs: 'бр.', fixed: '' }

// "What do we charge this client?" — last price per product from their real orders.
export default function ClientPrices({ clientId }) {
  const [rows, setRows] = useState(null)
  const [all, setAll] = useState(false)
  useEffect(() => { api.get(`/clients/${clientId}/prices`).then(r => setRows(r.data)).catch(() => setRows([])) }, [clientId])
  if (!rows || rows.length === 0) return null
  const shown = all ? rows : rows.slice(0, 8)
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-1">
        <Tags className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Цени за този клиент</h3>
      </div>
      <p className="text-xs text-muted mb-3">Последната цена с ДДС по продукт от неговите поръчки</p>
      <div className="space-y-2">
        {shown.map(r => (
          <div key={r.product_desc + r.uom} className="flex items-start justify-between gap-3 text-sm">
            <div className="min-w-0">
              <p className="text-white truncate" title={r.product_desc}>{r.product_desc}</p>
              <p className="text-[11px] text-muted">
                {r.times}× · <Link to={`/orders/${r.last_order_id}`} className="hover:text-accent">{orderNo(r)}</Link> · {dateBg(r.last_date, 'd.MM.yy')}
                {+r.min_price !== +r.max_price && <> · {(+r.min_price).toFixed(2)}–{(+r.max_price).toFixed(2)}</>}
              </p>
            </div>
            <span className="font-semibold text-white whitespace-nowrap">
              {(+r.last_price).toFixed(2)} €{UNIT[r.uom] ? <span className="text-xs text-muted font-normal">/{UNIT[r.uom]}</span> : null}
            </span>
          </div>
        ))}
      </div>
      {rows.length > 8 && (
        <button className="text-xs text-accent hover:underline mt-3" onClick={() => setAll(a => !a)}>
          {all ? 'Покажи по-малко' : `Всички ${rows.length} продукта`}
        </button>
      )}
    </div>
  )
}
