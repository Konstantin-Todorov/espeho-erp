import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const DEMO_ACCOUNTS = [
  { label: 'Администратор', email: 'admin@espeho.com',      color: 'bg-purple-500/15 text-purple-400 border border-purple-500/30 hover:bg-purple-500/25' },
  { label: 'Офис',          email: 'office1@espeho.com',    color: 'bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25' },
  { label: 'Производство',  email: 'prod1@espeho.com',      color: 'bg-orange-500/15 text-orange-400 border border-orange-500/30 hover:bg-orange-500/25' },
  { label: 'Склад',         email: 'warehouse1@espeho.com', color: 'bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25' },
]

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка при влизане')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (account) => {
    setEmail(account.email)
    setPassword('espeho2024')
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl border border-accent/30 mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">ЕСПЕХО</h1>
          <p className="text-sm text-muted mt-1">Производствена ERP система</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="admin@espeho.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="label">Парола</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full justify-center mt-2" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Влизане...
              </span>
            ) : 'Влез в системата'}
          </button>
        </form>

        {/* Demo quick-fill */}
        <div className="mt-5">
          <p className="text-center text-xs text-muted mb-3 uppercase tracking-wide">Бърз достъп</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${acc.color}`}
              >
                {acc.label}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-muted/60 mt-2">
            Парола: <span className="font-mono text-muted">espeho2024</span>
          </p>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          ЕСПЕХО ООД © {new Date().getFullYear()} — soft.espeho.com
        </p>
      </div>
    </div>
  )
}
