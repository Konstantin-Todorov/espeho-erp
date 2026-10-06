import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

// Searchable client field. Type a name / phone / ЕИК → pick from matches, or create a new client in place.
// value: client id; selected: optional { id, name } to show without a lookup; onChange(client | null)
export default function ClientPicker({ value, selected, onChange, autoFocus, placeholder = 'Търси клиент по име, телефон или ЕИК…' }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState(selected || null)
  const [creating, setCreating] = useState(null) // { name, phone }
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const boxRef = useRef(null)
  const [pos, setPos] = useState(null)

  useEffect(() => { if (selected) setCurrent(selected) }, [selected?.id])
  useEffect(() => {
    if (value && (!current || current.id !== value)) {
      api.get(`/clients/${value}`).then(r => setCurrent({ id: r.data.id, name: r.data.name, phone: r.data.phone })).catch(() => {})
    }
    if (!value) setCurrent(null)
  }, [value])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => {
      setLoading(true)
      api.get('/clients', { params: { search: query || undefined, limit: 12, sort: query ? 'orders' : 'recent' } })
        .then(r => { setResults(r.data.data); setActive(0) })
        .finally(() => setLoading(false))
    }, 200)
    return () => clearTimeout(t)
  }, [query, open])

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

  const pick = c => {
    setCurrent(c); setOpen(false); setQuery(''); setCreating(null)
    onChange?.(c)
  }

  const createClient = async e => {
    e?.preventDefault()
    if (!creating?.name?.trim()) return toast.error('Въведете име')
    try {
      const { data } = await api.post('/clients', { name: creating.name.trim(), phone: creating.phone || null, source: 'office' })
      toast.success('Клиентът е добавен')
      pick(data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    }
  }

  const onKey = e => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      if (active < results.length) pick(results[active])
      else setCreating({ name: query, phone: '' })
    } else if (e.key === 'Escape') setOpen(false)
  }

  if (current && !open && !creating) {
    return (
      <div className="flex items-center gap-2 input py-2">
        <div className="flex-1 min-w-0">
          <span className="font-medium text-white">{current.name}</span>
          {current.phone && <span className="text-xs text-muted ml-2">{current.phone}</span>}
        </div>
        <button type="button" className="text-xs text-accent hover:underline flex-shrink-0"
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0) }}>
          Смени
        </button>
      </div>
    )
  }

  if (creating) {
    return (
      <div className="p-3 bg-bg border border-accent/40 rounded-xl space-y-2">
        <p className="text-xs font-semibold text-accent">Нов клиент</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input className="input text-sm" placeholder="Име / фирма *" autoFocus value={creating.name}
            onChange={e => setCreating(c => ({ ...c, name: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && createClient(e)} />
          <input className="input text-sm" placeholder="Телефон" value={creating.phone}
            onChange={e => setCreating(c => ({ ...c, phone: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && createClient(e)} />
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn-secondary text-xs py-1" onClick={() => setCreating(null)}>Назад</button>
          <button type="button" className="btn-primary text-xs py-1" onClick={createClient}>Добави клиента</button>
        </div>
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
            {!query && !!results.length && <p className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wide text-muted">Последни клиенти</p>}
            {results.map((c, i) => (
              <button key={c.id} type="button" onMouseDown={e => e.preventDefault()} onClick={() => pick(c)}
                className={`w-full text-left px-3 py-2 flex justify-between gap-2 ${i === active ? 'bg-border' : 'hover:bg-border'}`}>
                <span className="text-sm text-white truncate">{c.name}</span>
                <span className="text-xs text-muted flex-shrink-0">{c.phone || ''} {c.order_count ? `· ${c.order_count} поръчки` : ''}</span>
              </button>
            ))}
            {!loading && query && !results.length && <p className="text-center text-muted text-sm py-3">Няма такъв клиент</p>}
          </div>
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => setCreating({ name: query, phone: '' })}
            className={`w-full text-left px-3 py-2.5 text-sm font-medium text-accent border-t border-border ${active === results.length ? 'bg-border' : 'hover:bg-border'}`}>
            + Нов клиент{query ? ` „${query}“` : ''}
          </button>
        </div>,
        document.body
      )}
    </>
  )
}
