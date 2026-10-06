import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.get('/auth/me')
        .then(res => { setUser(res.data); localStorage.setItem('user', JSON.stringify(res.data)) })
        .catch(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  // Update the stored user after a profile change (e.g. new display name)
  const updateUser = patch => {
    setUser(prev => {
      const next = { ...prev, ...patch }
      localStorage.setItem('user', JSON.stringify(next))
      return next
    })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'
  const isOffice = ['admin','office'].includes(user?.role)
  const isProduction = ['admin','production'].includes(user?.role)
  const isWarehouse = ['admin','warehouse'].includes(user?.role)
  // Prices, costs and margins are for admin and office only (the server enforces the same rule)
  const canSeePrices = isOffice
  // Cost, margin and profit are for the owner (admin) only
  const canSeeCost = isAdmin

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, isAdmin, isOffice, isProduction, isWarehouse, canSeePrices, canSeeCost }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
