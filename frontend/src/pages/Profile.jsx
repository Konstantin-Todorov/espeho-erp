import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { RoleBadge } from '../components/ui/StatusBadge'
import toast from 'react-hot-toast'

const ROLE_LABELS = {
  admin: 'Администратор',
  office: 'Офис',
  production: 'Производство',
  warehouse: 'Склад',
}

export default function Profile() {
  const { user, login } = useAuth()
  const [profile, setProfile] = useState(null)
  const [editName, setEditName] = useState(false)
  const [name, setName] = useState('')
  const [savingName, setSavingName] = useState(false)

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [savingPw, setSavingPw] = useState(false)

  useEffect(() => {
    api.get('/auth/me').then(r => {
      setProfile(r.data)
      setName(r.data.name)
    })
  }, [])

  const handleSaveName = async () => {
    if (!name.trim()) return toast.error('Името не може да е празно')
    setSavingName(true)
    try {
      await api.patch(`/auth/users/${user.id}`, { name: name.trim() })
      setProfile(p => ({ ...p, name: name.trim() }))
      // Update localStorage
      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      stored.name = name.trim()
      localStorage.setItem('user', JSON.stringify(stored))
      setEditName(false)
      toast.success('Името е обновено')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setSavingName(false) }
  }

  const handleChangePassword = async e => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm) {
      return toast.error('Новите пароли не съвпадат')
    }
    if (pwForm.new_password.length < 6) {
      return toast.error('Паролата трябва да е поне 6 символа')
    }
    setSavingPw(true)
    try {
      await api.post('/auth/change-password', {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      })
      toast.success('Паролата е сменена успешно')
      setPwForm({ current_password: '', new_password: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешна текуща парола')
    } finally { setSavingPw(false) }
  }

  if (!profile) return null

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Моят профил</h1>

      {/* Avatar + basic info */}
      <div className="card mb-4">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-accent/20 border-2 border-accent/40 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-accent">
              {profile.name?.[0] || '?'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              {editName ? (
                <div className="flex items-center gap-2">
                  <input
                    className="input py-1 text-lg font-bold w-52"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditName(false) }}
                    autoFocus
                  />
                  <button className="btn-primary py-1 text-sm" onClick={handleSaveName} disabled={savingName}>
                    {savingName ? '...' : 'Запази'}
                  </button>
                  <button className="btn-secondary py-1 text-sm" onClick={() => { setEditName(false); setName(profile.name) }}>
                    Откажи
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white">{profile.name}</h2>
                  <button
                    className="text-muted hover:text-accent transition-colors"
                    onClick={() => setEditName(true)}
                    title="Редактирай името"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            <p className="text-muted text-sm mt-0.5">{profile.email}</p>
            <div className="mt-1.5">
              <RoleBadge role={profile.role} />
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="card mb-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Детайли</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted">Email</span>
            <span className="text-white font-medium">{profile.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted">Роля</span>
            <RoleBadge role={profile.role} />
          </div>
          {profile.role === 'production' && (
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted">Часова ставка</span>
              <span className="text-white font-medium">{profile.hourly_rate || 0} €/ч</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2">
            <span className="text-muted">Роля в системата</span>
            <span className="text-gray-300">{ROLE_LABELS[profile.role]}</span>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="card">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Смяна на парола</h3>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="label">Текуща парола</label>
            <input
              type="password"
              className="input"
              placeholder="Въведи текущата парола"
              value={pwForm.current_password}
              onChange={e => setPwForm(f => ({ ...f, current_password: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Нова парола</label>
            <input
              type="password"
              className="input"
              placeholder="Поне 6 символа"
              value={pwForm.new_password}
              onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Потвърди нова парола</label>
            <input
              type="password"
              className="input"
              placeholder="Повтори новата парола"
              value={pwForm.confirm}
              onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
              required
            />
          </div>
          {pwForm.new_password && pwForm.confirm && pwForm.new_password !== pwForm.confirm && (
            <p className="text-xs text-danger">Паролите не съвпадат</p>
          )}
          <div className="pt-1">
            <button
              type="submit"
              className="btn-primary"
              disabled={savingPw || (pwForm.new_password !== pwForm.confirm)}
            >
              {savingPw ? 'Запазване...' : 'Смени паролата'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
