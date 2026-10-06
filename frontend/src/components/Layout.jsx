import { useState, Suspense, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import LowStockAlert from './LowStockAlert'
import NotificationBell from './NotificationBell'
import QuickCreate from './QuickCreate'
import Spinner from './ui/Spinner'
import CommandPalette, { useCommandPaletteHotkey } from './CommandPalette'
import { useAuth } from '../context/AuthContext'
import { Menu, Search } from 'lucide-react'

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const openPalette = useCallback(() => { setMobileOpen(false); setPaletteOpen(true) }, [])
  useCommandPaletteHotkey(openPalette)
  const { user } = useAuth()

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col flex-shrink-0">
        <Sidebar onSearch={openPalette} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 w-72 h-full">
            <Sidebar mobile onClose={() => setMobileOpen(false)} onSearch={openPalette} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
          <button onClick={() => setMobileOpen(true)} className="text-muted hover:text-white" aria-label="Меню">
            <Menu className="w-6 h-6" strokeWidth={2} />
          </button>
          <span className="font-bold text-white">ЕСПЕХО ERP</span>
          <div className="flex items-center gap-2">
            <button onClick={openPalette} className="p-2 text-muted hover:text-white" aria-label="Търсене">
              <Search className="w-5 h-5" strokeWidth={2} />
            </button>
            <QuickCreate compact />
            <NotificationBell />
          </div>
        </header>

        {/* Low stock persistent alert for warehouse role */}
        {(user?.role === 'warehouse' || user?.role === 'admin') && <LowStockAlert />}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Inner boundary keeps the menu on screen while a page loads */}
          <Suspense fallback={<div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}
