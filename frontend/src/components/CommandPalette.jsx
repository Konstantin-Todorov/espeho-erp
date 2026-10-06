import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { orderNo, eur } from '../utils/labels'
import { Search } from 'lucide-react'

// Ctrl/⌘+K from anywhere: find an order by number / client / phone, open a client,
// or start any action ("нова поръчка", "неплатени"…) without hunting through menus.
const ACTIONS = [
  { label: 'Нова поръчка', hint: 'Създай', to: '/orders?new=1', roles: ['admin','office'], kw: 'нова поръчка създай order' },
  { label: 'Нов клиент', hint: 'Създай', to: '/clients?new=1', roles: ['admin','office'], kw: 'нов клиент client' },
  { label: 'Нова оферта', hint: 'Създай', to: '/quotations?new=1', roles: ['admin','office'], kw: 'нова оферта quote' },
  { label: 'Нова доставка', hint: 'Създай', to: '/deliveries?new=1', roles: ['admin','office','warehouse'], kw: 'доставка' },
  { label: 'Запиши брак', hint: 'Създай', to: '/defects?new=1', roles: ['admin','office','production'], kw: 'брак счупено дефект' },
  { label: 'Приеми стока', hint: 'Склад', to: '/warehouse?new=receive', roles: ['admin','warehouse'], kw: 'приеми стока склад' },
  { label: 'Работен ден', hint: 'Табло', to: '/board', roles: ['admin','office'], kw: 'табло работен ден днес' },
  { label: 'Неплатени поръчки', hint: 'Списък', to: '/orders?tab=unpaid', roles: ['admin','office'], kw: 'неплатени дължи плащане' },
  { label: 'Чакат монтаж', hint: 'Списък', to: '/orders?tab=install', roles: ['admin','office'], kw: 'монтаж' },
  { label: 'Готови за предаване', hint: 'Списък', to: '/orders?status=ГОТОВА', roles: ['admin','office','warehouse'], kw: 'готови предаване' },
  { label: 'Моите задачи в цеха', hint: 'Цех', to: '/production', roles: ['admin','office','production'], kw: 'производство цех задачи' },
  { label: 'Отчети', hint: 'Страница', to: '/reports', roles: ['admin','office'], kw: 'отчети репорти приход' },
  { label: 'Календар', hint: 'Страница', to: '/calendar', roles: ['admin','office','production'], kw: 'календар срокове' },
  { label: 'Склад', hint: 'Страница', to: '/warehouse', roles: ['admin','office','warehouse'], kw: 'склад наличности' },
  { label: 'Настройки', hint: 'Страница', to: '/settings', roles: ['admin'], kw: 'настройки проценти комисионни ддс' },
]

export function useCommandPaletteHotkey(open) {
  useEffect(() => {
    const h = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open() }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open])
}

export default function CommandPalette({ open, onClose }) {
  const { user, isOffice, canSeePrices } = useAuth()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [orders, setOrders] = useState([])
  const [clients, setClients] = useState([])
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    if (open) { setQ(''); setOrders([]); setClients([]); setActive(0); setTimeout(() => inputRef.current?.focus(), 0) }
  }, [open])

  useEffect(() => {
    if (!open) return
    const term = q.trim()
    if (term.length < 2) {
      setOrders([])
      // Nothing typed yet: offer the favorite clients right away
      if (isOffice) api.get('/clients', { params: { favorites: 1, limit: 8, sort: 'name' } }).then(r => setClients(r.data.data)).catch(() => setClients([]))
      else setClients([])
      return
    }
    const t = setTimeout(() => {
      api.get('/orders', { params: { search: term, limit: 6 } }).then(r => setOrders(r.data.data)).catch(() => {})
      if (isOffice) api.get('/clients', { params: { search: term, limit: 5, sort: 'orders' } }).then(r => setClients(r.data.data)).catch(() => {})
    }, 180)
    return () => clearTimeout(t)
  }, [q, open, isOffice])

  const actions = useMemo(() => {
    const term = q.trim().toLowerCase()
    const mine = ACTIONS.filter(a => a.roles.includes(user?.role))
    return term ? mine.filter(a => (a.label + ' ' + a.kw).toLowerCase().includes(term)) : mine.slice(0, 6)
  }, [q, user?.role])

  const items = [
    ...orders.map(o => ({ key: 'o' + o.id, group: 'Поръчки', to: `/orders/${o.id}`,
      title: `${orderNo(o)} · ${o.client_name}`, meta: `${o.status}${canSeePrices && o.sale_price ? ' · ' + eur(o.sale_price) : ''}` })),
    ...clients.map(c => ({ key: 'c' + c.id, group: q.trim().length < 2 ? 'Любими клиенти' : 'Клиенти', to: `/clients/${c.id}`,
      title: (c.is_favorite ? '★ ' : '') + c.name, meta: [c.phone, c.order_count ? `${c.order_count} поръчки` : ''].filter(Boolean).join(' · ') })),
    ...actions.map(a => ({ key: 'a' + a.to, group: 'Действия', to: a.to, title: a.label, meta: a.hint })),
  ]

  useEffect(() => { setActive(0) }, [orders, clients, q])
  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  if (!open) return null

  const go = it => { onClose(); navigate(it.to) }
  const onKey = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, items.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter' && items[active]) { e.preventDefault(); go(items[active]) }
    else if (e.key === 'Escape') onClose()
  }

  let lastGroup = null
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-start justify-center pt-[12vh] px-4" onKeyDown={onKey}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search className="w-5 h-5 text-muted flex-shrink-0" strokeWidth={2} />
          <input ref={inputRef} autoFocus value={q} onChange={e => setQ(e.target.value)}
            className="flex-1 bg-transparent py-4 text-white placeholder:text-muted outline-none text-base"
            placeholder={isOffice ? 'Номер на поръчка, клиент, телефон или действие…' : 'Номер на поръчка или клиент…'} />
          <kbd className="hidden sm:block text-[10px] text-muted border border-border rounded px-1.5 py-0.5">Esc</kbd>
        </div>
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
          {items.length === 0 && (
            <p className="text-center text-muted text-sm py-8">{q.trim().length < 2 ? 'Започнете да пишете…' : 'Нищо не е намерено'}</p>
          )}
          {items.map((it, i) => {
            const header = it.group !== lastGroup ? (lastGroup = it.group) : null
            return (
              <div key={it.key}>
                {header && <p className="px-4 pt-2 pb-1 text-[11px] uppercase tracking-wider text-muted">{header}</p>}
                <button data-idx={i} onMouseEnter={() => setActive(i)} onClick={() => go(it)}
                  className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 ${i === active ? 'bg-accent/15' : ''}`}>
                  <span className={`text-sm truncate ${i === active ? 'text-white' : 'text-gray-300'}`}>{it.title}</span>
                  <span className="text-xs text-muted flex-shrink-0">{it.meta}</span>
                </button>
              </div>
            )
          })}
        </div>
        <div className="px-4 py-2 border-t border-border text-[11px] text-muted flex gap-4">
          <span>↑↓ избор</span><span>Enter отвори</span><span className="ml-auto">Ctrl/⌘ + K отвсякъде</span>
        </div>
      </div>
    </div>,
    document.body
  )
}
