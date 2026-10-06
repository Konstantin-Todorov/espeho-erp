import { useState } from 'react'
import { Star } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

// Star a client as favorite (key client). Favorites are shared by the whole office and come first
// in client pickers, quick search and the client list.
export default function FavoriteStar({ client, onChange, size = 'w-5 h-5', className = '' }) {
  const [on, setOn] = useState(!!client?.is_favorite)
  const [busy, setBusy] = useState(false)
  const toggle = async e => {
    e.preventDefault(); e.stopPropagation()
    setBusy(true)
    try {
      await api.patch(`/clients/${client.id}`, { is_favorite: !on })
      setOn(!on)
      onChange?.(!on)
      toast.success(!on ? `${client.name} е в любими` : `${client.name} е махнат от любими`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setBusy(false) }
  }
  return (
    <button type="button" onClick={toggle} disabled={busy}
      title={on ? 'Махни от любими' : 'Добави в любими — излиза най-отгоре при избор на клиент'}
      aria-label={on ? 'Махни от любими' : 'Добави в любими'} aria-pressed={on}
      className={`inline-flex items-center justify-center rounded-lg p-1 transition-colors ${on ? 'text-yellow-400' : 'text-muted hover:text-yellow-400'} ${className}`}>
      <Star className={size} fill={on ? 'currentColor' : 'none'} />
    </button>
  )
}

// Small read-only marker for lists
export function FavMark({ on }) {
  if (!on) return null
  return <Star className="w-3.5 h-3.5 inline text-yellow-400 align-[-2px] ml-1" fill="currentColor" aria-label="Любим клиент" />
}
