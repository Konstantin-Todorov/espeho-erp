import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Modal from '../ui/Modal'
import ClientPicker from '../ui/ClientPicker'
import {
  TYPE_LABELS, TYPE_OPTIONS, CATEGORY_LABELS, CATEGORY_OPTIONS, FULFILLMENT_LABELS, FULFILLMENT_OPTIONS,
  SOURCE_LABELS, SOURCE_OPTIONS, INSTALL_LABELS,
} from '../../utils/labels'

// Edit an existing order's header (everything except its lines, payments and status).
export default function EditOrderModal({ open, onClose, order, onSaved }) {
  const [f, setF] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !order) return
    setF({
      client: { id: order.client_id, name: order.client_name, phone: order.client_phone },
      deadline: order.deadline || '', is_urgent: order.is_urgent, notes: order.notes || '',
      delivery_address: order.delivery_address || '', fulfillment: order.fulfillment || 'вземане',
      installation_status: order.installation_status || '', order_type: order.order_type,
      order_category: order.order_category, source: order.source || 'office', external_ref: order.external_ref || '',
      sale_price: order.sale_price ?? '',
    })
  }, [open, order?.id])

  if (!f) return null
  const set = patch => setF(x => ({ ...x, ...patch }))

  const save = async e => {
    e.preventDefault()
    if (!f.client) return toast.error('Изберете клиент')
    setSaving(true)
    try {
      const { client, ...rest } = f
      await api.patch(`/orders/${order.id}`, {
        ...rest, client_id: client.id,
        deadline: f.deadline || null, sale_price: f.sale_price === '' ? null : f.sale_price,
        installation_status: f.installation_status || null,
      })
      toast.success('Поръчката е обновена')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка при запис')
    } finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Редакция на поръчка" size="lg">
      <form onSubmit={save} className="space-y-4">
        <div>
          <p className="label">Клиент</p>
          <ClientPicker value={f.client?.id} selected={f.client} onChange={c => set({ client: c })} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label>
            <span className="label">Срок</span>
            <input type="date" className="input" value={f.deadline} onChange={e => set({ deadline: e.target.value })} />
          </label>
          <label>
            <span className="label">Номер от кочана / офиса</span>
            <input className="input" value={f.external_ref} onChange={e => set({ external_ref: e.target.value })} />
          </label>
          <label>
            <span className="label">Как се предава</span>
            <select className="select" value={f.fulfillment} onChange={e => set({ fulfillment: e.target.value })}>
              {FULFILLMENT_OPTIONS.map(x => <option key={x} value={x}>{FULFILLMENT_LABELS[x]}</option>)}
            </select>
          </label>
          {f.fulfillment === 'монтаж' && (
            <label>
              <span className="label">Монтаж</span>
              <select className="select" value={f.installation_status} onChange={e => set({ installation_status: e.target.value })}>
                <option value="">— не е планиран</option>
                {Object.entries(INSTALL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
          )}
          {f.fulfillment !== 'вземане' && (
            <label className="sm:col-span-2">
              <span className="label">Адрес</span>
              <input className="input" value={f.delivery_address} onChange={e => set({ delivery_address: e.target.value })} />
            </label>
          )}
          <label>
            <span className="label">Вид поръчка</span>
            <select className="select" value={f.order_type} onChange={e => set({ order_type: e.target.value })}>
              {TYPE_OPTIONS.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Категория</span>
            <select className="select" value={f.order_category} onChange={e => set({ order_category: e.target.value })}>
              {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Откъде дойде</span>
            <select className="select" value={f.source} onChange={e => set({ source: e.target.value })}>
              {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{SOURCE_LABELS[s]}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Крайна цена с ДДС (€)</span>
            <input type="number" step="0.01" className="input" value={f.sale_price} onChange={e => set({ sale_price: e.target.value })} />
          </label>
          <label className="flex items-center gap-3 sm:col-span-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-danger" checked={f.is_urgent} onChange={e => set({ is_urgent: e.target.checked })} />
            <span className="text-sm text-gray-200">Спешна поръчка</span>
          </label>
          <label className="sm:col-span-2">
            <span className="label">Бележки</span>
            <textarea className="input resize-none" rows={3} value={f.notes} onChange={e => set({ notes: e.target.value })} />
          </label>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Запис…' : 'Запази'}</button>
        </div>
      </form>
    </Modal>
  )
}
