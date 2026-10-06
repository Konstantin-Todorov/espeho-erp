import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

let cached = null

// Business settings (VAT, minimum billable areas, commissions) as { key: value }.
export default function useSettings() {
  const { isOffice } = useAuth()
  const [settings, setSettings] = useState(cached || {})
  useEffect(() => {
    if (cached) { setSettings(cached); return }
    if (!isOffice) return
    api.get('/settings').then(r => {
      cached = Object.fromEntries(r.data.map(s => [s.key, s.value]))
      setSettings(cached)
    }).catch(() => {})
  }, [isOffice])
  return settings
}
export const invalidateSettingsCache = () => { cached = null }
