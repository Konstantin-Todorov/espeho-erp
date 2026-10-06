import { useState } from 'react'
import { X } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import useSettings from '../../hooks/useSettings'
import { PaymentStatusBadge } from '../ui/StatusBadge'
import { eur, dateBg, todayStr } from '../../utils/labels'
import OptionSelect from '../ui/OptionSelect'
import useOptions from '../../hooks/useOptions'

// Price, what was paid and what is still owed. Payment status is derived from the payments.
export default function PaymentCard({ order, onChanged }) {
  const settings = useSettings()
  const { label: optLabel } = useOptions()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ amount: '', method: 'брой', paid_at: todayStr(), notes: '' })
  const [saving, setSaving] = useState(false)

  const price = +order.sale_price || 0
  const paid = +order.paid_amount || 0
  const due = Math.max(0, price - paid)
  const vat = 1 + (+settings.vat_pct || 20) / 100
  const free = order.order_category !== 'нормална'

  const open = () => { setForm({ amount: due ? due.toFixed(2) : '', method: 'брой', paid_at: todayStr(), notes: '' }); setAdding(true) }

  const save = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post(`/orders/${order.id}/payments`, form)
      toast.success('Плащането е записано')
      setAdding(false)
      onChanged()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setSaving(false) }
  }

  const remove = async p => {
    if (!window.confirm(`Да изтрия ли плащането ${eur(p.amount)} от ${dateBg(p.paid_at)}?`)) return
    try {
      await api.delete(`/orders/${order.id}/payments/${p.id}`)
      toast.success('Плащането е изтрито')
      onChanged()
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
  }

  // Historical (imported) orders are marked paid without payment records
  const paidWithoutRecords = order.payment_status === 'платена' && !order.payments?.length

  return (
    <div className="card text-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-muted text-xs uppercase tracking-wide">Цена и плащане</p>
        {!free && <PaymentStatusBadge status={order.payment_status} />}
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between items-baseline">
          <span className="text-muted">Цена с ДДС</span>
          <span className="text-xl font-bold text-white">{eur(price, { dash: false })}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted">без ДДС</span>
          <span className="text-muted">{eur(price / vat, { dash: false })}</span>
        </div>
        {free ? (
          <p className="text-xs text-muted pt-1">Тази поръчка не се таксува (категория „{order.order_category}“).</p>
        ) : (
          <>
            <div className="flex justify-between pt-1 border-t border-border mt-2">
              <span className="text-muted">Платено</span>
              <span className="text-green-400 font-medium">{paidWithoutRecords ? 'изцяло' : eur(paid, { dash: false })}</span>
            </div>
            {!paidWithoutRecords && (
              <div className="flex justify-between">
                <span className="text-muted">Остава</span>
                <span className={due > 0 ? 'text-danger font-semibold' : 'text-muted'}>{eur(due, { dash: false })}</span>
              </div>
            )}
          </>
        )}
      </div>

      {order.payments?.length > 0 && (
        <div className="mt-3 pt-2 border-t border-border space-y-1">
          {order.payments.map(p => (
            <div key={p.id} className="flex items-center justify-between text-xs group">
              <span className="text-muted">{dateBg(p.paid_at, 'd.MM.yy')} · {optLabel('payment_method', p.method)}{p.notes ? ` · ${p.notes}` : ''}</span>
              <span className="flex items-center gap-2">
                <span className="text-white">{eur(p.amount)}</span>
                <button className="text-muted hover:text-danger opacity-60 group-hover:opacity-100" title="Изтрий" aria-label="Изтрий плащането" onClick={() => remove(p)}><X className="w-3.5 h-3.5" /></button>
              </span>
            </div>
          ))}
        </div>
      )}

      {!free && !adding && !paidWithoutRecords && due > 0.009 && (
        <button className="btn-primary w-full justify-center mt-3 text-sm py-2" onClick={open}>+ Запиши плащане</button>
      )}
      {adding && (
        <form onSubmit={save} className="mt-3 space-y-2 p-3 rounded-xl border border-accent/30 bg-bg">
          <div className="grid grid-cols-2 gap-2">
            <input className="input text-sm text-right" type="number" step="0.01" placeholder="Сума €" autoFocus required
              value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            <OptionSelect listKey="payment_method" className="select text-sm" value={form.method} onChange={v => setForm(f => ({ ...f, method: v }))} />
            <input className="input text-sm" type="date" value={form.paid_at} onChange={e => setForm(f => ({ ...f, paid_at: e.target.value }))} />
            <input className="input text-sm" placeholder="Бележка (фактура №…)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" className="btn-secondary text-xs py-1" onClick={() => setAdding(false)}>Откажи</button>
            <button type="submit" className="btn-primary text-xs py-1" disabled={saving}>{saving ? '…' : 'Запиши'}</button>
          </div>
        </form>
      )}
    </div>
  )
}
