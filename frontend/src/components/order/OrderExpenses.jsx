import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import OptionSelect from '../ui/OptionSelect'
import useOptions from '../../hooks/useOptions'
import { eur, dateBg, todayStr } from '../../utils/labels'

// Extra expenses on an order (transport, crew, commission…), amounts without VAT. Owner only.
// `initial` lets a parent pass expenses it already loaded; onChange(total) reports the new sum.
export default function OrderExpenses({ orderId, initial, onChange, compact }) {
  const { label } = useOptions()
  const [rows, setRows] = useState(initial || null)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!initial) api.get(`/orders/${orderId}/expenses`).then(r => setRows(r.data)).catch(() => setRows([]))
  }, [orderId])
  const total = (rows || []).reduce((s, e) => s + +e.amount, 0)

  const add = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.post(`/orders/${orderId}/expenses`, form)
      const next = [...(rows || []), data]
      setRows(next); setForm(null)
      onChange?.(next.reduce((s, x) => s + +x.amount, 0))
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
    finally { setSaving(false) }
  }
  const remove = async x => {
    try {
      await api.delete(`/orders/${orderId}/expenses/${x.id}`)
      const next = rows.filter(r => r.id !== x.id)
      setRows(next)
      onChange?.(next.reduce((s, r) => s + +r.amount, 0))
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
  }

  return (
    <div className={compact ? '' : 'mt-3 pt-3 border-t border-border'}>
      {!compact && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-muted text-sm">Допълнителни разходи</span>
          <span className="text-white text-sm font-medium">{eur(total)}</span>
        </div>
      )}
      <div className="space-y-1">
        {(rows || []).map(x => (
          <div key={x.id} className="flex items-center justify-between gap-2 text-xs group">
            <span className="text-muted min-w-0 truncate">
              {dateBg(x.spent_at, 'd.MM')} · {label('expense_category', x.category)}{x.description ? ` · ${x.description}` : ''}
            </span>
            <span className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-gray-200">{eur(x.amount)}</span>
              <button className="text-muted hover:text-danger opacity-60 group-hover:opacity-100" aria-label="Изтрий разхода" onClick={() => remove(x)}>
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          </div>
        ))}
      </div>
      {form ? (
        <form onSubmit={add} className="mt-2 grid grid-cols-2 gap-1.5">
          <OptionSelect listKey="expense_category" className="select text-xs py-1.5 col-span-2" value={form.category}
            onChange={v => setForm(f => ({ ...f, category: v }))} />
          <input className="input text-xs py-1.5 col-span-2" placeholder="Описание (по желание)" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <input className="input text-xs py-1.5 text-right" inputMode="decimal" placeholder="Сума без ДДС" autoFocus required
            value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
          <input className="input text-xs py-1.5" type="date" value={form.spent_at}
            onChange={e => setForm(f => ({ ...f, spent_at: e.target.value }))} />
          <div className="col-span-2 flex justify-end gap-1.5">
            <button type="button" className="btn-secondary text-xs py-1" onClick={() => setForm(null)}>Откажи</button>
            <button className="btn-primary text-xs py-1" disabled={saving}>Запиши</button>
          </div>
        </form>
      ) : (
        <button className="text-xs text-accent hover:underline mt-1.5 inline-flex items-center gap-1"
          onClick={() => setForm({ category: 'транспорт', description: '', amount: '', spent_at: todayStr() })}>
          <Plus className="w-3.5 h-3.5" /> Добави разход
        </button>
      )}
    </div>
  )
}
