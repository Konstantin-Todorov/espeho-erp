import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

let cached = null, cachedAt = 0
const listeners = new Set()

// Base glass list (Каталог → Стъкла). Prices come only for the owner; the office gets names and waste.
export default function useGlass() {
  const { isOffice } = useAuth()
  const [glasses, setGlasses] = useState(cached || [])
  useEffect(() => {
    listeners.add(setGlasses)
    if (isOffice && (!cached || Date.now() - cachedAt > 60_000)) {
      api.get('/glass').then(r => { cached = r.data; cachedAt = Date.now(); listeners.forEach(l => l(cached)) }).catch(() => {})
    }
    return () => listeners.delete(setGlasses)
  }, [isOffice])
  return glasses
}
export const invalidateGlassCache = () => { cached = null }
