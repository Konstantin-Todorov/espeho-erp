import { useEffect, useState } from 'react'
import { ArrowUp, ArrowDown, Eye, EyeOff, Plus, Pencil, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { loadOptions } from '../../hooks/useOptions'

const LISTS = [
  { key: 'stages:стъклопакет',     title: 'Етапи в цеха — стъклопакет', hint: 'По този ред новите поръчки минават през цеха.' },
  { key: 'stages:единично_стъкло', title: 'Етапи в цеха — единично стъкло', hint: 'Огледала, кант, фасет, отвори…' },
  { key: 'stages:смесена',         title: 'Етапи в цеха — смесена поръчка', hint: '' },
  { key: 'stage_extra',            title: 'Допълнителни етапи', hint: 'Предлагат се при „+ Добави етап“ на конкретна поръчка.' },
  { key: 'defect_cause',           title: 'Причини за брак', hint: 'Използват се в отчета за брак.' },
  { key: 'defect_responsibility',  title: 'Отговорност за брак', hint: 'Кой носи отговорност — цех, офис, доставчик…' },
  { key: 'payment_method',         title: 'Начини на плащане', hint: '' },
  { key: 'source',                 title: 'Откъде идват клиентите', hint: 'Показва кои канали носят поръчки.' },
]

function Row({ o, first, last, onMove, onChanged }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(o.label)
  const patch = async body => {
    try { await api.patch(`/options/${o.id}`, body); onChanged() }
    catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
  }
  return (
    <li className={`flex items-center gap-2 px-3 py-2 rounded-lg ${o.active ? 'bg-bg' : 'bg-bg/40 opacity-60'}`}>
      {editing ? (
        <>
          <input className="input flex-1 py-1 text-sm" autoFocus value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { patch({ label: text }); setEditing(false) } if (e.key === 'Escape') setEditing(false) }} />
          <button className="p-1.5 text-accent" aria-label="Запази" onClick={() => { patch({ label: text }); setEditing(false) }}><Check className="w-4 h-4" /></button>
          <button className="p-1.5 text-muted" aria-label="Откажи" onClick={() => setEditing(false)}><X className="w-4 h-4" /></button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm text-white">{o.label}{!o.active && <span className="text-xs text-muted ml-2">(скрито)</span>}</span>
          <button className="p-1.5 text-muted hover:text-white disabled:opacity-20" disabled={first} aria-label="Нагоре" onClick={() => onMove(-1)}><ArrowUp className="w-4 h-4" /></button>
          <button className="p-1.5 text-muted hover:text-white disabled:opacity-20" disabled={last} aria-label="Надолу" onClick={() => onMove(1)}><ArrowDown className="w-4 h-4" /></button>
          <button className="p-1.5 text-muted hover:text-white" aria-label="Преименувай" onClick={() => { setText(o.label); setEditing(true) }}><Pencil className="w-4 h-4" /></button>
          <button className="p-1.5 text-muted hover:text-white" aria-label={o.active ? 'Скрий' : 'Покажи'} title={o.active ? 'Скрий (старите записи остават)' : 'Покажи отново'}
            onClick={() => patch({ active: !o.active })}>
            {o.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </>
      )}
    </li>
  )
}

// Admin editor for the dropdown lists. Renaming changes only the label; records keep their value,
// hiding an option keeps old records intact.
export default function OptionListsEditor() {
  const [lists, setLists] = useState({})
  const [openKey, setOpenKey] = useState(LISTS[0].key)
  const [adding, setAdding] = useState('')

  const load = () => api.get('/options', { params: { all: 1 } }).then(r => setLists(r.data))
  useEffect(() => { load() }, [])
  const changed = () => { load(); loadOptions(true) }

  const move = async (key, idx, dir) => {
    const items = [...(lists[key] || [])].filter(o => o.sort_order < 99)
    const j = idx + dir
    if (j < 0 || j >= items.length) return
    ;[items[idx], items[j]] = [items[j], items[idx]]
    await api.put('/options/order', { ids: items.map(o => o.id) })
    changed()
  }

  const add = async key => {
    if (!adding.trim()) return
    try {
      await api.post('/options', { list_key: key, label: adding })
      setAdding(''); changed()
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
  }

  return (
    <div className="card">
      <h2 className="font-semibold text-white">Списъци (падащи менюта)</h2>
      <p className="text-xs text-muted mt-1 mb-4">
        Стойностите, които се избират в програмата. Офисът може да добавя нови направо от формата („+ Добави нова стойност…“);
        тук се преименуват, подреждат и скриват.
      </p>
      <div className="space-y-2">
        {LISTS.map(l => {
          const items = lists[l.key] || []
          const ordered = items.filter(o => o.sort_order < 99)
          const tail = items.filter(o => o.sort_order >= 99)
          const open = openKey === l.key
          return (
            <div key={l.key} className="border border-border rounded-xl">
              <button className="w-full flex items-center justify-between px-4 py-3 text-left" onClick={() => setOpenKey(open ? null : l.key)}>
                <span>
                  <span className="text-sm font-medium text-white">{l.title}</span>
                  <span className="text-xs text-muted ml-2">{items.filter(o => o.active).length}</span>
                </span>
                <span className="text-muted text-xs">{open ? 'Скрий' : 'Отвори'}</span>
              </button>
              {open && (
                <div className="px-4 pb-4 space-y-2">
                  {l.hint && <p className="text-xs text-muted">{l.hint}</p>}
                  <ul className="space-y-1">
                    {ordered.map((o, i) => (
                      <Row key={o.id} o={o} first={i === 0} last={i === ordered.length - 1}
                        onMove={dir => move(l.key, i, dir)} onChanged={changed} />
                    ))}
                    {tail.map(o => <Row key={o.id} o={o} first last onMove={() => {}} onChanged={changed} />)}
                  </ul>
                  <div className="flex gap-2">
                    <input className="input flex-1 text-sm" placeholder="Нова стойност…" value={adding}
                      onChange={e => setAdding(e.target.value)} onKeyDown={e => e.key === 'Enter' && add(l.key)} />
                    <button className="btn-secondary text-sm" onClick={() => add(l.key)} disabled={!adding.trim()}>
                      <Plus className="w-4 h-4" /> Добави
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
