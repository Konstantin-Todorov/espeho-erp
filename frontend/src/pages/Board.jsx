import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from '../components/ui/Spinner'
import HandoverDialog from '../components/order/HandoverDialog'
import { PaymentStatusBadge } from '../components/ui/StatusBadge'
import { FULFILLMENT_LABELS, orderNo, eur, dateBg, todayStr } from '../utils/labels'

// "Работен ден" — the office runs the day from one screen. Every active order sits in the column
// of what has to happen next, and the card's button does exactly that next step.
const COLUMNS = [
  { key: 'new',   title: 'Нови', hint: 'Приети — да се пуснат в цеха', statuses: ['НОВА', 'МАТЕРИАЛИ'],
    next: { status: 'ПРОИЗВОДСТВО', label: 'Пусни в цеха' }, accent: 'border-t-blue-500' },
  { key: 'shop',  title: 'В цеха', hint: 'Работят се в момента', statuses: ['ПРОИЗВОДСТВО'],
    next: { status: 'ГОТОВА', label: 'Готова' }, accent: 'border-t-orange-500' },
  { key: 'ready', title: 'Готови', hint: 'Обадете се на клиента / доставка', statuses: ['ГОТОВА'],
    next: { status: 'ДОСТАВЕНА', label: 'Предай' }, accent: 'border-t-green-500' },
  { key: 'debt',  title: 'Предадени, неплатени', hint: 'Да се съберат парите', statuses: ['ДОСТАВЕНА'],
    next: { pay: true, label: 'Плащане' }, accent: 'border-t-yellow-500', money: true },
]

const tomorrowStr = () => {
  const d = new Date(); d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function DeadlineChip({ deadline, done }) {
  if (!deadline) return null
  const d = String(deadline).slice(0, 10)
  const today = todayStr()
  if (!done && d < today) return <span className="text-[11px] font-semibold text-danger">просрочена {dateBg(d, 'd.MM')}</span>
  if (d === today) return <span className="text-[11px] font-semibold text-orange-400">днес</span>
  if (d === tomorrowStr()) return <span className="text-[11px] font-medium text-yellow-400">утре</span>
  return <span className="text-[11px] text-muted">до {dateBg(d, 'd MMM')}</span>
}

function Card({ o, col, onAction, canSeePrices, busy, draggable }) {
  const navigate = useNavigate()
  const pct = o.total_stages > 0 ? Math.round(o.done_stages / o.total_stages * 100) : null
  const due = Math.max(0, (+o.sale_price || 0) - (+o.paid_amount || 0))
  return (
    <div draggable={draggable} onDragStart={e => { e.dataTransfer.setData('text/plain', o.id); e.dataTransfer.effectAllowed = 'move' }}
      className={`group rounded-xl border bg-surface p-3 space-y-2 cursor-pointer hover:border-accent/50 transition-colors
        ${o.is_urgent ? 'border-danger/50' : 'border-border'}`}
      onClick={() => navigate(`/orders/${o.id}`)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-accent text-sm leading-tight">
            {orderNo(o)} {o.is_urgent && <span className="text-danger" title="Спешна">●</span>}
          </p>
          <p className="text-sm text-white truncate">{o.client_name}</p>
        </div>
        <DeadlineChip deadline={o.deadline} done={col.key === 'debt'} />
      </div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
        {o.fulfillment && o.fulfillment !== 'вземане' && <span>{o.fulfillment === 'монтаж' ? '🔧' : '🚚'} {FULFILLMENT_LABELS[o.fulfillment]}</span>}
        {+o.total_m2 > 0 && <span>{(+o.total_m2).toLocaleString('bg-BG', { maximumFractionDigits: 1 })} м²</span>}
        {o.status === 'МАТЕРИАЛИ' && <span className="text-yellow-400">чака материали</span>}
      </div>

      {col.key === 'shop' && pct !== null && (
        <div className="flex items-center gap-2" title={`${o.done_stages} от ${o.total_stages} етапа`}>
          <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[11px] text-muted">{o.done_stages}/{o.total_stages}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-1" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 min-w-0">
          {canSeePrices && (
            col.money
              ? <span className="text-sm font-semibold text-danger">{eur(due)}</span>
              : <span className="text-sm text-gray-300">{eur(o.sale_price)}</span>
          )}
          {canSeePrices && !col.money && o.payment_status === 'частично' && <PaymentStatusBadge status="частично" />}
        </div>
        <div className="flex items-center gap-1">
          {o.client_phone && (
            <a href={`tel:${o.client_phone}`} title={`Обади се: ${o.client_phone}`}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-white hover:bg-border">📞</a>
          )}
          {col.next && (!col.money || canSeePrices) && (
            <button disabled={busy} onClick={() => onAction(o, col)}
              className="btn-primary text-xs px-3 py-1.5 whitespace-nowrap">
              {col.next.label} →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Board() {
  const { canSeePrices, isOffice } = useAuth()
  const [active, setActive] = useState([])
  const [debt, setDebt] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(null)
  const [q, setQ] = useState('')
  const [onlyUrgent, setOnlyUrgent] = useState(false)
  const [handover, setHandover] = useState(null) // { order, paymentOnly }
  const [dragOver, setDragOver] = useState(null)

  const load = useCallback(async () => {
    try {
      const [a, d1, d2] = await Promise.all([
        api.get('/orders', { params: { active: 'true', limit: 500 } }),
        canSeePrices ? api.get('/orders', { params: { status: 'ДОСТАВЕНА', payment_status: 'неплатена', limit: 200 } }) : { data: { data: [] } },
        canSeePrices ? api.get('/orders', { params: { status: 'ДОСТАВЕНА', payment_status: 'частично', limit: 200 } }) : { data: { data: [] } },
      ])
      setActive(a.data.data)
      setDebt([...d1.data.data, ...d2.data.data].filter(o => o.order_category === 'нормална' && +o.sale_price > 0))
    } catch {
      toast.error('Грешка при зареждане')
    } finally { setLoading(false) }
  }, [canSeePrices])

  useEffect(() => { load() }, [load])
  // Keep the board fresh while it is open on the office screen
  useEffect(() => { const t = setInterval(load, 60_000); return () => clearInterval(t) }, [load])

  const matches = o => {
    if (onlyUrgent && !o.is_urgent) return false
    const t = q.trim().toLowerCase()
    return !t || [o.external_ref, String(o.order_number), o.client_name, o.client_phone].some(v => v && v.toLowerCase().includes(t))
  }
  const sortKey = o => [o.is_urgent ? 0 : 1, o.deadline || '9999', o.created_at]
  const byCol = useMemo(() => {
    const out = {}
    for (const c of COLUMNS) {
      const src = c.money ? debt : active.filter(o => c.statuses.includes(o.status))
      out[c.key] = src.filter(matches).sort((a, b) => {
        const ka = sortKey(a), kb = sortKey(b)
        return ka[0] - kb[0] || String(ka[1]).localeCompare(String(kb[1])) || String(kb[2]).localeCompare(String(ka[2]))
      })
    }
    return out
  }, [active, debt, q, onlyUrgent])

  const act = async (o, col) => {
    if (col.next.pay) return setHandover({ order: o, paymentOnly: true })
    if (col.next.status === 'ДОСТАВЕНА' && canSeePrices) return setHandover({ order: o, paymentOnly: false })
    setBusy(o.id)
    try {
      await api.patch(`/orders/${o.id}/status`, { status: col.next.status })
      toast.success(`${orderNo(o)} → ${col.next.status}`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setBusy(null) }
  }

  // Drag a card one column to the right = do its next step
  const onDrop = (e, targetIdx) => {
    e.preventDefault(); setDragOver(null)
    const id = e.dataTransfer.getData('text/plain')
    const srcIdx = COLUMNS.findIndex(c => byCol[c.key].some(o => o.id === id))
    if (srcIdx < 0 || targetIdx !== srcIdx + 1) {
      if (srcIdx >= 0 && targetIdx !== srcIdx) toast('Местете поръчката една колона напред', { icon: '↔' })
      return
    }
    const o = byCol[COLUMNS[srcIdx].key].find(x => x.id === id)
    act(o, COLUMNS[srcIdx])
  }

  if (loading) return <PageLoader />

  const today = todayStr()
  const overdue = active.filter(o => o.deadline && String(o.deadline).slice(0, 10) < today && !['ГОТОВА'].includes(o.status)).length
  const dueToday = active.filter(o => String(o.deadline || '').slice(0, 10) === today).length
  const cols = COLUMNS.filter(c => !c.money || canSeePrices)

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Работен ден</h1>
          <p className="text-sm text-muted mt-0.5">
            {active.length} активни поръчки
            {dueToday > 0 && <> · <span className="text-orange-400">{dueToday} със срок днес</span></>}
            {overdue > 0 && <> · <span className="text-danger">{overdue} просрочени</span></>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <input className="input w-56" placeholder="Филтър: номер, клиент…" value={q} onChange={e => setQ(e.target.value)} />
          <button className={`btn ${onlyUrgent ? 'btn-danger' : 'btn-secondary'}`} onClick={() => setOnlyUrgent(v => !v)}>Само спешни</button>
          {isOffice && <Link to="/orders?new=1" className="btn-primary">+ Нова поръчка</Link>}
        </div>
      </div>

      <div className={`grid gap-3 flex-1 min-h-0 grid-cols-1 md:grid-cols-2 ${cols.length === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
        {cols.map((c, idx) => (
          <section key={c.key}
            onDragOver={e => { e.preventDefault(); setDragOver(c.key) }} onDragLeave={() => setDragOver(null)}
            onDrop={e => onDrop(e, idx)}
            className={`flex flex-col min-h-[12rem] rounded-2xl border border-border border-t-4 ${c.accent} bg-bg/40
              ${dragOver === c.key ? 'ring-2 ring-accent/60' : ''}`}>
            <header className="px-3 pt-3 pb-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">{c.title}</h2>
                <span className="text-xs font-semibold text-muted bg-border rounded-full px-2 py-0.5">{byCol[c.key].length}</span>
              </div>
              <p className="text-[11px] text-muted">{c.hint}</p>
              {c.money && byCol[c.key].length > 0 && (
                <p className="text-xs text-danger mt-1 font-medium">
                  Общо: {eur(byCol[c.key].reduce((s, o) => s + Math.max(0, (+o.sale_price || 0) - (+o.paid_amount || 0)), 0))}
                </p>
              )}
            </header>
            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 max-h-[calc(100vh-15rem)]">
              {byCol[c.key].length === 0 && <p className="text-center text-xs text-muted py-6">Няма</p>}
              {byCol[c.key].map(o => (
                <Card key={o.id} o={o} col={c} canSeePrices={canSeePrices} busy={busy === o.id}
                  draggable={isOffice && idx < cols.length - 1} onAction={act} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="text-[11px] text-muted mt-3 hidden md:block">
        Съвет: плъзнете карта в следващата колона или натиснете бутона ѝ. Ctrl/⌘+K за бързо търсене.
      </p>

      <HandoverDialog order={handover?.order} open={!!handover} paymentOnly={handover?.paymentOnly}
        onClose={() => setHandover(null)} onDone={load} />
    </div>
  )
}
