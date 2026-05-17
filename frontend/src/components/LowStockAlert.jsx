import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function LowStockAlert() {
  const [items, setItems] = useState([])
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    api.get('/warehouse/low-stock')
      .then(res => setItems(res.data))
      .catch(() => {})
  }, [])

  if (!items.length || dismissed) return null

  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-yellow-400 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
          </svg>
          <span>
            <strong>{items.length} материала</strong> под минималната наличност —{' '}
            <Link to="/warehouse?tab=low-stock" className="underline hover:text-yellow-300">виж списъка</Link>
          </span>
        </div>
        <button onClick={() => setDismissed(true)} className="text-yellow-600 hover:text-yellow-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
