import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ orders: [], clients: [] })
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults({ orders: [], clients: [] })
      setOpen(false)
      return
    }

    setLoading(true)
    Promise.all([
      api.get(`/orders?search=${encodeURIComponent(debouncedQuery)}&limit=5`),
      api.get(`/clients?search=${encodeURIComponent(debouncedQuery)}&limit=5`),
    ]).then(([ordersRes, clientsRes]) => {
      setResults({
        orders: ordersRes.data.data || [],
        clients: clientsRes.data.data || [],
      })
      setOpen(true)
    }).catch(() => {
      setResults({ orders: [], clients: [] })
    }).finally(() => setLoading(false))
  }, [debouncedQuery])

  // Close on outside click
  useEffect(() => {
    const handler = e => {
      if (
        inputRef.current && !inputRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (path) => {
    setQuery('')
    setOpen(false)
    navigate(path)
  }

  const hasResults = results.orders.length > 0 || results.clients.length > 0

  return (
    <div className="relative px-3 mb-2">
      <div className="relative">
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => hasResults && setOpen(true)}
          placeholder="Търси поръчки, клиенти..."
          className="w-full bg-bg border border-border rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-muted focus:outline-none focus:border-accent transition-colors"
        />
        {loading && (
          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted animate-spin"
            fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
      </div>

      {open && hasResults && (
        <div
          ref={dropdownRef}
          className="absolute left-3 right-3 top-full mt-1 z-50 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden"
        >
          {results.orders.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-xs font-semibold text-muted uppercase tracking-wide bg-bg/60">
                Поръчки
              </p>
              {results.orders.map(o => (
                <button
                  key={o.id}
                  className="w-full text-left px-3 py-2 hover:bg-border transition-colors flex items-center justify-between gap-2"
                  onClick={() => handleSelect(`/orders/${o.id}`)}
                >
                  <div>
                    <span className="text-accent font-bold text-xs">#{o.order_number}</span>
                    <span className="text-white text-xs ml-2">{o.client_name}</span>
                  </div>
                  <span className="text-muted text-xs flex-shrink-0">{o.status}</span>
                </button>
              ))}
            </div>
          )}

          {results.clients.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-xs font-semibold text-muted uppercase tracking-wide bg-bg/60">
                Клиенти
              </p>
              {results.clients.map(c => (
                <button
                  key={c.id}
                  className="w-full text-left px-3 py-2 hover:bg-border transition-colors flex items-center justify-between gap-2"
                  onClick={() => handleSelect(`/clients/${c.id}`)}
                >
                  <div>
                    <span className="text-white text-xs font-medium">{c.name}</span>
                    {c.phone && <span className="text-muted text-xs ml-2">{c.phone}</span>}
                  </div>
                  {c.city && <span className="text-muted text-xs flex-shrink-0">{c.city}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {open && !hasResults && !loading && debouncedQuery.length >= 2 && (
        <div
          ref={dropdownRef}
          className="absolute left-3 right-3 top-full mt-1 z-50 bg-surface border border-border rounded-xl shadow-2xl"
        >
          <p className="px-3 py-3 text-xs text-muted text-center">Няма намерени резултати</p>
        </div>
      )}
    </div>
  )
}
