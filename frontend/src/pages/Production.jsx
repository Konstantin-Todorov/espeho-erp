import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { StageStatusBadge, OrderStatusBadge } from '../components/ui/StatusBadge'
import { PageLoader } from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { TYPE_LABELS, orderNo, dateBg, todayStr } from '../utils/labels'
import { Zap, AlertTriangle, Check, CheckCircle2, Play } from 'lucide-react'

const DONE = ['ГОТОВ', 'ПРОПУСНАТ']
const deadlinePassed = d => !!d && String(d).slice(0, 10) < todayStr()

// PATCH a stage and tell the worker what happened. Returns true on success.
async function updateStage(stageId, status) {
  try {
    const { data } = await api.patch(`/production/stages/${stageId}`, { status })
    if (data.order_ready) toast.success('Поръчката е готова!', { duration: 5000 })
    else toast.success(status === 'В_ПРОЦЕС' ? 'Започнато' : status === 'ГОТОВ' ? 'Завършено' : 'Етапът е обновен')
    return true
  } catch (err) {
    toast.error(err.response?.data?.error || 'Грешка')
    return false
  }
}

// ── Моите задачи — mobile-first list for the shop floor ─────────────────────
function TaskCard({ task, busy, onAction }) {
  const navigate = useNavigate()
  const overdue = deadlinePassed(task.deadline)
  const inProgress = task.status === 'В_ПРОЦЕС'
  return (
    <div className={`card p-4 ${inProgress ? 'border-orange-500/40 bg-orange-500/5' : ''} ${task.is_urgent ? 'ring-1 ring-red-500/40' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <button type="button" className="min-w-0 text-left" onClick={() => navigate(`/orders/${task.order_id}`)}>
          <p className="text-lg font-bold text-white leading-tight">{task.stage_name}</p>
          <p className="text-base text-accent font-semibold mt-0.5">
            {orderNo(task)}
            {task.is_urgent && <span className="ml-2 text-danger text-sm font-bold inline-flex items-center gap-1 align-middle"><Zap className="w-4 h-4" strokeWidth={2.25} />СПЕШНА</span>}
          </p>
          <p className="text-base text-gray-200 truncate">{task.client_name}</p>
          <p className="text-sm text-muted">{TYPE_LABELS[task.order_type] || task.order_type || ''}</p>
        </button>
        <div className="text-right flex-shrink-0">
          {task.deadline ? (
            <span className={`inline-block text-sm px-2 py-1 rounded-lg ${overdue ? 'bg-red-500/20 text-danger font-semibold' : 'bg-border/60 text-muted'}`}>
              {overdue && <AlertTriangle className="w-4 h-4 inline-block align-[-3px] mr-1" strokeWidth={2} />}Срок {dateBg(task.deadline, 'd MMM')}
            </span>
          ) : <span className="text-sm text-muted">Без срок</span>}
          {inProgress && <div className="mt-2"><StageStatusBadge status={task.status} /></div>}
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        {task.status === 'ЧАКАЩ' && (
          <div className="flex-1">
            <button type="button" disabled={!task.can_start || busy}
              className="btn-secondary w-full justify-center min-h-[48px] text-base disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onAction(task, 'В_ПРОЦЕС')}>
              <Play className="w-5 h-5" strokeWidth={2.25} />Започни
            </button>
            {!task.can_start && <p className="text-sm text-warning mt-1 text-center">Чака предишния етап</p>}
          </div>
        )}
        {inProgress && (
          <button type="button" disabled={busy}
            className="btn-primary flex-1 justify-center min-h-[48px] text-base bg-green-600 hover:bg-green-500 disabled:opacity-50"
            onClick={() => onAction(task, 'ГОТОВ')}>
            <Check className="w-5 h-5" strokeWidth={2.5} />Готово
          </button>
        )}
        <button type="button" className="btn-ghost min-h-[48px] px-4 text-base" title="Отвори поръчката"
          onClick={() => navigate(`/orders/${task.order_id}`)}>
          →
        </button>
      </div>
    </div>
  )
}

function MyWork() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get('/production/my-work')
      setTasks(data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Задачите не могат да бъдат заредени')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 60_000)
    return () => clearInterval(interval)
  }, [fetchTasks])

  const onAction = async (task, status) => {
    setBusyId(task.id)
    await updateStage(task.id, status)
    await fetchTasks()
    setBusyId(null)
  }

  if (loading) return <PageLoader />

  const groups = [
    { key: 'progress', title: 'В процес', items: tasks.filter(t => t.status === 'В_ПРОЦЕС') },
    { key: 'mine', title: 'Мои', items: tasks.filter(t => t.status === 'ЧАКАЩ' && t.mine) },
    { key: 'free', title: 'Свободни', hint: 'Неразпределени — който започне, поема етапа', items: tasks.filter(t => t.status === 'ЧАКАЩ' && !t.assigned_to) },
  ]

  if (!tasks.length) {
    return (
      <div className="card text-center py-12">
        <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-400" strokeWidth={1.75} />
        <p className="text-base text-white font-medium">Няма задачи в момента</p>
        <p className="text-sm text-muted mt-1">Тук се появяват етапите на поръчки в „ПРОИЗВОДСТВО“, разпределени на вас или свободни.</p>
        <button className="btn-secondary mt-4 min-h-[44px] text-base" onClick={fetchTasks}>↻ Обнови</button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {groups.filter(g => g.items.length).map(g => (
        <section key={g.key}>
          <div className="flex items-baseline justify-between mb-2 px-1">
            <h2 className="text-base font-semibold text-white">
              {g.title} <span className="text-muted font-normal">({g.items.length})</span>
            </h2>
            {g.hint && <span className="text-xs text-muted">{g.hint}</span>}
          </div>
          <div className="space-y-3">
            {g.items.map(t => <TaskCard key={t.id} task={t} busy={busyId === t.id} onAction={onAction} />)}
          </div>
        </section>
      ))}
    </div>
  )
}

// ── Board ────────────────────────────────────────────────────────────────────
function BoardCard({ order, canAct, isAdmin, onUpdate }) {
  const navigate = useNavigate()
  const overdue = deadlinePassed(order.deadline) && order.status !== 'ГОТОВА'
  const doneCount = order.stages?.filter(s => s.status === 'ГОТОВ').length || 0
  const totalCount = order.stages?.length || 0
  const inProduction = order.status === 'ПРОИЗВОДСТВО'
  const showActions = canAct && inProduction

  const handleStageUpdate = async (e, stageId, status) => {
    e.stopPropagation()
    if (await updateStage(stageId, status)) onUpdate()
  }

  // A waiting stage can start once every earlier stage is done (admin may skip ahead)
  const canStart = stage => isAdmin || (order.stages || [])
    .filter(s => s.stage_order < stage.stage_order)
    .every(s => DONE.includes(s.status))

  return (
    <div
      onClick={() => navigate(`/orders/${order.id}`)}
      className={`card mb-3 cursor-pointer hover:border-accent/50 hover:shadow-lg transition-all group
        ${overdue ? 'border-red-500/30' : ''}`}>

      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-accent group-hover:underline">{orderNo(order)}</span>
            {order.is_urgent && <span className="text-danger text-xs inline-flex items-center gap-0.5"><Zap className="w-3 h-3" strokeWidth={2.25} />Спешна</span>}
          </div>
          <p className="text-sm text-white mt-0.5">{order.client_name}</p>
          <p className="text-xs text-muted">{TYPE_LABELS[order.order_type] || order.order_type}</p>
        </div>
        <div className="text-right flex-shrink-0">
          {order.deadline && (
            <span className={`text-xs px-1.5 py-0.5 rounded ${overdue ? 'bg-red-500/20 text-danger' : 'text-muted'}`}>
              {overdue && <AlertTriangle className="w-3 h-3 inline-block align-[-2px] mr-1" strokeWidth={2} />}{dateBg(order.deadline, 'd MMM')}
            </span>
          )}
        </div>
      </div>

      {order.status === 'МАТЕРИАЛИ' && (
        <p className="text-xs text-warning bg-yellow-500/10 rounded-lg px-2 py-1 mb-2">⏳ Чака материали — етапите още не се работят</p>
      )}

      {totalCount > 0 && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>Напредък</span>
            <span>{doneCount}/{totalCount} етапа</span>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${doneCount === totalCount ? 'bg-green-500' : 'bg-accent'}`}
              style={{ width: `${Math.round(doneCount / totalCount * 100)}%` }} />
          </div>
        </div>
      )}

      <div className="space-y-1">
        {order.stages?.map(stage => {
          const startable = canStart(stage)
          return (
            <div key={stage.id} onClick={e => e.stopPropagation()}
              className={`flex items-center justify-between text-xs px-2 py-1.5 rounded-lg
                ${stage.status === 'ГОТОВ' ? 'bg-green-500/10' :
                  stage.status === 'В_ПРОЦЕС' ? 'bg-orange-500/10 ring-1 ring-orange-500/20' : 'bg-border/40'}`}>
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                  ${stage.status === 'ГОТОВ' ? 'bg-green-400' :
                    stage.status === 'В_ПРОЦЕС' ? 'bg-orange-400' : 'bg-gray-600'}`} />
                <span className={`truncate ${stage.status === 'ГОТОВ' ? 'text-green-400' :
                  stage.status === 'В_ПРОЦЕС' ? 'text-orange-300 font-medium' : 'text-muted'}`}>
                  {stage.stage_name}
                </span>
                {stage.worker_name && (
                  <span className="text-muted flex-shrink-0">· {stage.worker_name.split(' ')[0]}</span>
                )}
              </div>
              {showActions && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {stage.status === 'ЧАКАЩ' && (
                    <button disabled={!startable} title={startable ? '' : 'Чака предишния етап'}
                      className="px-3 py-1 rounded-lg bg-border text-muted hover:bg-accent/20 hover:text-accent text-xs transition-colors min-h-[32px] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-border disabled:hover:text-muted"
                      onClick={e => handleStageUpdate(e, stage.id, 'В_ПРОЦЕС')}>Започни</button>
                  )}
                  {stage.status === 'В_ПРОЦЕС' && (
                    <button className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 font-medium text-xs transition-colors min-h-[32px]"
                      onClick={e => handleStageUpdate(e, stage.id, 'ГОТОВ')}><Check className="w-3.5 h-3.5 inline-block align-[-2px] mr-1" strokeWidth={2.5} />Готово</button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between">
        <span className="text-xs text-muted">Кликни за пълен детайл</span>
        <span className="text-xs text-accent group-hover:translate-x-0.5 transition-transform">Отвори →</span>
      </div>
    </div>
  )
}

export default function Production() {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const canAct = ['admin', 'office', 'production'].includes(user?.role)
  const [board, setBoard] = useState([])
  const [loading, setLoading] = useState(true)
  // Shop-floor workers land on their own task list
  const [view, setView] = useState(user?.role === 'production' ? 'mine' : 'board') // 'mine' | 'board' | 'list'
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const fetchBoard = useCallback(async () => {
    try {
      const { data } = await api.get('/production/board')
      setBoard(data)
      setLastRefresh(new Date())
    } catch (err) {
      toast.error(err.response?.data?.error || 'Бордът не може да бъде зареден')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchBoard()
    // Auto-refresh every 2 minutes for the production floor
    const interval = setInterval(fetchBoard, 120_000)
    return () => clearInterval(interval)
  }, [fetchBoard])

  const byStatus = {
    'МАТЕРИАЛИ': board.filter(o => o.status === 'МАТЕРИАЛИ'),
    'ПРОИЗВОДСТВО': board.filter(o => o.status === 'ПРОИЗВОДСТВО'),
    'ГОТОВА': board.filter(o => o.status === 'ГОТОВА'),
  }
  const statusLabels = { 'МАТЕРИАЛИ': 'Чакат материали', 'ПРОИЗВОДСТВО': 'Производство', 'ГОТОВА': 'Готови' }
  const statusColors = { 'МАТЕРИАЛИ': 'border-yellow-500/40', 'ПРОИЗВОДСТВО': 'border-orange-500/40', 'ГОТОВА': 'border-green-500/40' }

  const tabs = [
    canAct && { key: 'mine', label: 'Моите задачи' },
    { key: 'board', label: 'Табло' },
    { key: 'list', label: 'Списък' },
  ].filter(Boolean)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Производство</h1>
          <p className="text-sm text-muted mt-0.5">{board.length} активни поръчки</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map(t => (
            <button key={t.key} className={`${view === t.key ? 'btn-primary' : 'btn-secondary'} min-h-[44px]`} onClick={() => setView(t.key)}>
              {t.label}
            </button>
          ))}
          {view !== 'mine' && (
            <button className="btn-secondary min-h-[44px]" onClick={fetchBoard} title={`Последно обновяване: ${format(lastRefresh, 'HH:mm')}`}>
              ↻ <span className="hidden sm:inline">Обнови</span>
            </button>
          )}
        </div>
      </div>

      {view === 'mine' ? <MyWork /> : loading ? <PageLoader /> : view === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {Object.entries(byStatus).map(([status, orders]) => (
            <div key={status}>
              <div className={`flex items-center justify-between mb-3 px-1 py-2 rounded-xl border-b-2 ${statusColors[status]}`}>
                <h2 className="font-semibold text-white">{statusLabels[status]}</h2>
                <span className="badge bg-border text-muted">{orders.length}</span>
              </div>
              {orders.length === 0 ? (
                <div className="card text-center py-8 text-muted text-sm">Няма поръчки</div>
              ) : orders.map(order => (
                <BoardCard key={order.id} order={order} canAct={canAct} isAdmin={isAdmin} onUpdate={fetchBoard} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr><th>№</th><th>Клиент</th><th>Статус</th><th>Текущ етап</th><th>Срок</th><th></th></tr>
            </thead>
            <tbody>
              {board.map(order => {
                const active = order.stages?.find(s => s.status === 'В_ПРОЦЕС') || order.stages?.find(s => s.status === 'ЧАКАЩ')
                const overdue = deadlinePassed(order.deadline) && order.status !== 'ГОТОВА'
                return (
                  <tr key={order.id} className="cursor-pointer hover:bg-surface/60 transition-colors"
                    onClick={() => navigate(`/orders/${order.id}`)}>
                    <td>
                      <span className="text-accent font-bold hover:underline">{orderNo(order)}</span>
                      {order.is_urgent && <Zap className="ml-1 w-3.5 h-3.5 text-danger inline-block align-[-2px]" strokeWidth={2.25} aria-label="Спешна" />}
                    </td>
                    <td>{order.client_name}</td>
                    <td><OrderStatusBadge status={order.status} /></td>
                    <td>
                      {order.status === 'МАТЕРИАЛИ' ? <span className="text-xs text-warning">чака материали</span>
                        : active ? (
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{active.stage_name}</span>
                            <StageStatusBadge status={active.status} />
                          </div>
                        ) : <span className="text-muted">—</span>}
                    </td>
                    <td className={overdue ? 'text-danger font-medium' : 'text-muted'}>
                      {order.deadline ? dateBg(order.deadline, 'd MMM') : '—'}
                    </td>
                    <td>
                      <Link to={`/orders/${order.id}`} className="btn-ghost text-xs py-1" onClick={e => e.stopPropagation()}>Отвори →</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
