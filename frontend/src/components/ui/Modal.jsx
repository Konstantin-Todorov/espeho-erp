import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const handleKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${widths[size]} bg-surface border border-border rounded-2xl shadow-2xl`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-white transition-colors p-1 rounded-lg hover:bg-border">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, danger }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-gray-300 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button className="btn-secondary" onClick={onClose}>Откажи</button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={() => { onConfirm(); onClose() }}>
          Потвърди
        </button>
      </div>
    </Modal>
  )
}
