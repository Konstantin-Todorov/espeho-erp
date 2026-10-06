import { useState } from 'react'
import { Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import useOptions from '../../hooks/useOptions'
import { useAuth } from '../../context/AuthContext'

// A dropdown whose options come from an editable list (Настройки → Списъци).
// Office/admin can add a missing option right here with "+ Добави…".
export default function OptionSelect({ listKey, value, onChange, className = 'select', placeholder, allowAdd = true, id, required }) {
  const { lists, add } = useOptions()
  const { isOffice } = useAuth()
  const [adding, setAdding] = useState(false)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const options = lists[listKey] || []
  const canAdd = allowAdd && isOffice && !listKey.startsWith('stages:')
  // Keep showing a value that isn't (or is no longer) in the list
  const missing = value && !options.some(o => o.value === value)

  const save = async () => {
    if (!text.trim()) return
    setSaving(true)
    try {
      const opt = await add(listKey, text)
      onChange(opt.value)
      setAdding(false); setText('')
      toast.success(`„${opt.label}“ е добавено`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setSaving(false) }
  }

  if (adding) {
    return (
      <div className="flex gap-1">
        <input className="input flex-1" autoFocus placeholder="Нова стойност…" value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); save() } if (e.key === 'Escape') setAdding(false) }} />
        <button type="button" className="btn-primary px-2.5" disabled={saving || !text.trim()} onClick={save} aria-label="Добави">
          <Check className="w-4 h-4" />
        </button>
        <button type="button" className="btn-secondary px-2.5" onClick={() => setAdding(false)} aria-label="Откажи">
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <select id={id} className={className} value={value || ''} required={required}
      onChange={e => e.target.value === '__add__' ? setAdding(true) : onChange(e.target.value)}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {missing && <option value={value}>{value}</option>}
      {options.map(o => <option key={o.id} value={o.value}>{o.label}</option>)}
      {canAdd && <option value="__add__">+ Добави нова стойност…</option>}
    </select>
  )
}

