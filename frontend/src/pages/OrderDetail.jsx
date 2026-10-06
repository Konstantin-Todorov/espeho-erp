import { useState, useEffect } from 'react'
import { AlertTriangle, Check, ClipboardList, Cog, Copy, FileText, HardHat, ListChecks, MapPin, Paperclip, Pencil, Printer, RefreshCw, Truck, Upload } from 'lucide-react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { OrderStatusBadge, StageStatusBadge, UrgentBadge, CategoryBadge } from '../components/ui/StatusBadge'
import { PageLoader } from '../components/ui/Spinner'
import Modal, { ConfirmDialog } from '../components/ui/Modal'
import CreatableInput from '../components/ui/CreatableInput'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'
import { bg } from 'date-fns/locale'
import { printWorkOrder, printDeliveryNote } from '../utils/printOrder'
import { downloadFile } from '../utils/download'
import useSettings from '../hooks/useSettings'
import OrderItems from '../components/order/OrderItems'
import PaymentCard from '../components/order/PaymentCard'
import EditOrderModal from '../components/order/EditOrderModal'
import HandoverDialog from '../components/order/HandoverDialog'
import useOptions from '../hooks/useOptions'
import {
  TYPE_LABELS, SOURCE_LABELS, FULFILLMENT_LABELS, INSTALL_LABELS, CATEGORY_LABELS, STATUS_HINTS, STATUS_ACTIONS,
  orderNo, eur, dateBg, isOverdue as isOrderOverdue,
} from '../utils/labels'


// The natural next step(s) are the big buttons; anything else the user may do goes to a small menu
const NATURAL_NEXT = {
  'НОВА': ['ПРОИЗВОДСТВО', 'МАТЕРИАЛИ'],
  'МАТЕРИАЛИ': ['ПРОИЗВОДСТВО'],
  'ПРОИЗВОДСТВО': ['ГОТОВА'],
  'ГОТОВА': ['ДОСТАВЕНА'],
}

// ─── Cost Card ────────────────────────────────────────────────────────────────
const fmt = v => (v && Number(v) > 0) ? `${Number(v).toFixed(2)} €` : '—'

function CostCard({ costs, salePrice, vatPct }) {
  if (!costs) return null
  const hasCosts = Number(costs.total_cost) > 0
  // Sale price is with VAT, costs are without — compare like with like
  const net = salePrice ? Number(salePrice) / (1 + (Number(vatPct) || 20) / 100) : null
  const margin = net && hasCosts ? net - Number(costs.total_cost) : null
  const marginPct = margin !== null ? (margin / net * 100).toFixed(1) : null

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Себестойност</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Материали</span>
          <span className="text-white font-medium">{fmt(costs.material_cost)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Труд</span>
          <span className="text-white font-medium">{fmt(costs.labor_cost)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Машини</span>
          <span className="text-white font-medium">{fmt(costs.machine_cost)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Режийни {costs.overhead_pct ? `(${costs.overhead_pct}%)` : ''}</span>
          <span className="text-white font-medium">{fmt(costs.overhead_cost)}</span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between font-bold">
          <span className="text-gray-200">Себестойност</span>
          <span className={hasCosts ? 'text-white' : 'text-muted'}>{hasCosts ? `${Number(costs.total_cost).toFixed(2)} €` : 'Не е изчислена'}</span>
        </div>
        {net && (
          <>
            <div className="flex justify-between">
              <span className="text-muted">Продажна цена без ДДС</span>
              <span className="text-white font-medium">{net.toFixed(2)} €</span>
            </div>
            {margin !== null && (
              <div className={`flex justify-between font-bold border-t border-border pt-2 ${margin > 0 ? 'text-green-400' : 'text-danger'}`}>
                <span>Марж</span>
                <span>{margin.toFixed(2)} € ({marginPct}%)</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Log Labor Modal ──────────────────────────────────────────────────────────
function LogLaborModal({ open, onClose, orderId, stages, workers, currentUser, onLogged }) {
  const isPrivileged = ['admin','office'].includes(currentUser?.role)
  const [form, setForm] = useState({ worker_id: '', stage_id: '', minutes: '', description: '', notes: '' })
  const [loading, setLoading] = useState(false)

  const reset = () => setForm({ worker_id: '', stage_id: '', minutes: '', description: '', notes: '' })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/production/labor', {
        order_id: orderId,
        stage_id: form.stage_id || null,
        minutes: +form.minutes,
        description: form.description || null,
        notes: form.notes || null,
        worker_id: isPrivileged && form.worker_id ? form.worker_id : undefined,
      })
      toast.success('Работата е записана')
      onLogged()
      onClose()
      reset()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setLoading(false) }
  }

  const minutePresets = [30, 60, 90, 120, 180, 240]

  return (
    <Modal open={open} onClose={onClose} title="Запиши извършена работа" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {isPrivileged && workers.length > 0 && (
          <div>
            <label className="label">Работник *</label>
            <select className="select" value={form.worker_id} onChange={e=>setForm(f=>({...f,worker_id:e.target.value}))} required>
              <option value="">— Изберете работник</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name} {w.role_label ? `(${w.role_label})` : ''}</option>)}
            </select>
          </div>
        )}
        {!isPrivileged && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/10 text-sm text-accent">
            <HardHat className="w-4 h-4" />
            <span>Записва се за: <strong>{currentUser?.name}</strong></span>
          </div>
        )}
        <div>
          <label className="label">Производствен етап</label>
          <select className="select" value={form.stage_id} onChange={e=>setForm(f=>({...f,stage_id:e.target.value}))}>
            <option value="">— Общо за поръчката (без конкретен етап)</option>
            {stages.map(s => (
              <option key={s.id} value={s.id}>
                {s.status === 'ГОТОВ' ? '(готов) ' : s.status === 'В_ПРОЦЕС' ? '(в процес) ' : ''}{s.stage_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Извършена работа</label>
          <input className="input" placeholder="Какво беше направено (напр. рязане 4 листа 6мм)…"
            value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
        </div>
        <div>
          <label className="label">Продължителност (минути) *</label>
          <input type="number" className="input" min="1" max="960" placeholder="60"
            value={form.minutes} onChange={e=>setForm(f=>({...f,minutes:e.target.value}))} required />
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {minutePresets.map(m => (
              <button key={m} type="button"
                onClick={() => setForm(f=>({...f,minutes:String(m)}))}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                  form.minutes === String(m) ? 'bg-accent text-white border-accent' : 'border-border text-muted hover:text-white hover:border-accent/50'
                }`}>
                {m >= 60 ? `${m/60}ч` : `${m}м`}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Допълнителна бележка</label>
          <input className="input" placeholder="Незадължително…"
            value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} />
        </div>
        <div className="flex gap-3 justify-end pt-1">
          <button type="button" className="btn-secondary" onClick={() => { onClose(); reset() }}>Откажи</button>
          <button type="submit" className="btn-primary" disabled={loading || !form.minutes}>
            {loading ? 'Записва...' : <><Check className="w-4 h-4" /> Запиши работата</>}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
const TIMELINE_ICONS = {
  created:   { icon: ClipboardList, color: 'bg-accent/20 text-accent border-accent/30' },
  stage:     { icon: Cog, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  stage_done:{ icon: Check, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  labor:     { icon: HardHat, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  defect:    { icon: AlertTriangle, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  file:      { icon: Paperclip, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  status:    { icon: RefreshCw, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
}

// Field names and value formatting for the change history
const FIELD_LABELS = {
  client_id: 'Клиент', order_type: 'Вид', order_category: 'Категория', payment_status: 'Плащане',
  installation_status: 'Монтаж', fulfillment: 'Предаване', deadline: 'Срок', is_urgent: 'Спешна',
  sale_price: 'Цена', notes: 'Бележки', delivery_address: 'Адрес', source: 'Откъде', external_ref: 'Номер',
  product_desc: 'Описание', width: 'Ширина', height: 'Височина', qty: 'Брой', unit_price: 'Ед. цена',
  uom: 'Мярка', line_total: 'Сума',
}
const fmtVal = (k, v) => {
  if (v === null || v === undefined || v === '') return '—'
  if (k === 'deadline') return dateBg(v, 'd.MM.yy')
  if (k === 'is_urgent') return v ? 'да' : 'не'
  if (['sale_price', 'unit_price', 'line_total'].includes(k)) return `${Number(v).toFixed(2)} €`
  if (k === 'client_id') return 'друг клиент'
  if (k === 'notes' || k === 'delivery_address') return String(v).length > 40 ? String(v).slice(0, 40) + '…' : v
  return String(v)
}
const describeChanges = obj => Object.entries(obj || {})
  .filter(([k, v]) => Array.isArray(v) && FIELD_LABELS[k])
  .map(([k, [a, b]]) => `${FIELD_LABELS[k]}: ${fmtVal(k, a)} → ${fmtVal(k, b)}`).join(' · ')

function historyEvents(history = []) {
  return history.flatMap(h => {
    const d = h.new_data || {}, old = h.old_data || {}
    switch (h.action) {
      case 'order_edit':    return [{ type: 'status', at: h.created_at, label: 'Редакция на поръчката', sub: `${describeChanges(d)} · ${h.user_name || ''}` }]
      case 'item_add':      return [{ type: 'file', at: h.created_at, label: `Добавен ред: ${d.desc}`, sub: `${d.line_total ? Number(d.line_total).toFixed(2) + ' € · ' : ''}${h.user_name || ''}` }]
      case 'item_edit':     return [{ type: 'file', at: h.created_at, label: `Променен ред: ${d.desc}`, sub: `${describeChanges(d)} · ${h.user_name || ''}` }]
      case 'item_delete':   return [{ type: 'defect', at: h.created_at, label: `Изтрит ред: ${old.desc}`, sub: h.user_name || '' }]
      case 'payment_delete':return [{ type: 'defect', at: h.created_at, label: `Изтрито плащане: ${Number(old.amount).toFixed(2)} €`, sub: h.user_name || '' }]
      default: return []
    }
  })
}

function buildTimeline(order) {
  const events = []

  // Created
  events.push({
    type: 'created',
    at: order.created_at,
    label: `Поръчката е създадена от ${order.created_by_name}`,
    sub: `${TYPE_LABELS[order.order_type] || order.order_type}${order.external_ref ? ` · № ${order.external_ref}` : ''}`,
  })

  // Stages
  order.stages?.forEach(s => {
    if (s.started_at) {
      events.push({
        type: 'stage',
        at: s.started_at,
        label: `Етап "${s.stage_name}" е започнат`,
        sub: s.worker_name || '',
      })
    }
    if (s.completed_at) {
      events.push({
        type: 'stage_done',
        at: s.completed_at,
        label: `Етап "${s.stage_name}" е завършен`,
        sub: s.worker_name || '',
      })
    }
  })

  // Labor entries
  order.labor?.forEach(l => {
    events.push({
      type: 'labor',
      at: l.logged_at,
      label: `Труд записан: ${l.minutes} мин`,
      sub: `${l.worker_name}${l.stage_name ? ` · ${l.stage_name}` : ''}${l.notes ? ` · ${l.notes}` : ''}`,
    })
  })

  // Defects
  order.defects?.forEach(d => {
    events.push({
      type: 'defect',
      at: d.created_at,
      label: `Брак: ${order.causeLabel ? order.causeLabel(d.cause_type) : d.cause_type}`,
      sub: `${d.worker_name}${d.cause_notes ? ` · ${d.cause_notes}` : ''}`,
    })
  })

  // Files
  order.files?.forEach(f => {
    events.push({
      type: 'file',
      at: f.created_at,
      label: `Файл прикачен: ${f.original_name}`,
      sub: f.uploaded_by_name || '',
    })
  })

  // Status changes (recorded as comments starting with "Статус:")
  order.comments?.filter(c => c.message?.startsWith('Статус:')).forEach(c => {
    events.push({ type: 'status', at: c.created_at, label: c.message, sub: c.user_name })
  })

  // Payments
  order.payments?.forEach(p => {
    events.push({ type: 'labor', at: p.created_at, label: `Плащане: ${Number(p.amount).toFixed(2)} € (${p.method})`, sub: p.created_by_name || '' })
  })

  events.push(...historyEvents(order.history))

  // Sort chronologically
  return events.sort((a, b) => new Date(a.at) - new Date(b.at))
}

function Timeline({ order }) {
  const events = buildTimeline(order)

  if (events.length === 0) {
    return <div className="card text-center py-8 text-muted">Няма история</div>
  }

  return (
    <div className="space-y-0">
      {events.map((ev, i) => {
        const { icon, color } = TIMELINE_ICONS[ev.type] || TIMELINE_ICONS.status
        const isLast = i === events.length - 1
        return (
          <div key={i} className="flex gap-4">
            {/* Icon + line */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 ${color}`}>
                {(() => { const I = icon; return <I className="w-4 h-4" /> })()}
              </div>
              {!isLast && <div className="w-px flex-1 bg-border my-1" />}
            </div>
            {/* Content */}
            <div className={`pb-4 ${isLast ? '' : ''}`}>
              <p className="text-white text-sm font-medium">{ev.label}</p>
              {ev.sub && <p className="text-muted text-xs">{ev.sub}</p>}
              <p className="text-muted text-xs mt-0.5">
                {dateBg(ev.at, 'd MMM yyyy · HH:mm')}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Add Stage Inline ─────────────────────────────────────────────────────────
function AddStageInline({ orderId, onAdded }) {
  const { lists } = useOptions()
  // Every stage name used anywhere (all templates + extra stages), without duplicates
  const suggestions = [...new Set(Object.entries(lists)
    .filter(([k]) => k.startsWith('stages:') || k === 'stage_extra').flatMap(([, v]) => v.map(o => o.label)))]
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await api.post('/production/stages', { order_id: orderId, stage_name: name.trim() })
      toast.success('Етапът е добавен')
      setName(''); setOpen(false)
      onAdded()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setSaving(false) }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="w-full border border-dashed border-border text-muted hover:text-white hover:border-accent/50 rounded-xl py-2 text-sm transition-colors">
      + Добави производствен етап
    </button>
  )

  return (
    <div className="card border-accent/30 flex items-center gap-2">
      <CreatableInput
        value={name}
        onChange={setName}
        suggestions={suggestions}
        placeholder="Напиши или избери етап..."
        className="flex-1"
      />
      <button className="btn-primary py-1.5 text-sm" onClick={handleSave} disabled={saving || !name.trim()}>
        {saving ? '...' : 'Добави'}
      </button>
      <button className="btn-secondary py-1.5 text-sm" onClick={() => { setOpen(false); setName('') }}>
        Откажи
      </button>
    </div>
  )
}


// ─── Main Component ───────────────────────────────────────────────────────────
export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin, isOffice, isProduction, canSeePrices } = useAuth()
  const settings = useSettings()
  const { label: optLabel } = useOptions()
  const [history, setHistory] = useState([])
  const [editOpen, setEditOpen] = useState(false)
  const [confirmStatus, setConfirmStatus] = useState(null)
  const [handoverOpen, setHandoverOpen] = useState(false)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [laborOpen, setLaborOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(null)
  const [workers, setWorkers] = useState([])
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [qualityChecks, setQualityChecks] = useState([])
  const [deliveries, setDeliveries] = useState([])

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`)
      setOrder(data)
      if (['admin','office'].includes(user?.role)) api.get(`/orders/${id}/history`).then(r => setHistory(r.data)).catch(() => {})
      // Open on the most useful tab: production while it's in the shop, otherwise the lines
      setActiveTab(t => t || (['МАТЕРИАЛИ','ПРОИЗВОДСТВО'].includes(data.status) && data.stages.length ? 'stages' : 'items'))
    } catch {
      toast.error('Поръчката не е намерена')
      navigate('/orders')
    } finally { setLoading(false) }
  }

  const fetchComments = () => api.get(`/comments/${id}`).then(r => setComments(r.data)).catch(() => {})

  const fetchQuality = () => api.get(`/quality/${id}`).then(r => setQualityChecks(r.data)).catch(() => {})
  const fetchDeliveries = () => api.get(`/deliveries/order/${id}`).then(r => setDeliveries(r.data)).catch(() => {})

  useEffect(() => {
    fetchOrder()
    fetchComments()
    fetchQuality()
    fetchDeliveries()
    api.get('/production/workers').then(r => setWorkers(r.data)).catch(() => {})
  }, [id])

  const sendComment = async () => {
    if (!newComment.trim()) return
    setSendingComment(true)
    try {
      const { data } = await api.post(`/comments/${id}`, { message: newComment })
      setComments(c => [...c, data])
      setNewComment('')
    } catch { toast.error('Грешка') }
    finally { setSendingComment(false) }
  }

  const uploadFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingFile(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      await api.post(`/files/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Файлът е качен')
      fetchOrder()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка при качване')
    } finally { setUploadingFile(false); e.target.value = '' }
  }

  const advanceStatus = async status => {
    try {
      await api.patch(`/orders/${id}/status`, { status })
      toast.success(`Статусът е обновен → ${status}`)
      fetchOrder()
      fetchComments()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    }
  }

  const updateStage = async (stageId, status) => {
    try {
      await api.patch(`/production/stages/${stageId}`, { status })
      toast.success('Етапът е обновен')
      fetchOrder()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    }
  }

  if (loading) return <PageLoader />
  if (!order) return null

  const allowed = order.allowed_statuses || []
  const forward = (NATURAL_NEXT[order.status] || []).filter(s => allowed.includes(s))
  const other = allowed.filter(s => !forward.includes(s))
  const isOverdue = isOrderOverdue(order)
  const done = ['ДОСТАВЕНА','ОТКАЗАНА'].includes(order.status)
  const hasShopWork = order.stages.length > 0 && !(done && order.stages.every(s => s.status === 'ЧАКАЩ'))
  const orderWithHistory = { ...order, comments, history, causeLabel: v => optLabel('defect_cause', v) }

  const qualityDone = qualityChecks.filter(c => c.checked).length
  const qualityTotal = qualityChecks.length

  // Tabs that don't apply are hidden (e.g. no shop tabs for an old delivered order)
  const TABS = [
    { id: 'items',    label: 'Артикули', badge: null },
    hasShopWork && { id: 'stages', label: 'Производство' },
    hasShopWork && user?.role !== 'warehouse' && { id: 'quality', label: 'Контрол', badge: qualityTotal > 0 ? `${qualityDone}/${qualityTotal}` : null },
    { id: 'comments', label: 'Коментари', badge: comments.filter(c => !c.message?.startsWith('Статус:')).length },
    { id: 'files',    label: 'Файлове', badge: order.files?.length || 0 },
    (order.defects?.length > 0 || !done) && { id: 'defects', label: 'Брак', badge: order.defects?.filter(d => !d.decision).length },
    hasShopWork && user?.role !== 'warehouse' && { id: 'labor', label: 'Труд' },
    { id: 'history',  label: 'История' },
  ].filter(Boolean)

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/orders" className="text-muted hover:text-white text-sm">← Поръчки</Link>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">Поръчка {orderNo(order)}</h1>
            {order.external_ref && <span className="text-sm text-muted">#{order.order_number}</span>}
            <span title={STATUS_HINTS[order.status]}><OrderStatusBadge status={order.status} /></span>
            <CategoryBadge category={order.order_category} />
            {order.is_urgent && <UrgentBadge />}
            {isOverdue && <span className="badge bg-red-500/20 text-red-400 border border-red-500/30"><AlertTriangle className="w-3.5 h-3.5 inline mr-1 align-[-2px]" />Просрочена</span>}
          </div>
          <p className="text-muted text-sm mt-1">
            {order.client_name} · {TYPE_LABELS[order.order_type] || order.order_type} · {dateBg(order.created_at)} · {order.created_by_name}
          </p>
          <p className="text-xs text-muted mt-0.5">{STATUS_HINTS[order.status]}</p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
        {/* Main action: move the order forward */}
        {forward.length > 0 && (
          <div className="flex gap-2 flex-wrap justify-end">
            {forward.map(s => (
              <button key={s} className="btn-primary" title={STATUS_HINTS[s]}
                onClick={() => (s === 'ДОСТАВЕНА' && canSeePrices) ? setHandoverOpen(true) : advanceStatus(s)}>
                {STATUS_ACTIONS[s] || s} →
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2 flex-wrap justify-end">
          {isOffice && (
            <button className="btn-secondary" onClick={() => setEditOpen(true)}><Pencil className="w-4 h-4" /> Редактирай</button>
          )}
          {(isAdmin || user?.role === 'office') && (
            <button className="btn-secondary" title="Клонирай поръчката"
              onClick={async () => {
                try {
                  const { data } = await api.post(`/orders/${id}/clone`, {})
                  toast.success(`Клонирана → Поръчка #${data.order_number}`)
                  navigate(`/orders/${data.id}`)
                } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
              }}>
              <Copy className="w-4 h-4" /> Клонирай
            </button>
          )}
          <button className="btn-secondary" onClick={() => printWorkOrder(order)} title="Производствен лист">
            <Printer className="w-4 h-4" /> Лист
          </button>
          {(isAdmin || user?.role === 'office') && (
            <button className="btn-secondary" onClick={() => printDeliveryNote(order, settings)} title="Доставателна бележка">
              <FileText className="w-4 h-4" /> Бележка
            </button>
          )}
          {(isProduction || isAdmin || user?.role === 'office') && order.status === 'ПРОИЗВОДСТВО' && (
            <button className="btn-secondary" onClick={() => setLaborOpen(true)}>
              + Запиши работа
            </button>
          )}
          {other.length > 0 && (
            <select className="select w-auto text-sm" value="" title="Други смени на статуса"
              onChange={e => e.target.value && setConfirmStatus(e.target.value)}>
              <option value="">Смени статус…</option>
              {other.map(s => <option key={s} value={s}>{s === 'ОТКАЗАНА' ? 'Откажи поръчката' : `→ ${s}`}</option>)}
            </select>
          )}
        </div>
        </div>
      </div>

      {(order.related_original || order.related_claims?.length > 0) && (
        <div className="card mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm border-purple-500/30">
          <Link2 className="w-4 h-4 text-purple-400" />
          {order.related_original && (
            <span className="text-gray-300">Рекламация / преработка по поръчка{' '}
              <Link to={`/orders/${order.related_original.id}`} className="text-accent font-semibold hover:underline">{orderNo(order.related_original)}</Link>
            </span>
          )}
          {order.related_claims?.length > 0 && (
            <span className="text-gray-300">Рекламации по тази поръчка:{' '}
              {order.related_claims.map((c, i) => (
                <span key={c.id}>{i > 0 && ', '}<Link to={`/orders/${c.id}`} className="text-accent font-semibold hover:underline">{orderNo(c)}</Link></span>
              ))}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Info */}
          <div className="card grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted text-xs uppercase tracking-wide">Клиент</p>
              {isOffice
                ? <Link to={`/clients/${order.client_id}`} className="text-white font-medium mt-0.5 hover:text-accent block">{order.client_name}</Link>
                : <p className="text-white font-medium mt-0.5">{order.client_name}</p>}
              {order.client_phone && <a href={`tel:${order.client_phone}`} className="text-muted hover:text-accent">{order.client_phone}</a>}
            </div>
            <div>
              <p className="text-muted text-xs uppercase tracking-wide">Срок</p>
              <p className={`font-medium mt-0.5 ${isOverdue ? 'text-danger' : 'text-white'}`}>
                {dateBg(order.deadline, 'd MMMM yyyy')}
              </p>
              {order.delivered_at && <p className="text-xs text-muted">Предадена: {dateBg(order.delivered_at)}</p>}
            </div>
            <div>
              <p className="text-muted text-xs uppercase tracking-wide">Предаване</p>
              <p className="text-white font-medium mt-0.5">{FULFILLMENT_LABELS[order.fulfillment] || '—'}</p>
              {order.installation_status && <p className="text-xs text-cyan-400">{INSTALL_LABELS[order.installation_status]}</p>}
            </div>
            {order.delivery_address && (
              <div className="col-span-full">
                <p className="text-muted text-xs uppercase tracking-wide">Адрес</p>
                <p className="text-gray-300 mt-0.5">{order.delivery_address}</p>
              </div>
            )}
            {order.notes && (
              <div className="col-span-full">
                <p className="text-muted text-xs uppercase tracking-wide">Бележки</p>
                <p className="text-gray-300 mt-0.5">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border gap-1 overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap
                  ${activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-white'}`}>
                {tab.label}
                {(tab.badge > 0 || (typeof tab.badge === 'string' && tab.badge)) && (
                  <span className={`ml-1 badge text-xs ${tab.id === 'quality' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Stages tab */}
          {activeTab === 'stages' && (
            <div className="space-y-2">
              {order.status === 'МАТЕРИАЛИ' && (
                <div className="card text-sm text-muted">Поръчката чака материали — етапите ще могат да се работят, когато бъде пусната в производство.</div>
              )}
              {isOffice && !done && (
                <AddStageInline orderId={order.id} onAdded={fetchOrder} />
              )}
              {order.stages.map((stage, i) => (
                <div key={stage.id} className={`card flex items-center justify-between gap-4
                  ${stage.status === 'В_ПРОЦЕС' ? 'border-orange-500/40' : ''}
                  ${stage.status === 'ГОТОВ' ? 'border-green-500/30' : ''}`}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                      ${stage.status==='ГОТОВ' ? 'bg-green-500/20 text-green-400' :
                        stage.status==='В_ПРОЦЕС' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-border text-muted'}`}>
                      {stage.status === 'ГОТОВ' ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white">{stage.stage_name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {(isAdmin || user?.role === 'office') && stage.status !== 'ГОТОВ' ? (
                          <select
                            className="text-xs bg-surface border border-border rounded px-1.5 py-0.5 text-muted hover:border-accent/50 focus:outline-none focus:border-accent cursor-pointer"
                            value={stage.assigned_to || ''}
                            onChange={async e => {
                              await api.patch(`/production/stages/${stage.id}`, { assigned_to: e.target.value || null })
                              fetchOrder()
                            }}>
                            <option value="">Назначи работник</option>
                            {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                          </select>
                        ) : stage.worker_name ? (
                          <span className="text-xs text-muted inline-flex items-center gap-1"><HardHat className="w-3.5 h-3.5" /> {stage.worker_name}</span>
                        ) : null}
                        {stage.started_at && (
                          <span className="text-xs text-muted">
                            Начало: {format(parseISO(stage.started_at), 'HH:mm d MMM', { locale: bg })}
                          </span>
                        )}
                        {stage.completed_at && (
                          <span className="text-xs text-muted">
                            · Край: {format(parseISO(stage.completed_at), 'HH:mm d MMM', { locale: bg })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StageStatusBadge status={stage.status} />
                    {isProduction && order.status === 'ПРОИЗВОДСТВО' && (
                      <>
                        {stage.status === 'ЧАКАЩ' && (
                          <button className="btn-secondary py-2 px-4" onClick={() => updateStage(stage.id, 'В_ПРОЦЕС')}>
                            Започни
                          </button>
                        )}
                        {stage.status === 'В_ПРОЦЕС' && (
                          <button className="btn-primary py-2 px-4" onClick={() => updateStage(stage.id, 'ГОТОВ')}>
                            <Check className="w-4 h-4" /> Завърши
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quality control tab */}
          {activeTab === 'quality' && (
            <div className="space-y-3">
              {qualityChecks.every(c => c.id === null) && (
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted">Стандартен контролен лист</p>
                  <button className="btn-secondary text-xs py-1"
                    onClick={async () => {
                      try {
                        const { data } = await api.post(`/quality/${id}/init`, {})
                        setQualityChecks(data)
                        toast.success('Контролният лист е инициализиран')
                      } catch { toast.error('Грешка') }
                    }}>
                    <ListChecks className="w-4 h-4" /> Създай контролен лист
                  </button>
                </div>
              )}
              {qualityTotal > 0 && (
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex-1 bg-border rounded-full h-2">
                    <div className="h-2 rounded-full bg-green-500 transition-all"
                      style={{ width: `${Math.round(qualityDone/qualityTotal*100)}%` }} />
                  </div>
                  <span className="text-sm font-medium text-white">{qualityDone}/{qualityTotal}</span>
                  {qualityDone === qualityTotal && qualityTotal > 0 && (
                    <span className="text-green-400 text-xs font-medium inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Готово</span>
                  )}
                </div>
              )}
              <div className="space-y-2">
                {qualityChecks.map(qc => (
                  <div key={qc.id || qc.item} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer
                    ${qc.checked ? 'bg-green-500/5 border-green-500/30' : 'bg-bg border-border hover:border-accent/50'}`}
                    onClick={async () => {
                      if (!qc.id) { toast('Инициализирайте листа първо'); return }
                      try {
                        const { data } = await api.patch(`/quality/${qc.id}/toggle`)
                        setQualityChecks(cs => cs.map(c => c.id === qc.id ? { ...c, ...data } : c))
                      } catch { toast.error('Грешка') }
                    }}>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                      ${qc.checked ? 'bg-green-500 border-green-500' : 'border-border'}`}>
                      {qc.checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${qc.checked ? 'line-through text-muted' : 'text-white'}`}>
                        {qc.item}
                      </p>
                      {qc.checked && qc.checked_by_name && (
                        <p className="text-xs text-muted">
                          {qc.checked_by_name} · {qc.checked_at ? format(parseISO(qc.checked_at), 'HH:mm d MMM', { locale: bg }) : ''}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items tab */}
          {activeTab === 'items' && (
            <OrderItems order={order} canEdit={isOffice && order.status !== 'ОТКАЗАНА'} canSeePrices={canSeePrices}
              onChanged={fetchOrder} />
          )}

          {/* Defects tab */}
          {activeTab === 'defects' && (
            <div className="space-y-3">
              {order.defects.length === 0 ? (
                <div className="card text-center py-8 text-muted">Няма регистриран брак</div>
              ) : order.defects.map(d => (
                <div key={d.id} className="card border-red-500/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-white">{optLabel('defect_cause', d.cause_type)}</p>
                      <p className="text-sm text-muted">{d.cause_notes}</p>
                      <p className="text-xs text-muted mt-1">
                        {d.worker_name} · {d.stage_name && `${d.stage_name} · `}
                        {format(parseISO(d.created_at), 'd MMM yyyy HH:mm', { locale: bg })}
                      </p>
                    </div>
                    <div className="text-right">
                      {canSeePrices && Number(d.total_cost) > 0 && <p className="text-danger font-medium">{Number(d.total_cost).toFixed(2)} €</p>}
                      {d.decision ? (
                        <span className={`badge ${d.decision==='преработка' ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {d.decision}
                        </span>
                      ) : (
                        <span className="badge bg-red-500/20 text-red-400">Нерешен</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(isProduction || isOffice) && (
                <Link to={`/defects?new=1&order_id=${order.id}`} className="btn-secondary w-full justify-center">
                  + Регистрирай брак
                </Link>
              )}
            </div>
          )}

          {/* Labor tab */}
          {activeTab === 'labor' && (
            <div className="table-container">
              <table>
                <thead><tr><th>Работник</th><th>Етап</th><th>Минути</th><th>Бележка</th><th>Дата</th></tr></thead>
                <tbody>
                  {order.labor.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-8 text-muted">Няма записан труд</td></tr>
                  )}
                  {order.labor.map(l => (
                    <tr key={l.id}>
                      <td>{l.worker_name}</td>
                      <td className="text-muted">{l.stage_name || '—'}</td>
                      <td>{l.minutes} мин</td>
                      <td className="text-muted text-xs">{l.notes || '—'}</td>
                      <td className="text-muted text-xs">{dateBg(l.logged_at, 'd MMM HH:mm')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Comments tab */}
          {activeTab === 'comments' && (
            <div className="space-y-3">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {comments.filter(c => !c.message?.startsWith('Статус:')).length === 0 && (
                  <div className="card text-center py-8 text-muted">Няма коментари. Напишете първия.</div>
                )}
                {comments.filter(c => !c.message?.startsWith('Статус:')).map(c => (
                  <div key={c.id} className={`flex gap-3 ${c.user_id === user?.id ? 'flex-row-reverse' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold flex-shrink-0">
                      {c.user_name?.[0]}
                    </div>
                    <div className={`flex-1 max-w-xs ${c.user_id === user?.id ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`rounded-2xl px-4 py-2.5 text-sm ${c.user_id === user?.id ? 'bg-accent text-white rounded-tr-sm' : 'bg-surface border border-border text-gray-300 rounded-tl-sm'}`}>
                        {c.message}
                      </div>
                      <p className="text-xs text-muted mt-1 px-1">{c.user_name} · {format(parseISO(c.created_at), 'HH:mm d MMM', { locale: bg })}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="Напишете коментар..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendComment()}
                />
                <button className="btn-primary px-4" onClick={sendComment} disabled={sendingComment || !newComment.trim()}>
                  {sendingComment ? '...' : 'Изпрати'}
                </button>
              </div>
            </div>
          )}

          {/* Files tab */}
          {activeTab === 'files' && (
            <div className="space-y-2">
              <label className={`flex items-center justify-center gap-2 border border-dashed border-border rounded-xl py-3 text-sm cursor-pointer hover:border-accent/50 hover:text-white transition-colors text-muted ${uploadingFile ? 'opacity-50 pointer-events-none' : ''}`}>
                <Upload className="w-4 h-4" />
                {uploadingFile ? 'Качва се...' : '+ Прикачи файл (PDF, снимка, чертеж до 20MB)'}
                <input type="file" className="hidden" onChange={uploadFile} accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf,.xlsx,.docx" />
              </label>
              {order.files.length === 0 && (
                <div className="card text-center py-6 text-muted text-sm">Няма прикачени файлове</div>
              )}
              {order.files.map(f => (
                <div key={f.id} className="card flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 text-accent text-xs font-bold">
                      {f.original_name.split('.').pop().toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm truncate">{f.original_name}</p>
                      <p className="text-xs text-muted">{f.uploaded_by_name} · {dateBg(f.created_at)} · {(f.file_size/1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                  <button className="btn-secondary text-xs py-1 flex-shrink-0" onClick={() => downloadFile(f.id, f.original_name)}>⬇ Изтегли</button>
                </div>
              ))}
            </div>
          )}

          {/* History / Timeline tab */}
          {activeTab === 'history' && <Timeline order={orderWithHistory} />}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {canSeePrices && <PaymentCard order={order} onChanged={fetchOrder} />}

          {isOffice && order.fulfillment === 'монтаж' && (
            <div className="card text-sm">
              <p className="text-muted text-xs uppercase tracking-wide mb-2">Монтаж</p>
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-bg border border-border">
                {Object.entries(INSTALL_LABELS).map(([k, v]) => (
                  <button key={k} onClick={async () => {
                      try { await api.patch(`/orders/${id}`, { installation_status: k }); toast.success('Обновено'); fetchOrder() }
                      catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
                    }}
                    className={`text-xs py-1.5 rounded-lg ${order.installation_status === k ? 'bg-accent text-white' : 'text-muted hover:text-white'}`}>
                    {v}
                  </button>
                ))}
              </div>
              {order.delivery_address && <p className="text-xs text-muted mt-2 flex items-start gap-1"><MapPin className="w-3.5 h-3.5 mt-px flex-shrink-0" /> {order.delivery_address}</p>}
            </div>
          )}

          {canSeePrices && <CostCard costs={order.costs} salePrice={order.sale_price} vatPct={settings.vat_pct} />}

          <div className="card text-sm space-y-2">
            <p className="text-muted text-xs uppercase tracking-wide">Информация</p>
            <div className="flex justify-between">
              <span className="text-muted">Статус</span>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Категория</span>
              <span className="text-gray-300 text-right">{CATEGORY_LABELS[order.order_category] || order.order_category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Откъде</span>
              <span className="text-gray-300">{optLabel('source', order.source, SOURCE_LABELS)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Брак записи</span>
              <span className={order.defects?.length > 0 ? 'text-danger font-medium' : 'text-muted'}>
                {order.defects?.length || 0}
              </span>
            </div>
          </div>

          {/* Deliveries */}
          {(isAdmin || user?.role === 'office') && order.status === 'ГОТОВА' && deliveries.length === 0 && (
            <div className="card border-green-500/20">
              <p className="text-muted text-xs uppercase tracking-wide mb-2">Готова за доставка</p>
              <button className="btn-primary w-full text-sm py-2"
                onClick={async () => {
                  try {
                    await api.post('/deliveries', {
                      order_id: order.id,
                      address: order.delivery_address || '',
                    })
                    toast.success('Доставката е планирана')
                    fetchDeliveries()
                  } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
                }}>
                <Truck className="w-4 h-4" /> Планирай доставка
              </button>
            </div>
          )}
          {deliveries.length > 0 && (
            <div className="card text-sm">
              <p className="text-muted text-xs uppercase tracking-wide mb-2">Доставки</p>
              <div className="space-y-2">
                {deliveries.map(d => (
                  <div key={d.id} className="flex items-center justify-between">
                    <div>
                      <span className={`badge text-xs ${
                        d.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
                        d.status === 'IN_TRANSIT' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-blue-500/20 text-blue-400'}`}>
                        {d.status === 'DELIVERED' ? 'Доставена' : d.status === 'IN_TRANSIT' ? 'В движение' : 'Планирана'}
                      </span>
                      {d.scheduled_date && (
                        <p className="text-xs text-muted mt-0.5">{dateBg(d.scheduled_date)}</p>
                      )}
                    </div>
                    {d.driver_name && <span className="text-xs text-muted">{d.driver_name}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Client tracking link */}
          {order.tracking_token && (isAdmin || user?.role === 'office') && (
            <div className="card text-sm">
              <p className="text-muted text-xs uppercase tracking-wide mb-2">Линк за клиента</p>
              <p className="text-xs text-gray-400 mb-2">Изпратете на клиента да проследи поръчката</p>
              <div className="flex gap-2">
                <input readOnly className="input text-xs flex-1 text-muted"
                  value={`${window.location.origin}/track/${order.tracking_token}`} />
                <button className="btn-secondary text-xs py-1 px-2 flex-shrink-0"
                  onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/track/${order.tracking_token}`); toast.success('Копирано!') }}>
                  Копирай
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <HandoverDialog order={order} open={handoverOpen} onClose={() => setHandoverOpen(false)}
        onDone={() => { fetchOrder(); fetchComments() }} />
      <EditOrderModal open={editOpen} onClose={() => setEditOpen(false)} order={order} onSaved={fetchOrder} />
      <ConfirmDialog open={!!confirmStatus} onClose={() => setConfirmStatus(null)} danger={confirmStatus === 'ОТКАЗАНА'}
        title={confirmStatus === 'ОТКАЗАНА' ? 'Отказване на поръчка' : 'Смяна на статус'}
        message={confirmStatus === 'ОТКАЗАНА'
          ? `Сигурни ли сте, че искате да откажете поръчка ${orderNo(order)}? Само администратор може да я върне.`
          : `Поръчката ще бъде преместена в „${confirmStatus}“.`}
        onConfirm={() => advanceStatus(confirmStatus)} />
      <LogLaborModal open={laborOpen} onClose={() => setLaborOpen(false)}
        orderId={id} stages={order.stages} workers={workers} currentUser={user} onLogged={fetchOrder} />
    </div>
  )
}
