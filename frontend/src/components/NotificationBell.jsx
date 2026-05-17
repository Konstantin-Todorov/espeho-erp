import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { bg } from 'date-fns/locale'

const TYPE_ICONS = {
  order_ready:      '✅',
  order_production: '⚙️',
  order_cancelled:  '❌',
  order_delivered:  '🚚',
  low_stock:        '📦',
  overdue:          '⚠️',
  defect:           '🔴',
}

export default function NotificationBell() {
  const [open, setOpen]          = useState(false)
  const [notifications, setNots] = useState([])
  const [unread, setUnread]      = useState(0)
  const [pos, setPos]            = useState({ top: 0, left: 0 })
  const btnRef                   = useRef(null)
  const navigate                 = useNavigate()

  const fetchNots = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications?limit=30')
      setNots(data.notifications)
      setUnread(data.unread)
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchNots()
    const id = setInterval(fetchNots, 30_000)
    return () => clearInterval(id)
  }, [fetchNots])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = e => {
      if (btnRef.current?.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const openDropdown = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const dropW = 320
      // Align left edge with button's left edge, but clamp so it doesn't overflow right
      const left = Math.min(rect.left, window.innerWidth - dropW - 8)
      setPos({ top: rect.bottom + 8, left: Math.max(8, left) })
    }
    setOpen(o => !o)
  }

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`).catch(() => {})
    setNots(ns => ns.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    setUnread(u => Math.max(0, u - 1))
  }

  const markAllRead = async () => {
    await api.patch('/notifications/read-all').catch(() => {})
    setNots(ns => ns.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })))
    setUnread(0)
  }

  const handleClick = (n) => {
    if (!n.read_at) markRead(n.id)
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  const dropdown = open && (
    <div
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, width: 320 }}
      className="bg-surface border border-border rounded-xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="font-semibold text-sm text-white">Известия</span>
        <div className="flex items-center gap-3">
          {unread > 0 && (
            <button onClick={markAllRead} className="text-xs text-accent hover:underline">
              Всички прочетени
            </button>
          )}
          <button
            onClick={() => { setOpen(false); navigate('/notifications') }}
            className="text-xs text-muted hover:text-white transition-colors"
          >
            Виж всички →
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-border/50">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted text-sm">
            <div className="text-2xl mb-2">🔔</div>
            Няма известия
          </div>
        ) : (
          notifications.map(n => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full text-left px-4 py-3 hover:bg-border/30 transition-colors flex gap-3 items-start ${!n.read_at ? 'bg-accent/5' : ''}`}
            >
              <span className="text-lg flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-tight ${!n.read_at ? 'text-white font-medium' : 'text-gray-300'}`}>
                  {n.title}
                </p>
                {n.body && <p className="text-xs text-muted mt-0.5 truncate">{n.body}</p>}
                <p className="text-xs text-muted/70 mt-1">
                  {formatDistanceToNow(parseISO(n.created_at), { addSuffix: true, locale: bg })}
                </p>
              </div>
              {!n.read_at && (
                <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )

  return (
    <>
      <button
        ref={btnRef}
        onClick={openDropdown}
        className="relative p-2 rounded-lg hover:bg-border transition-colors text-muted hover:text-white"
        title="Известия"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
            bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {createPortal(dropdown, document.body)}
    </>
  )
}
