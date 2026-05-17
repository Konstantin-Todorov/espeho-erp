import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { StageStatusBadge, UrgentBadge } from '../components/ui/StatusBadge'
import { PageLoader } from '../components/ui/Spinner'
import toast from 'react-hot-toast'
import { format, parseISO, isPast } from 'date-fns'
import { bg } from 'date-fns/locale'

const STAGE_COLUMNS = ['Рязане','Миене','Сглобяване','Заливане','Шлайфане','Кантиране']

function BoardCard({ order, onUpdate }) {
  const isOverdue = order.deadline && isPast(parseISO(order.deadline))
  const activeStage = order.stages?.find(s => s.status === 'В_ПРОЦЕС') || order.stages?.find(s => s.status === 'ЧАКАЩ')

  const handleStageUpdate = async (stageId, status) => {
    try {
      await api.patch(`/production/stages/${stageId}`, { status })
      toast.success('Етапът е обновен')
      onUpdate()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    }
  }

  return (
    <div className={`card mb-3 ${isOverdue ? 'border-red-500/30' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <Link to={`/orders/${order.id}`} className="font-bold text-accent hover:underline">
            #{order.order_number}
          </Link>
          {order.is_urgent && <span className="ml-2 text-danger text-xs">●</span>}
          <p className="text-sm text-gray-300 mt-0.5">{order.client_name}</p>
          <p className="text-xs text-muted">{order.order_type}</p>
        </div>
        {order.deadline && (
          <span className={`text-xs px-2 py-0.5 rounded ${isOverdue ? 'bg-red-500/20 text-danger' : 'text-muted'}`}>
            {isOverdue ? '⚠ ' : ''}{format(parseISO(order.deadline), 'd MMM', { locale: bg })}
          </span>
        )}
      </div>

      {/* Stage progress */}
      <div className="space-y-1.5">
        {order.stages?.map(stage => (
          <div key={stage.id} className={`flex items-center justify-between text-xs px-2 py-1.5 rounded-lg
            ${stage.status==='ГОТОВ' ? 'bg-green-500/10' :
              stage.status==='В_ПРОЦЕС' ? 'bg-orange-500/10' : 'bg-border/50'}`}>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full flex-shrink-0
                ${stage.status==='ГОТОВ' ? 'bg-green-400' :
                  stage.status==='В_ПРОЦЕС' ? 'bg-orange-400' : 'bg-gray-600'}`} />
              <span className={stage.status==='ГОТОВ' ? 'text-green-400' :
                stage.status==='В_ПРОЦЕС' ? 'text-orange-400' : 'text-muted'}>
                {stage.stage_name}
              </span>
              {stage.worker_name && <span className="text-muted">· {stage.worker_name.split(' ')[0]}</span>}
            </div>
            <div className="flex items-center gap-1">
              {stage.status === 'ЧАКАЩ' && (
                <button className="px-2 py-0.5 rounded bg-border text-muted hover:text-white text-xs"
                  onClick={() => handleStageUpdate(stage.id, 'В_ПРОЦЕС')}>Започни</button>
              )}
              {stage.status === 'В_ПРОЦЕС' && (
                <button className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs"
                  onClick={() => handleStageUpdate(stage.id, 'ГОТОВ')}>✓ Готово</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Production() {
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
                  <tr key={order.id}>
                    <td>
                      <Link to={`/orders/${order.id}`} className="text-accent font-bold hover:underline">
                        #{order.order_number}
                      </Link>
                      {order.is_urgent && <span className="ml-1 text-danger text-xs">●</span>}
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
