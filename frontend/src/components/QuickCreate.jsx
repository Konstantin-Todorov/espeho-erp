import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Plus, ClipboardList, UserPlus, FileText, Truck, AlertTriangle, PackagePlus, ShoppingCart } from 'lucide-react'

// "+ Нов" — create anything from anywhere. Each entry opens the right page with its form already open
// (pages react to ?new=...). Only actions the user's role may perform are listed.
const ACTIONS = [
  { label: 'Поръчка',               icon: ClipboardList, hint: 'нова поръчка за клиент',   to: '/orders?new=1',          roles: ['admin','office'] },
  { label: 'Клиент',                icon: UserPlus, hint: 'нов клиент',               to: '/clients?new=1',         roles: ['admin','office'] },
  { label: 'Оферта',                icon: FileText, hint: 'ценова оферта',            to: '/quotations?new=1',      roles: ['admin','office'] },
  { label: 'Доставка',              icon: Truck, hint: 'насрочи доставка',         to: '/deliveries?new=1',      roles: ['admin','office','warehouse'] },
  { label: 'Брак',                  icon: AlertTriangle, hint: 'запиши счупено/дефектно',  to: '/defects?new=1',         roles: ['admin','office','production'] },
  { label: 'Приемане на стока',     icon: PackagePlus, hint: 'вкарай материал в склада', to: '/warehouse?new=receive', roles: ['admin','warehouse'] },
  { label: 'Поръчка към доставчик', icon: ShoppingCart, hint: 'заяви материали',          to: '/suppliers?new=1',       roles: ['admin','office','warehouse'] },
]

export default function QuickCreate({ onNavigate, compact }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const actions = ACTIONS.filter(a => a.roles.includes(user?.role))

  useEffect(() => {
    if (!open) return
    const close = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const esc = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
  }, [open])

  if (!actions.length) return null

  const go = a => {
    setOpen(false)
    onNavigate?.()
    navigate(a.to)
  }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`btn-primary w-full justify-center ${compact ? 'px-3 py-1.5 text-sm' : ''}`}
        aria-haspopup="menu" aria-expanded={open}>
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        Нов
      </button>
      {open && (
        <div role="menu" className={`absolute z-50 mt-1 ${compact ? 'right-0 w-64' : 'left-0 right-0'} bg-surface border border-border rounded-xl shadow-2xl py-1`}>
          {actions.map(a => (
            <button key={a.to} role="menuitem" type="button" onClick={() => go(a)}
              className="w-full text-left px-3 py-2 hover:bg-border transition-colors flex items-start gap-2.5">
              <a.icon className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted" strokeWidth={2} />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-white">{a.label}</span>
                <span className="block text-xs text-muted">{a.hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
