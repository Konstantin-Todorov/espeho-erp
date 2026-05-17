import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { bg } from 'date-fns/locale'
import axios from 'axios'

const STATUS_LABELS = {
  'НОВА':'Нова','МАТЕРИАЛИ':'Подготовка на материали','ПРОИЗВОДСТВО':'В производство',
  'ГОТОВА':'Готова за доставка','ДОСТАВЕНА':'Доставена','ОТКАЗАНА':'Отказана',
}
const STATUS_COLORS = {
  'НОВА':'text-blue-400','МАТЕРИАЛИ':'text-yellow-400','ПРОИЗВОДСТВО':'text-orange-400',
  'ГОТОВА':'text-green-400','ДОСТАВЕНА':'text-gray-400','ОТКАЗАНА':'text-red-400',
}
const STAGE_STATUS_BG = {
  'ГОТОВ':'bg-green-500/20 text-green-400 border-green-500/30',
  'В_ПРОЦЕС':'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'ЧАКАЩ':'bg-border text-muted border-border',
}

export default function TrackOrder() {
  const { token } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(`/api/public/track/${token}`)
      .then(r => setOrder(r.data))
      .catch(() => setError('Поръчката не е намерена или линкът е невалиден.'))
  }, [token])

  if (error) return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="text-center">
        <img src="/favicon.png" alt="Еспехо" className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-white text-lg font-semibold mb-2">Поръчката не е намерена</p>
        <p className="text-muted text-sm">{error}</p>
      </div>
    </div>
  )

  if (!order) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const doneStages = order.stages?.filter(s => s.status === 'ГОТОВ').length || 0
  const totalStages = order.stages?.length || 0
  const progress = totalStages > 0 ? Math.round((doneStages / totalStages) * 100) : 0

  return (
    <div className="min-h-screen bg-bg py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <img src="/favicon.png" alt="Еспехо" className="w-10 h-10 rounded-xl" />
          <div>
            <p className="font-bold text-white">ЕСПЕХО ООД</p>
            <p className="text-xs text-muted">Проследяване на поръчка</p>
          </div>
        </div>

        {/* Order card */}
        <div className="card mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Поръчка #{order.order_number}</h1>
              <p className="text-muted text-sm mt-0.5">{order.client_name} · {order.order_type}</p>
            </div>
            <span className={`font-semibold text-sm ${STATUS_COLORS[order.status] || 'text-white'}`}>
              {STATUS_LABELS[order.status] || order.status}
            </span>
          </div>

          {order.deadline && (
            <div className="flex items-center gap-2 text-sm mb-4">
              <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-muted">Краен срок:</span>
              <span className="text-white font-medium">{format(parseISO(order.deadline), 'd MMMM yyyy', { locale: bg })}</span>
            </div>
          )}

          {/* Progress */}
          {totalStages > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-muted mb-1.5">
                <span>Напредък</span>
                <span>{doneStages}/{totalStages} етапа</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Stages */}
        {order.stages?.length > 0 && (
          <div className="card">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Производствени етапи</h2>
            <div className="space-y-2">
              {order.stages.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border ${STAGE_STATUS_BG[s.status]}`}>
                    {s.status === 'ГОТОВ' ? '✓' : i + 1}
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className={`text-sm ${s.status === 'ГОТОВ' ? 'text-green-400' : s.status === 'В_ПРОЦЕС' ? 'text-white font-medium' : 'text-muted'}`}>
                      {s.stage_name}
                    </span>
                    {s.status === 'В_ПРОЦЕС' && (
                      <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">В процес</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-muted mt-6">
          Последно обновено: {format(new Date(), 'HH:mm, d MMMM yyyy', { locale: bg })}
        </p>
      </div>
    </div>
  )
}
