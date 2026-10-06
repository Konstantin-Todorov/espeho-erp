import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import api from '../../api/axios'
import { orderNo } from '../../utils/labels'

// Searchable order field. Type an order number (incl. the original 326-00160 number) or a client name.
// value: order id; selected: optional { id, order_number, external_ref, client_name };
// params: extra filters for GET /orders (default: active orders only); onChange(order | null)
export default function OrderPicker({ value, selected, onChange, params = { active: 'true' }, autoFocus,
  placeholder = 'Търси по № на поръчка или клиент…' }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState(selected || null)
  const [active, setActive] = useState(0)
  const [pos, setPos] = useState(null)
  const inputRef = useRef(null)
  const boxRef = useRef(null)
  const paramsKey = JSON.stringify(params)

  useEffect(() => { if (selected) setCurrent(selected) }, [selected?.id])
  useEffect(() => {
    if (value && (!current || current.id !== value)) {
      api.get(`/orders/${value}`)
        .then(r => setCurrent({ id: r.data.id, order_number: r.data.order_number, external_ref: r.data.external_ref, client_name: r.data.client_name }))
        .catch(() => {})
    }
    if (!value) setCurrent(null)
  }, [value])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => {
      setLoading(true)
      api.get('/orders', { params: { ...params, search: query.trim() || undefined, limit: 20 } })
        .then(r => { setResults(r.data.data || []); setActive(0) })
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 200)
    return () => clearTimeout(t)
  }, [query, open, paramsKey])

  useEffect(() => {
    if (!open) return
    const place = () => {
      const r = inputRef.current?.getBoundingClientRect()
      if (r) setPos({ left: r.left, top: r.bottom + 4, width: r.width })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    const close = e => {
      if (!boxRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
      document.removeEventListener('mousedown', close)
    }
  }, [open])

  const pick = o => {
    setCurrent(o); setOpen(false); setQuery('')
    onChange?.(o)
  }

  const onKey = e => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[active]) pick(results[active]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  if (current && !open) {
    return (
      <div className="flex items-center gap-2 input py-2">
        <div className="flex-1 min-w-0 truncate">
          <span className="font-medium text-accent">{orderNo(current)}</span>
          {current.client_name && <span className="text-sm text-white ml-2">{current.client_name}</span>}
        </div>
        <button type="button" className="text-xs text-accent hover:underline flex-shrink-0"
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0) }}>
          Смени
        </button>
      </div>
    )
  }

  return (
    <>
      <input ref={inputRef} className="input" placeholder={placeholder} value={query} autoFocus={autoFocus}
        onFocus={() => setOpen(true)} onChange={e => { setQuery(e.target.value); setOpen(true) }} onKeyDown={onKey} />
      {open && pos && createPortal(
        <div ref={boxRef} style={{ position: 'fixed', left: pos.left, top: pos.top, width: pos.width, zIndex: 70 }}
          className="bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">
          <div className="max-h-72 overflow-y-auto">
            {loading && !results.length && <p className="text-center text-muted text-sm py-3">Търсене…</p>}
            {results.map((o, i) => (
              <button key={o.id} type="button" onMouseDown={e => e.preventDefault()} onClick={() => pick(o)}
                className={`w-full text-left px-3 py-2 flex justify-between gap-2 ${i === active ? 'bg-border' : 'hover:bg-border'}`}>
                <span className="text-sm truncate">
                  <span className="text-accent font-medium">{orderNo(o)}</span>
                  <span className="text-white ml-2">{o.client_name}</span>
                </span>
                <span className="text-xs text-muted flex-shrink-0">{o.status}</span>
              </button>
            ))}
            {!loading && !results.length && <p className="text-center text-muted text-sm py-3">Няма намерени поръчки</p>}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
