import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import OrderPicker from '../components/ui/OrderPicker'
import toast from 'react-hot-toast'
import { orderNo, dateBg, eur } from '../utils/labels'

const CAUSE_OPTIONS = ['машинна_грешка','човешка_грешка','дефект_материал','грешка_размер','транспортна_повреда','друго']
const CAUSE_LABELS  = { машинна_грешка:'Машинна грешка', човешка_грешка:'Човешка грешка', дефект_материал:'Дефект материал', грешка_размер:'Грешка в размера', транспортна_повреда:'Транспортна повреда', друго:'Друго' }
const DECISION_LABELS = { преработка: 'Преработка', отписване: 'Отписване' }
const PAGE_SIZE = 50

const emptyForm = userId => ({
  order_id: '', stage_id: '', machine_id: '', worker_id: userId || '', cause_type: 'човешка_грешка',
  cause_notes: '', material_cost: '', labor_cost: '', decision: '', notes: '',
})

function CreateDefectModal({ open, onClose, onCreated, prefillOrderId }) {
  const { user, canSeePrices } = useAuth()
  const [stages, setStages] = useState([])
  const [machines, setMachines] = useState([])
  const [workers, setWorkers] = useState([])
  const [form, setForm] = useState(() => emptyForm(user?.id))
  const [loading, setLoading] = useState(false)

  const loadStages = orderId => {
    if (!orderId) return setStages([])
    api.get(`/production/stages/${orderId}`).then(r => setStages(r.data)).catch(() => setStages([]))
  }

  useEffect(() => {
    if (!open) return
    api.get('/machines').then(r => setMachines(r.data)).catch(() => {})
    api.get('/production/workers').then(r => setWorkers(r.data)).catch(() => {})
    if (prefillOrderId) {
      setForm(f => ({ ...f, order_id: prefillOrderId }))
      loadStages(prefillOrderId)
    }
  }, [open, prefillOrderId])

  const handleOrderChange = order => {
    setForm(f => ({ ...f, order_id: order?.id || '', stage_id: '' }))
    loadStages(order?.id)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.order_id || !form.cause_type) return toast.error('Изберете поръчка и причина')
    setLoading(true)
    try {
      const payload = {
        order_id: form.order_id,
        stage_id: form.stage_id || null,
        machine_id: form.machine_id || null,
        worker_id: form.worker_id || null,
        cause_type: form.cause_type,
        cause_notes: form.cause_notes || null,
        decision: form.decision || null,
      }
      if (canSeePrices) {
        payload.material_cost = +form.material_cost || 0
        payload.labor_cost = +form.labor_cost || 0
      }
      const res = await api.post('/defects', payload)
      toast.success('Бракът е регистриран')
      onCreated(res.data)
      onClose()
      setForm(emptyForm(user?.id))
      setStages([])
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setLoading(false) }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <Modal open={open} onClose={onClose} title="Регистрирай брак" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Поръчка *</label>
            <OrderPicker value={form.order_id} onChange={handleOrderChange} />
          </div>
          <div>
            <label className="label">Производствен етап</label>
            <select className="select" value={form.stage_id} onChange={e => set('stage_id', e.target.value)} disabled={!form.order_id}>
              <option value="">-- Без етап --</option>
              {stages.map(s => <option key={s.id} value={s.id}>{s.stage_name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Отговорен работник</label>
            <select className="select" value={form.worker_id} onChange={e => set('worker_id', e.target.value)}>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name}{w.id === user?.id ? ' (аз)' : ''}</option>)}
              {!workers.length && <option value={user?.id || ''}>{user?.name || 'Аз'}</option>}
            </select>
          </div>
          <div>
            <label className="label">Причина *</label>
            <select className="select" value={form.cause_type} onChange={e => set('cause_type', e.target.value)} required>
              {CAUSE_OPTIONS.map(c => <option key={c} value={c}>{CAUSE_LABELS[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Машина</label>
            <select className="select" value={form.machine_id} onChange={e => set('machine_id', e.target.value)}>
              <option value="">-- Без машина --</option>
              {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          {canSeePrices && (
            <>
              <div>
                <label className="label">Стойност материали (€)</label>
                <input type="number" step="0.01" min="0" className="input" placeholder="0.00" value={form.material_cost}
                  onChange={e => set('material_cost', e.target.value)} />
              </div>
              <div>
                <label className="label">Стойност труд (€)</label>
                <input type="number" step="0.01" min="0" className="input" placeholder="0.00" value={form.labor_cost}
                  onChange={e => set('labor_cost', e.target.value)} />
              </div>
            </>
          )}
          <div>
            <label className="label">Решение</label>
            <select className="select" value={form.decision} onChange={e => set('decision', e.target.value)}>
              <option value="">-- Нерешен --</option>
              {Object.entries(DECISION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Описание на причината</label>
          <textarea className="input resize-none" rows={2} value={form.cause_notes}
            onChange={e => set('cause_notes', e.target.value)} placeholder="Опишете какво точно се е случило..." />
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-danger" disabled={loading}>Регистрирай брак</button>
        </div>
      </form>
    </Modal>
  )
}

function ResolveModal({ defect, onClose, onResolved }) {
  const [decision, setDecision] = useState('преработка')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (defect) { setDecision('преработка'); setNotes('') } }, [defect?.id])

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch(`/defects/${defect.id}/resolve`, { decision, notes })
      toast.success('Решението е записано')
      onResolved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setSaving(false) }
  }

  return (
    <Modal open={!!defect} onClose={onClose} title={`Решение за брак — ${defect ? orderNo(defect) : ''}`} size="sm">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Решение *</label>
          <select className="select" value={decision} onChange={e => setDecision(e.target.value)}>
            {Object.entries(DECISION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Бележка</label>
          <textarea className="input resize-none" rows={2} value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Напр. преработено на 12.10, ново стъкло от склада" />
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-primary" disabled={saving}>Запиши</button>
        </div>
      </form>
    </Modal>
  )
}

export default function Defects() {
  const [defects, setDefects] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [resolving, setResolving] = useState(null)
  const [filters, setFilters] = useState({ cause_type: '', from: '', to: '' })
  const { isOffice, isProduction, canSeePrices } = useAuth()
  const canReport = isOffice || isProduction
  const [searchParams, setSearchParams] = useSearchParams()
  const [prefillOrderId, setPrefillOrderId] = useState(null)

  const fetchDefects = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: PAGE_SIZE }
      if (filters.cause_type) params.cause_type = filters.cause_type
      if (filters.from) params.from = filters.from
      if (filters.to) params.to = filters.to
      const { data } = await api.get('/defects', { params })
      setDefects(data.data)
      setTotal(data.total)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Бракът не може да бъде зареден')
    } finally { setLoading(false) }
  }, [filters, page])

  useEffect(() => { fetchDefects() }, [fetchDefects])

  // ?new=1 (global "+ Нов") or ?order_id=… (from an order) opens the form once, then clears the URL
  const newParam = searchParams.get('new')
  const orderParam = searchParams.get('order_id')
  useEffect(() => {
    const orderId = orderParam
    if (newParam || orderId) {
      if (orderId) setPrefillOrderId(orderId)
      if (canReport) setCreateOpen(true)
      const next = new URLSearchParams(searchParams)
      next.delete('new'); next.delete('order_id')
      setSearchParams(next, { replace: true })
    }
  }, [newParam, orderParam])

  const setFilter = (k, v) => { setPage(1); setFilters(f => ({ ...f, [k]: v })) }
  const pageCost = defects.reduce((s, d) => s + Number(d.total_cost || 0), 0)
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const colCount = 8 + (canSeePrices ? 1 : 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Брак</h1>
          <p className="text-sm text-muted mt-0.5">
            {total} записа
            {canSeePrices && defects.length > 0 && ` · ${eur(pageCost, { dash: false })} на страницата`}
          </p>
        </div>
        {canReport && (
          <button className="btn-danger" onClick={() => { setPrefillOrderId(null); setCreateOpen(true) }}>
            + Регистрирай брак
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select className="select w-48" value={filters.cause_type} onChange={e => setFilter('cause_type', e.target.value)}>
          <option value="">Всички причини</option>
          {CAUSE_OPTIONS.map(c => <option key={c} value={c}>{CAUSE_LABELS[c]}</option>)}
        </select>
        <input type="date" className="input w-40" value={filters.from} onChange={e => setFilter('from', e.target.value)} />
        <span className="text-muted self-center">—</span>
        <input type="date" className="input w-40" value={filters.to} onChange={e => setFilter('to', e.target.value)} />
      </div>

      {loading ? <PageLoader /> : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Поръчка</th><th>Причина</th><th>Отговорен</th><th>Машина</th>
                <th>Етап</th>{canSeePrices && <th className="text-right">Стойност</th>}<th>Решение</th><th>Дата</th><th></th>
              </tr>
            </thead>
            <tbody>
              {defects.length === 0 && (
                <tr><td colSpan={colCount} className="text-center py-12 text-muted">Няма регистриран брак</td></tr>
              )}
              {defects.map(d => (
                <tr key={d.id}>
                  <td>
                    <Link to={`/orders/${d.order_id}`} className="text-accent hover:underline font-medium">
                      {orderNo(d)}
                    </Link>
                  </td>
                  <td>
                    <div className="font-medium text-white">{CAUSE_LABELS[d.cause_type] || d.cause_type}</div>
                    {d.cause_notes && <div className="text-xs text-muted">{d.cause_notes.slice(0, 60)}{d.cause_notes.length > 60 ? '...' : ''}</div>}
                  </td>
                  <td>
                    <div>{d.worker_name}</div>
                    {d.reported_by_name && d.reported_by_name !== d.worker_name && (
                      <div className="text-xs text-muted">въведен от {d.reported_by_name}</div>
                    )}
                  </td>
                  <td className="text-muted">{d.machine_name || '—'}</td>
                  <td className="text-muted">{d.stage_name || '—'}</td>
                  {canSeePrices && (
                    <td className="text-right text-danger font-medium">{eur(d.total_cost)}</td>
                  )}
                  <td>
                    {d.decision ? (
                      <span className={`badge ${d.decision === 'преработка' ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-500/20 text-gray-400'}`}
                        title={d.resolved_by_name ? `Решено от ${d.resolved_by_name}${d.notes ? ` — ${d.notes}` : ''}` : d.notes || ''}>
                        {DECISION_LABELS[d.decision] || d.decision}
                      </span>
                    ) : <span className="badge bg-red-500/20 text-red-400">Нерешен</span>}
                  </td>
                  <td className="text-muted text-xs whitespace-nowrap">{dateBg(d.created_at)}</td>
                  <td className="text-right">
                    {!d.decision && canReport && (
                      <button className="btn-ghost text-xs py-1" onClick={() => setResolving(d)}>Реши</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-muted">Страница {page} от {pages}</span>
          <div className="flex gap-2">
            <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Предишна</button>
            <button className="btn-secondary" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Следваща →</button>
          </div>
        </div>
      )}

      <CreateDefectModal open={createOpen} onClose={() => setCreateOpen(false)}
        onCreated={() => fetchDefects()} prefillOrderId={prefillOrderId} />
      <ResolveModal defect={resolving} onClose={() => setResolving(null)} onResolved={fetchDefects} />
    </div>
  )
}
