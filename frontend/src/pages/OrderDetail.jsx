import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { OrderStatusBadge, StageStatusBadge, UrgentBadge } from '../components/ui/StatusBadge'
import { PageLoader } from '../components/ui/Spinner'
import Modal, { ConfirmDialog } from '../components/ui/Modal'
import CreatableInput from '../components/ui/CreatableInput'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'
import { bg } from 'date-fns/locale'

const COMMON_STAGES = ['Рязане','Миене','Шлайфане','Сглобяване','Заливане','Кантиране','Темпериране','Ламиниране','Контрол качество','Опаковане']

const STATUS_FLOW = {
  'НОВА':['МАТЕРИАЛИ','ОТКАЗАНА'],
  'МАТЕРИАЛИ':['ПРОИЗВОДСТВО'],
  'ПРОИЗВОДСТВО':['ГОТОВА'],
  'ГОТОВА':['ДОСТАВЕНА'],
  'ДОСТАВЕНА':[],'ОТКАЗАНА':[],
}

// ─── Cost Card ────────────────────────────────────────────────────────────────
function CostCard({ costs, salePrice, isAdmin }) {
  if (!costs) return null
  const margin = salePrice ? salePrice - costs.total_cost : null
  const marginPct = salePrice && costs.total_cost ? ((salePrice - costs.total_cost) / salePrice * 100).toFixed(1) : null

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Себестойност</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Материали</span>
          <span className="text-white font-medium">{Number(costs.material_cost).toFixed(2)} €</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Труд</span>
          <span className="text-white font-medium">{Number(costs.labor_cost).toFixed(2)} €</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Машини</span>
          <span className="text-white font-medium">{Number(costs.machine_cost).toFixed(2)} €</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Режийни ({costs.overhead_pct}%)</span>
          <span className="text-white font-medium">{Number(costs.overhead_cost).toFixed(2)} €</span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between font-bold">
          <span className="text-gray-200">Себестойност</span>
          <span className="text-white">{Number(costs.total_cost).toFixed(2)} €</span>
        </div>
        {isAdmin && salePrice && (
          <>
            <div className="flex justify-between">
              <span className="text-muted">Продажна цена</span>
              <span className="text-white font-medium">{Number(salePrice).toFixed(2)} €</span>
            </div>
            <div className={`flex justify-between font-bold border-t border-border pt-2 ${margin > 0 ? 'text-green-400' : 'text-danger'}`}>
              <span>Марж</span>
              <span>{margin?.toFixed(2)} € ({marginPct}%)</span>
            </div>
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
            <span>👷</span>
            <span>Записва се за: <strong>{currentUser?.name}</strong></span>
          </div>
        )}
        <div>
          <label className="label">Производствен етап</label>
          <select className="select" value={form.stage_id} onChange={e=>setForm(f=>({...f,stage_id:e.target.value}))}>
            <option value="">— Общо за поръчката (без конкретен етап)</option>
            {stages.map(s => (
              <option key={s.id} value={s.id}>
                {s.status === 'ГОТОВ' ? '✓ ' : s.status === 'В_ПРОЦЕС' ? '⚡ ' : ''}{s.stage_name}
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
            {loading ? 'Записва...' : '✓ Запиши работата'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
const TIMELINE_ICONS = {
  created:   { icon: '📋', color: 'bg-accent/20 text-accent border-accent/30' },
  stage:     { icon: '⚙', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  stage_done:{ icon: '✓', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  labor:     { icon: '👷', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  defect:    { icon: '⚠', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  file:      { icon: '📎', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  status:    { icon: '🔄', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
}

function buildTimeline(order) {
  const events = []

  // Created
  events.push({
    type: 'created',
    at: order.created_at,
    label: `Поръчката е създадена от ${order.created_by_name}`,
    sub: `Статус: НОВА · ${order.order_type}`,
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
      label: `Брак: ${d.cause_type.replace('_', ' ')}`,
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
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm flex-shrink-0 ${color}`}>
                {icon}
              </div>
              {!isLast && <div className="w-px flex-1 bg-border my-1" />}
            </div>
            {/* Content */}
            <div className={`pb-4 ${isLast ? '' : ''}`}>
              <p className="text-white text-sm font-medium">{ev.label}</p>
              {ev.sub && <p className="text-muted text-xs">{ev.sub}</p>}
              <p className="text-muted text-xs mt-0.5">
                {format(parseISO(ev.at), 'd MMM yyyy · HH:mm', { locale: bg })}
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
        suggestions={COMMON_STAGES}
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

const STATUS_BUTTON_LABELS = {
  'МАТЕРИАЛИ':   { label: 'Изпрати за материали', icon: '📦' },
  'ПРОИЗВОДСТВО':{ label: 'Пусни в производство', icon: '⚙️' },
  'ГОТОВА':      { label: 'Маркирай като готова',  icon: '✅' },
  'ДОСТАВЕНА':   { label: 'Потвърди доставка',     icon: '🚚' },
  'ОТКАЗАНА':    { label: 'Откажи поръчката',       icon: '✗'  },
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin, isProduction } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [laborOpen, setLaborOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('stages')
  const [workers, setWorkers] = useState([])
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`)
      setOrder(data)
    } catch {
      toast.error('Поръчката не е намерена')
      navigate('/orders')
    } finally { setLoading(false) }
  }

  const fetchComments = () => api.get(`/comments/${id}`).then(r => setComments(r.data)).catch(() => {})

  useEffect(() => {
    fetchOrder()
    fetchComments()
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

  const nextStatuses = STATUS_FLOW[order.status] || []
  const isOverdue = order.deadline && new Date(order.deadline) < new Date() && !['ГОТОВА','ДОСТАВЕНА','ОТКАЗАНА'].includes(order.status)

  const TABS = [
    { id: 'stages',   label: 'Производство' },
    { id: 'items',    label: 'Артикули' },
    { id: 'comments', label: 'Коментари', badge: comments.length },
    { id: 'files',    label: 'Файлове', badge: order.files?.length || 0 },
    { id: 'defects',  label: 'Брак', badge: order.defects?.filter(d => !d.decision).length },
    { id: 'labor',    label: 'Труд' },
    { id: 'history',  label: 'История' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/orders" className="text-muted hover:text-white text-sm">← Поръчки</Link>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">Поръчка #{order.order_number}</h1>
            <OrderStatusBadge status={order.status} />
            {order.is_urgent && <UrgentBadge />}
            {isOverdue && <span className="badge bg-red-500/20 text-red-400 border border-red-500/30">⚠ Просрочена</span>}
          </div>
          <p className="text-muted text-sm mt-1">
            {order.client_name} · {order.order_type} · Създадена от {order.created_by_name}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(isProduction || isAdmin || user?.role === 'office') && order.status === 'ПРОИЗВОДСТВО' && (
            <button className="btn-primary" onClick={() => setLaborOpen(true)}>
              + Запиши работа
            </button>
          )}
          {nextStatuses.map(s => {
            const btn = STATUS_BUTTON_LABELS[s] || { label: s, icon: '→' }
            return (
              <button key={s}
                className={s === 'ОТКАЗАНА' ? 'btn-danger' : 'btn-primary'}
                onClick={() => advanceStatus(s)}
                title={`Смени статуса към: ${s}`}>
                {btn.icon} {btn.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Info */}
          <div className="card grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted text-xs uppercase tracking-wide">Клиент</p>
              <p className="text-white font-medium mt-0.5">{order.client_name}</p>
              {order.client_phone && <p className="text-muted">{order.client_phone}</p>}
            </div>
            <div>
              <p className="text-muted text-xs uppercase tracking-wide">Краен срок</p>
              <p className={`font-medium mt-0.5 ${isOverdue ? 'text-danger' : 'text-white'}`}>
                {order.deadline ? format(parseISO(order.deadline), 'd MMMM yyyy', { locale: bg }) : '—'}
              </p>
            </div>
            <div>
              <p className="text-muted text-xs uppercase tracking-wide">Тип</p>
              <p className="text-white font-medium mt-0.5 capitalize">{order.order_type}</p>
            </div>
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
                {tab.badge > 0 && (
                  <span className="ml-1 badge bg-red-500/20 text-red-400 text-xs">{tab.badge}</span>
                )}
              </button>
            ))}
          </div>

          {/* Stages tab */}
          {activeTab === 'stages' && (
            <div className="space-y-2">
              {(isAdmin || order.status === 'ПРОИЗВОДСТВО') && (
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
                      {stage.status === 'ГОТОВ' ? '✓' : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white">{stage.stage_name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {(isAdmin || user?.role === 'office') && workers.length > 0 && stage.status !== 'ГОТОВ' ? (
                          <select
                            className="text-xs bg-transparent border border-border rounded px-1.5 py-0.5 text-muted hover:border-accent/50 focus:outline-none focus:border-accent cursor-pointer"
                            value={stage.assigned_to || ''}
                            onChange={async e => {
                              await api.patch(`/production/stages/${stage.id}`, { assigned_to: e.target.value || null })
                              fetchOrder()
                            }}>
                            <option value="">— Назначи работник</option>
                            {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                          </select>
                        ) : stage.worker_name ? (
                          <span className="text-xs text-muted">👷 {stage.worker_name}</span>
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
                          <button className="btn-secondary text-xs py-1" onClick={() => updateStage(stage.id, 'В_ПРОЦЕС')}>
                            Започни
                          </button>
                        )}
                        {stage.status === 'В_ПРОЦЕС' && (
                          <button className="btn-primary text-xs py-1" onClick={() => updateStage(stage.id, 'ГОТОВ')}>
                            Завърши ✓
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Items tab */}
          {activeTab === 'items' && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Описание</th><th>Размер</th><th>Бр</th>
                    {isAdmin && <th>Ед. цена</th>}
                    {isAdmin && <th>Сума</th>}
                  </tr>
                </thead>
                <tbody>
                  {order.items.map(item => (
                    <tr key={item.id}>
                      <td>{item.product_desc}</td>
                      <td className="text-muted">{item.width && item.height ? `${item.width}×${item.height} мм` : '—'}</td>
                      <td>{item.qty}</td>
                      {isAdmin && <td>{item.unit_price ? `${item.unit_price} €` : '—'}</td>}
                      {isAdmin && <td>{item.unit_price ? `${(item.qty * item.unit_price).toFixed(2)} €` : '—'}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                      <p className="font-medium text-white">{d.cause_type.replace('_',' ')}</p>
                      <p className="text-sm text-muted">{d.cause_notes}</p>
                      <p className="text-xs text-muted mt-1">
                        {d.worker_name} · {d.stage_name && `${d.stage_name} · `}
                        {format(parseISO(d.created_at), 'd MMM yyyy HH:mm', { locale: bg })}
                      </p>
                    </div>
                    <div className="text-right">
                      {isAdmin && <p className="text-danger font-medium">{Number(d.total_cost).toFixed(2)} €</p>}
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
              {isProduction && (
                <Link to={`/defects?order_id=${order.id}`} className="btn-secondary w-full justify-center">
                  + Регистрирай брак
                </Link>
              )}
            </div>
          )}

          {/* Labor tab */}
          {activeTab === 'labor' && (
            <div className="table-container">
              <table>
                <thead><tr><th>Работник</th><th>Етап</th><th>Минути</th><th>Дата</th></tr></thead>
                <tbody>
                  {order.labor.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-8 text-muted">Няма записан труд</td></tr>
                  )}
                  {order.labor.map(l => (
                    <tr key={l.id}>
                      <td>{l.worker_name}</td>
                      <td className="text-muted">{l.stage_name || '—'}</td>
                      <td>{l.minutes} мин</td>
                      <td className="text-muted text-xs">{format(parseISO(l.logged_at), 'd MMM HH:mm', { locale: bg })}</td>
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
                {comments.length === 0 && (
                  <div className="card text-center py-8 text-muted">Няма коментари. Напишете първия.</div>
                )}
                {comments.map(c => (
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
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
                      <p className="text-xs text-muted">{f.uploaded_by_name} · {format(parseISO(f.created_at), 'd MMM yyyy', { locale: bg })} · {(f.file_size/1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                  <a href={`/api/files/download/${f.id}`} className="btn-secondary text-xs py-1 flex-shrink-0">⬇ Изтегли</a>
                </div>
              ))}
            </div>
          )}

          {/* History / Timeline tab */}
          {activeTab === 'history' && <Timeline order={order} />}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {isAdmin && <CostCard costs={order.costs} salePrice={order.sale_price} isAdmin={isAdmin} />}

          <div className="card text-sm space-y-2">
            <p className="text-muted text-xs uppercase tracking-wide">Информация</p>
            <div className="flex justify-between">
              <span className="text-muted">Статус</span>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Канал</span>
              <span className="text-gray-300">{order.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Брак записи</span>
              <span className={order.defects?.length > 0 ? 'text-danger font-medium' : 'text-muted'}>
                {order.defects?.length || 0}
              </span>
            </div>
          </div>

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

      <LogLaborModal open={laborOpen} onClose={() => setLaborOpen(false)}
        orderId={id} stages={order.stages} workers={workers} currentUser={user} onLogged={fetchOrder} />
    </div>
  )
}
