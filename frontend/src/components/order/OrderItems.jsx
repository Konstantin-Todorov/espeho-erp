import { useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import useSettings from '../../hooks/useSettings'
import { priceLine } from '../../utils/pricing'
import { TYPE_LABELS, UOM_LABELS, UOM_HINTS, eur, num } from '../../utils/labels'
import { ConfirmDialog } from '../ui/Modal'

const UNIT_SHORT = { m2: 'м²', lm: 'л.м.', pcs: 'бр.', fixed: '' }

function ItemForm({ initial, orderType, onSave, onCancel, saving }) {
  const settings = useSettings()
  const [f, setF] = useState(() => ({
    product_desc: '', product_type: orderType, width: '', height: '', qty: 1, uom: 'm2', unit_price: '', notes: '',
    ...Object.fromEntries(Object.entries(initial || {}).map(([k, v]) => [k, v ?? ''])),
  }))
  const set = patch => setF(x => ({ ...x, ...patch }))
  const p = priceLine(f, settings)
  const sizeOff = f.uom === 'pcs' || f.uom === 'fixed'

  return (
    <tr className="bg-accent/5">
      <td colSpan={7} className="p-3">
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2 items-end">
          <label className="col-span-6 md:col-span-4">
            <span className="text-[11px] text-muted">Описание</span>
            <input className="input text-sm" autoFocus value={f.product_desc} onChange={e => set({ product_desc: e.target.value })} />
          </label>
          <label className="col-span-3 md:col-span-2">
            <span className="text-[11px] text-muted">Вид</span>
            <select className="select text-sm" value={f.product_type} onChange={e => set({ product_type: e.target.value })}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className="col-span-3 md:col-span-1">
            <span className="text-[11px] text-muted">Ш мм</span>
            <input className="input text-sm px-1 text-center" type="number" disabled={sizeOff} value={f.width} onChange={e => set({ width: e.target.value })} />
          </label>
          <label className="col-span-2 md:col-span-1">
            <span className="text-[11px] text-muted">В мм</span>
            <input className="input text-sm px-1 text-center" type="number" disabled={sizeOff} value={f.height} onChange={e => set({ height: e.target.value })} />
          </label>
          <label className="col-span-2 md:col-span-1">
            <span className="text-[11px] text-muted">Бр.</span>
            <input className="input text-sm px-1 text-center" type="number" step="any" disabled={f.uom === 'fixed'} value={f.qty} onChange={e => set({ qty: e.target.value })} />
          </label>
          <label className="col-span-2 md:col-span-1">
            <span className="text-[11px] text-muted">Мярка</span>
            <select className="select text-sm px-1" value={f.uom} title={UOM_HINTS[f.uom]} onChange={e => set({ uom: e.target.value })}>
              {Object.entries(UOM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className="col-span-3 md:col-span-2">
            <span className="text-[11px] text-muted">Цена с ДДС</span>
            <input className="input text-sm text-right" type="number" step="0.01" value={f.unit_price} onChange={e => set({ unit_price: e.target.value })} />
          </label>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
          <p className="text-xs text-muted">
            {p.area !== null && f.uom === 'm2' && <>{num(p.area, 3)} м²{p.minApplied && ' (мин. площ)'} · </>}
            Сума: <span className="text-white font-semibold">{p.total !== null ? eur(p.total, { dash: false }) : '—'}</span>
          </p>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary text-xs py-1" onClick={onCancel}>Откажи</button>
            <button type="button" className="btn-primary text-xs py-1" disabled={saving || !f.product_desc.trim()} onClick={() => onSave(f)}>
              {saving ? '…' : 'Запази реда'}
            </button>
          </div>
        </div>
      </td>
    </tr>
  )
}

// Order lines. Office/admin can add, edit and delete; the order price follows automatically
// unless it was set by hand.
export default function OrderItems({ order, canEdit, canSeePrices, onChanged }) {
  const [editing, setEditing] = useState(null) // item id | 'new' | null
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const items = order.items || []

  const save = async (data, id) => {
    setSaving(true)
    try {
      const body = {
        product_desc: data.product_desc, product_type: data.product_type, uom: data.uom,
        width: data.width, height: data.height, qty: data.qty, unit_price: data.unit_price,
      }
      if (id === 'new') await api.post(`/orders/${order.id}/items`, body)
      else await api.patch(`/orders/${order.id}/items/${id}`, body)
      toast.success('Редът е запазен')
      setEditing(null)
      onChanged()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setSaving(false) }
  }

  const remove = async id => {
    try {
      await api.delete(`/orders/${order.id}/items/${id}`)
      toast.success('Редът е изтрит')
      onChanged()
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
  }

  const m2 = items.reduce((s, it) => s + (it.uom === 'm2' ? (+it.area_m2 || (it.width && it.height ? it.width * it.height / 1e6 : 0)) * (+it.qty || 1) : 0), 0)
  const linesTotal = items.reduce((s, it) => s + (+it.line_total || 0), 0)

  return (
    <div className="space-y-2">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Описание</th><th>Размер (мм)</th><th className="text-right">Бр.</th><th className="text-right">Площ</th>
              {canSeePrices && <th className="text-right">Цена</th>}
              {canSeePrices && <th className="text-right">Сума</th>}
              {canEdit && <th />}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && editing !== 'new' && (
              <tr><td colSpan={7} className="text-center py-8 text-muted">Няма въведени редове</td></tr>
            )}
            {items.map(it => editing === it.id ? (
              <ItemForm key={it.id} initial={it} orderType={order.order_type} saving={saving}
                onSave={d => save(d, it.id)} onCancel={() => setEditing(null)} />
            ) : (
              <tr key={it.id}>
                <td>
                  <span className="text-white">{it.product_desc}</span>
                  {it.notes && <div className="text-xs text-warning">{it.notes}</div>}
                  {it.product_type && it.product_type !== order.order_type && (
                    <div className="text-[11px] text-muted">{TYPE_LABELS[it.product_type] || it.product_type}</div>
                  )}
                </td>
                <td className="text-muted whitespace-nowrap">{it.width && it.height ? `${num(it.width, 0)} × ${num(it.height, 0)}` : '—'}</td>
                <td className="text-right">{num(it.qty)}</td>
                <td className="text-right text-muted text-xs whitespace-nowrap">
                  {it.uom === 'm2' && (it.area_m2 || (it.width && it.height))
                    ? `${num((+it.area_m2 || it.width * it.height / 1e6) * (+it.qty || 1), 3)} м²` : it.uom === 'lm' && it.billed_qty ? `${num(it.billed_qty)} л.м.` : '—'}
                </td>
                {canSeePrices && (
                  <td className="text-right text-muted whitespace-nowrap">
                    {it.unit_price ? `${(+it.unit_price).toFixed(2)} €${UNIT_SHORT[it.uom] ? '/' + UNIT_SHORT[it.uom] : ''}` : '—'}
                  </td>
                )}
                {canSeePrices && <td className="text-right font-semibold text-white whitespace-nowrap">{eur(it.line_total)}</td>}
                {canEdit && (
                  <td className="text-right whitespace-nowrap">
                    <button className="text-xs text-accent hover:underline mr-2" onClick={() => setEditing(it.id)}>Редактирай</button>
                    <button className="text-xs text-muted hover:text-danger" onClick={() => setDeleting(it)}>Изтрий</button>
                  </td>
                )}
              </tr>
            ))}
            {editing === 'new' && (
              <ItemForm initial={{ product_type: order.order_type }} orderType={order.order_type} saving={saving}
                onSave={d => save(d, 'new')} onCancel={() => setEditing(null)} />
            )}
          </tbody>
          {items.length > 0 && (
            <tfoot>
              <tr className="border-t border-border">
                <td colSpan={3} className="text-muted text-xs">{items.length} {items.length === 1 ? 'ред' : 'реда'}</td>
                <td className="text-right text-xs text-white font-medium">{m2 ? `${num(m2, 2)} м²` : ''}</td>
                {canSeePrices && <td />}
                {canSeePrices && <td className="text-right font-bold text-accent">{eur(linesTotal)}</td>}
                {canEdit && <td />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {canEdit && editing !== 'new' && (
        <button className="w-full border border-dashed border-border text-muted hover:text-white hover:border-accent/50 rounded-xl py-2 text-sm"
          onClick={() => setEditing('new')}>+ Добави ред</button>
      )}
      {canSeePrices && Math.abs(linesTotal - (+order.sale_price || 0)) > 0.01 && linesTotal > 0 && (
        <p className="text-xs text-muted">
          Цената на поръчката ({eur(order.sale_price)}) е зададена ръчно и се различава от сумата на редовете.
        </p>
      )}
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} danger title="Изтриване на ред"
        message={`Да изтрия ли „${deleting?.product_desc}“?`} onConfirm={() => remove(deleting.id)} />
    </div>
  )
}
