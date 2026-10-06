import { NavLink, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import NotificationBell from './NotificationBell'
import QuickCreate from './QuickCreate'
import toast from 'react-hot-toast'
import {
  Tags,
  Home, LayoutGrid, ClipboardList, CalendarDays, Users, FileText, Truck, Factory,
  AlertTriangle, Cog, Warehouse, Building2, BarChart3, UserCog, SlidersHorizontal,
  Bell, BookOpen, Search, Settings, Sun, Moon, LogOut,
} from 'lucide-react'

// Menu grouped by how the company works. roles = who sees the item.
const ALL = ['admin','office','production','warehouse']
const NAV_GROUPS = [
  { title: null, items: [
    { label: 'Начало', to: '/', icon: Home, roles: ALL },
    { label: 'Работен ден', to: '/board', icon: LayoutGrid, roles: ['admin'] },
    { label: 'Поръчки', to: '/orders', icon: ClipboardList, roles: ALL },
    { label: 'Календар', to: '/calendar', icon: CalendarDays, roles: ['admin','office','production'] },
  ]},
  { title: 'Продажби', items: [
    { label: 'Клиенти', to: '/clients', icon: Users, roles: ['admin','office'] },
    { label: 'Оферти', to: '/quotations', icon: FileText, roles: ['admin','office'] },
    { label: 'Каталог и цени', to: '/catalog', icon: Tags, roles: ['admin','office'] },
    { label: 'Доставки', to: '/deliveries', icon: Truck, roles: ['admin','office','warehouse'] },
  ]},
  { title: 'Цех', items: [
    { label: 'Производство', to: '/production', icon: Factory, roles: ['admin','office','production'] },
    { label: 'Брак', to: '/defects', icon: AlertTriangle, roles: ['admin','office','production'] },
    { label: 'Машини', to: '/machines', icon: Cog, roles: ['admin','production'] },
  ]},
  { title: 'Склад', items: [
    { label: 'Склад', to: '/warehouse', icon: Warehouse, roles: ['admin','office','warehouse'] },
    { label: 'Доставчици', to: '/suppliers', icon: Building2, roles: ['admin','office','warehouse'] },
  ]},
  { title: 'Управление', items: [
    { label: 'Отчети', to: '/reports', icon: BarChart3, roles: ['admin','office'] },
    { label: 'Потребители', to: '/users', icon: UserCog, roles: ['admin'] },
    { label: 'Настройки', to: '/settings', icon: SlidersHorizontal, roles: ['admin'] },
  ]},
  { title: 'Помощ', items: [
    { label: 'Известия', to: '/notifications', icon: Bell, roles: ALL },
    { label: 'Ръководство', to: '/guide', icon: BookOpen, roles: ALL },
  ]},
]

export default function Sidebar({ mobile, onClose, onSearch }) {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Излязохте от системата')
  }

  const groups = NAV_GROUPS
    .map(g => ({ ...g, items: g.items.filter(item => item.roles.includes(user?.role)) }))
    .filter(g => g.items.length)

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-accent text-white'
        : 'text-gray-400 hover:text-white hover:bg-border'
    }`

  return (
    <div className={`flex flex-col h-full bg-surface border-r border-border ${mobile ? 'w-full' : 'w-60'}`}>
      {/* Logo */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <img src="/favicon.png" alt="Еспехо" className="h-8 w-8 rounded-lg" />
          <div>
            <p className="font-bold text-white leading-tight text-sm">ЕСПЕХО</p>
            <p className="text-xs text-muted">ERP система</p>
          </div>
        </div>
      </div>

      {/* Global Search + Bell */}
      <div className="py-3 border-b border-border px-3 flex items-center gap-2">
        <button type="button" onClick={onSearch}
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-bg border border-border text-muted hover:text-white hover:border-accent/50 text-sm transition-colors">
          <Search className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
          <span className="flex-1 text-left truncate">Търси…</span>
          <kbd className="hidden lg:block text-[10px] border border-border rounded px-1">⌘K</kbd>
        </button>
        <NotificationBell />
      </div>

      {/* Quick create — available from every page */}
      <div className="px-3 pt-3">
        <QuickCreate onNavigate={onClose} />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {groups.map((g, gi) => (
          <div key={gi} className={gi ? 'mt-3' : ''}>
            {g.title && <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted/70">{g.title}</p>}
            <div className="space-y-0.5">
              {g.items.map(item => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass} onClick={onClose}>
                  <item.icon className="w-5 h-5" strokeWidth={1.75} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-border">
        <Link to="/profile" onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-border transition-colors group">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
            {user?.name?.[0] || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate group-hover:text-accent transition-colors">{user?.name}</p>
            <p className="text-xs text-muted truncate">{user?.email}</p>
          </div>
          <Settings className="w-4 h-4 text-muted group-hover:text-accent transition-colors flex-shrink-0" strokeWidth={2} />
        </Link>
        {/* Theme toggle */}
        <button onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-border transition-colors w-full mt-0.5 text-muted hover:text-white">
          {isDark
            ? <Sun className="w-4 h-4 ml-0.5" strokeWidth={2} />
            : <Moon className="w-4 h-4 ml-0.5" strokeWidth={2} />}
          <span className="text-sm font-medium">{isDark ? 'Светла версия' : 'Тъмна версия'}</span>
        </button>

        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-danger/10 transition-colors w-full mt-0.5 text-muted hover:text-danger">
          <LogOut className="w-4 h-4 ml-0.5" strokeWidth={2} />
          <span className="text-sm font-medium">Изход</span>
        </button>
      </div>
    </div>
  )
}
