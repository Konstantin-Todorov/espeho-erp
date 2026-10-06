import { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function LowStockAlert() {
  const [items, setItems] = useState([])
  const [dismissed, setDismissed] = useState(false)
  const { user } = useAuth()
  // Only roles that can open the warehouse page get the banner
  const canSee = ['admin', 'office', 'warehouse'].includes(user?.role)

  useEffect(() => {
    if (!canSee) return
    api.get('/warehouse/low-stock')
      .then(res => setItems(res.data))
      .catch(() => {})
  }, [canSee])

  if (!canSee || !items.length || dismissed) return null
  const materialCount = new Set(items.map(i => i.id)).size

  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-yellow-400 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>{materialCount} {materialCount === 1 ? 'материал' : 'материала'}</strong> под минималната наличност —{' '}
            <Link to="/warehouse?tab=low-stock" className="underline hover:text-yellow-300">виж списъка</Link>
          </span>
        </div>
        <button onClick={() => setDismissed(true)} className="text-yellow-600 hover:text-yellow-400">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
