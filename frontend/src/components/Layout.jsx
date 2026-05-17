import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import LowStockAlert from './LowStockAlert'
import NotificationBell from './NotificationBell'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 w-72 h-full">
            <Sidebar mobile onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
          <button onClick={() => setMobileOpen(true)} className="text-muted hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-white">ЕСПЕХО ERP</span>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0] || '?'}
            </div>
          </div>
        </header>

        {/* Low stock persistent alert for warehouse role */}
        {(user?.role === 'warehouse' || user?.role === 'admin') && <LowStockAlert />}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
