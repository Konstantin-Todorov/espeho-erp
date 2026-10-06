import { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'

// Editable dropdown lists from the server, shared across the app (one request per session).
let cache = null
let inflight = null
const listeners = new Set()
const emit = () => listeners.forEach(fn => fn(cache))

export function loadOptions(force = false) {
  if (cache && !force) return Promise.resolve(cache)
  if (!inflight || force) {
    inflight = api.get('/options').then(r => { cache = r.data; emit(); return cache }).finally(() => { inflight = null })
  }
  return inflight
}

export default function useOptions() {
  const [data, setData] = useState(cache || {})
  useEffect(() => {
    listeners.add(setData)
    loadOptions().catch(() => {})
    return () => listeners.delete(setData)
  }, [])

  const add = useCallback(async (listKey, label) => {
    const { data: opt } = await api.post('/options', { list_key: listKey, label })
    cache = { ...(cache || {}), [listKey]: [...((cache || {})[listKey] || []).filter(o => o.id !== opt.id), opt] }
    emit()
    return opt
  }, [])

  // Label for a stored value (falls back to the value itself, e.g. old records)
  const label = useCallback((listKey, value, fallback = {}) =>
    (data[listKey] || []).find(o => o.value === value)?.label || fallback[value] || value || '—', [data])

  return { lists: data, add, label, reload: () => loadOptions(true) }
}
