import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Modal from '../ui/Modal'
import { FULFILLMENT_LABELS, orderNo, eur } from '../../utils/labels'
import useOptions from '../../hooks/useOptions'

// Hand an order over to the client and record the payment in the same step —
// that is how it happens at the counter, so it should be one click, not two screens.
// paymentOnly: the order is already handed over — just collect (part of) the money
export default function HandoverDialog({ order, open, onClose, onDone, paymentOnly = false }) {
  const price = +order?.sale_price || 0
  const paid = +order?.paid_amount || 0
  const due = Math.max(0, price - paid)
  const charges = order?.order_category === 'нормална' && due > 0.009
  const { lists } = useOptions()
  const [mode, setMode] = useState('full') // full | part | later
  const [method, setMethod] = useState('брой')
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (open) { setMode('full'); setMethod('брой'); setAmount('') } }, [open])
  if (!order) return null

  const submit = async () => {
    setSaving(true)
    try {
      if (!paymentOnly) await api.patch(`/orders/${order.id}/status`, { status: 'ДОСТАВЕНА' })
      if (charges && mode !== 'later') {
        const sum = mode === 'full' ? due : +String(amount).replace(',', '.')
        if (sum > 0) await api.post(`/orders/${order.id}/payments`, { amount: sum.toFixed(2), method })
      }
      toast.success(paymentOnly ? 'Плащането е записано' : `Поръчка ${orderNo(order)} е предадена`)
      onDone?.()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setSaving(false) }
  }

  const Option = ({ value, title, sub }) => (
    <button type="button" onClick={() => setMode(value)}
      className={`text-left p-3 rounded-xl border transition-colors ${mode === value ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/40'}`}>
      <p className="text-sm font-medium text-white">{title}</p>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
    </button>
  )

  return (
    <Modal open={open} onClose={onClose} title={`${paymentOnly ? 'Плащане' : 'Предаване'} — ${orderNo(order)}`} size="md">
      <div className="space-y-4">
        <p className="text-sm text-gray-300">
          {order.client_name}
          {order.fulfillment && order.fulfillment !== 'вземане' && <span className="text-muted"> · {FULFILLMENT_LABELS[order.fulfillment]}</span>}
        </p>

        {charges ? (
          <>
            <div className="flex justify-between items-baseline p-3 rounded-xl bg-bg border border-border">
              <span className="text-sm text-muted">За плащане{paid > 0 ? ` (платени ${eur(paid)})` : ''}</span>
              <span className="text-xl font-bold text-white">{eur(due, { dash: false })}</span>
            </div>
            <p className="label mb-0">Клиентът плати ли?</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Option value="full" title="Да, всичко" sub={eur(due, { dash: false })} />
              <Option value="part" title="Част" sub="въведете сума" />
              {!paymentOnly && <Option value="later" title="Не, по-късно" sub="остава в „Неплатени“" />}
            </div>
            {mode !== 'later' && (
              <div className="grid grid-cols-2 gap-2">
                {mode === 'part' && (
                  <input className="input text-right" inputMode="decimal" placeholder="Сума €" autoFocus
                    value={amount} onChange={e => setAmount(e.target.value)} />
                )}
                <div className={`flex flex-wrap gap-1 p-1 rounded-xl bg-bg border border-border ${mode === 'part' ? '' : 'col-span-2'}`}>
                  {(lists.payment_method || []).map(m => (
                    <button key={m.id} type="button" onClick={() => setMethod(m.value)}
                      className={`flex-1 text-xs px-2 py-1.5 rounded-lg whitespace-nowrap ${method === m.value ? 'bg-accent text-white' : 'text-muted hover:text-white'}`}>{m.label}</button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted">
            {order.order_category !== 'нормална' ? 'Поръчката не се таксува.' : 'Поръчката е платена.'}
          </p>
        )}

        <div className="flex gap-2 justify-end pt-2">
          <button className="btn-secondary" onClick={onClose}>Откажи</button>
          <button className="btn-primary" disabled={saving || (mode === 'part' && charges && !(+String(amount).replace(',', '.') > 0))} onClick={submit}>
            {saving ? '…' : paymentOnly ? 'Запиши плащането' : 'Предай на клиента'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
