import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { StageStatusBadge, UrgentBadge } from '../components/ui/StatusBadge'
import { PageLoader } from '../components/ui/Spinner'
import toast from 'react-hot-toast'
import { format, parseISO, isPast } from 'date-fns'
import { bg } from 'date-fns/locale'

const STAGE_COLUMNS = ['Рязане','Миене','Сглобяване','Заливане','Шлайфане','Кантиране']

function BoardCard({ order, onUpdate }) {
  const navigate = useNavigate()
  const isOverdue = order.deadline && isPast(parseISO(order.deadline))
  const doneCount = order.stages?.filter(s => s.status === 'ГОТОВ').length || 0
  const totalCount = order.stages?.length || 0

  const handleStageUpdate = async (e, stageId, status) => {
    e.stopPropagation()
    try {
      await api.patch(`/production/stages/${stageId}`, { status })
      toast.success('Етапът е обновен')
      onUpdate()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    }
  }

  return (
    <div
      onClick={() => navigate(`/orders/${order.id}`)}
      className={`card mb-3 cursor-pointer hover:border-accent/50 hover:shadow-lg transition-all group
        ${isOverdue ? 'border-red-500/30' : ''}`}>

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-accent group-hover:underline">#{order.order_number}</span>
            {order.is_urgent && <span className="text-danger text-xs">⚡ Спешна</span>}
          </div>
          <p className="text-sm text-white mt-0.5">{order.client_name}</p>
          <p className="text-xs text-muted">{order.order_type}</p>
        </div>
        <div className="text-right flex-shrink-0">
          {order.deadline && (
            <span className={`text-xs px-1.5 py-0.5 rounded ${isOverdue ? 'bg-red-500/20 text-danger' : 'text-muted'}`}>
              {isOverdue ? '⚠ ' : ''}{format(parseISO(order.deadline), 'd MMM', { locale: bg })}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>Напредък</span>
            <span>{doneCount}/{totalCount} етапа</span>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${doneCount === totalCount ? 'bg-green-500' : 'bg-accent'}`}
              style={{ width: `${totalCount > 0 ? Math.round(doneCount/totalCount*100) : 0}%` }} />
          </div>
        </div>
      )}

      {/* Stage list */}
      <div className="space-y-1">
        {order.stages?.map(stage => (
          <div key={stage.id} onClick={e => e.stopPropagation()}
            className={`flex items-center justify-between text-xs px-2 py-1.5 rounded-lg
              ${stage.status==='ГОТОВ' ? 'bg-green-500/10' :
                stage.status==='В_ПРОЦЕС' ? 'bg-orange-500/10 ring-1 ring-orange-500/20' : 'bg-border/40'}`}>
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                ${stage.status==='ГОТОВ' ? 'bg-green-400' :
                  stage.status==='В_ПРОЦЕС' ? 'bg-orange-400' : 'bg-gray-600'}`} />
              <span className={`truncate ${stage.status==='ГОТОВ' ? 'text-green-400' :
                stage.status==='В_ПРОЦЕС' ? 'text-orange-300 font-medium' : 'text-muted'}`}>
                {stage.stage_name}
              </span>
              {stage.worker_name && (
                <span className="text-muted flex-shrink-0">· {stage.worker_name.split(' ')[0]}</span>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {stage.status === 'ЧАКАЩ' && (
                <button className="px-2 py-0.5 rounded bg-border text-muted hover:bg-accent/20 hover:text-accent text-xs transition-colors"
                  onClick={e => handleStageUpdate(e, stage.id, 'В_ПРОЦЕС')}>Започни</button>
              )}
              {stage.status === 'В_ПРОЦЕС' && (
                <button className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs transition-colors"
                  onClick={e => handleStageUpdate(e, stage.id, 'ГОТОВ')}>✓ Готово</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer link cue */}
      <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between">
        <span className="text-xs text-muted">Кликни за пълен детайл</span>
        <span className="text-xs text-accent group-hover:translate-x-0.5 transition-transform">Отвори →</span>
      </div>
    </div>
  )
}

export default function Production() {
  const navigate = useNavigate()
  const [board, setBoard] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('board') // 'board' | 'list'

  const fetchBoard = async () => {
    try {
      const { data } = await api.get('/production/board')
      setBoard(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchBoard() }, [])

  if (loading) return <PageLoader />

  // Group by status for Kanban columns
  const byStatus = {
    'МАТЕРИАЛИ':    board.filter(o => o.status === 'МАТЕРИАЛИ'),
    'ПРОИЗВОДСТВО': board.filter(o => o.status === 'ПРОИЗВОДСТВО'),
    'ГОТОВА':       board.filter(o => o.status === 'ГОТОВА'),
  }

  const statusLabels = { 'МАТЕРИАЛИ':'Материали', 'ПРОИЗВОДСТВО':'Производство', 'ГОТОВА':'Готови' }
  const statusColors = { 'МАТЕРИАЛИ':'border-yellow-500/40', 'ПРОИЗВОДСТВО':'border-orange-500/40', 'ГОТОВА':'border-green-500/40' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Производствен борд</h1>
          <p className="text-sm text-muted mt-0.5">{board.length} активни поръчки</p>
        </div>
        <div className="flex gap-2">
          <button className={`btn ${view==='board' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('board')}>
            Табло
          </button>
          <button className={`btn ${view==='list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('list')}>
            Списък
          </button>
          <button className="btn-secondary" onClick={fetchBoard}>↻ Обнови</button>
        </div>
      </div>

      {view === 'board' ? (
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
                <BoardCard key={order.id} order={order} onUpdate={fetchBoard} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr><th>#</th><th>Клиент</th><th>Статус</th><th>Текущ етап</th><th>Срок</th><th>Действия</th></tr>
            </thead>
            <tbody>
              {board.map(order => {
                const active = order.stages?.find(s => s.status === 'В_ПРОЦЕС') || order.stages?.find(s => s.status === 'ЧАКАЩ')
                const isOverdue = order.deadline && isPast(parseISO(order.deadline))
                return (
                  <tr key={order.id} className="cursor-pointer hover:bg-surface/60 transition-colors"
                    onClick={() => navigate(`/orders/${order.id}`)}>
                    <td>
                      <span className="text-accent font-bold hover:underline">
                        #{order.order_number}
                      </span>
                      {order.is_urgent && <span className="ml-1 text-danger text-xs">⚡</span>}
                    </td>
                    <td>{order.client_name}</td>
                    <td>
                      <span className="badge">{order.status}</span>
                    </td>
                    <td>
                      {active ? (
                        <div>
                          <span className="text-white font-medium">{active.stage_name}</span>
                          <StageStatusBadge status={active.status} />
                        </div>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td className={isOverdue ? 'text-danger font-medium' : 'text-muted'}>
                      {order.deadline ? format(parseISO(order.deadline), 'd MMM', { locale: bg }) : '—'}
                    </td>
                    <td>
                      <Link to={`/orders/${order.id}`} className="btn-ghost text-xs py-1">Отвори →</Link>
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
