import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'
import { bg } from 'date-fns/locale'

const MAINT_TYPES = ['профилактика','ремонт','смяна_части','калибриране','почистване']
const MAINT_LABELS = {
  профилактика:'Профилактика', ремонт:'Ремонт',
  смяна_части:'Смяна на части', калибриране:'Калибриране', почистване:'Почистване',
}

const EMPTY_MACHINE = { name:'', type:'', model:'', serial_number:'', cost_per_hour:'', service_interval_days:'90', notes:'' }
const EMPTY_MAINT   = { maintenance_type:'профилактика', performed_by:'', cost:'', notes:'', performed_at: new Date().toISOString().split('T')[0], next_service:'' }

// ─── Add / Edit machine ──────────────────────────────────────────────────────
function MachineFormModal({ open, onClose, machine, onDone }) {
  const isEdit = !!machine
  const [form, setForm] = useState(EMPTY_MACHINE)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setForm(machine ? {
      name: machine.name || '',
      type: machine.type || '',
      model: machine.model || '',
      serial_number: machine.serial_number || '',
      cost_per_hour: machine.cost_per_hour ?? '',
      service_interval_days: machine.service_interval_days ?? '90',
      notes: machine.notes || '',
    } : EMPTY_MACHINE)
  }, [machine, open])

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/machines/${machine.id}`, {
          ...form,
          cost_per_hour: +form.cost_per_hour || 0,
          service_interval_days: +form.service_interval_days || 90,
        })
        toast.success('Машината е обновена')
      } else {
        await api.post('/machines', {
          ...form,
          cost_per_hour: +form.cost_per_hour || 0,
          service_interval_days: +form.service_interval_days || 90,
        })
        toast.success('Машината е добавена')
      }
      onDone(); onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Грешка')
    } finally { setLoading(false) }
  }

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }))

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? `Редактирай: ${machine?.name}` : 'Добави машина'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label">Наименование *</label>
            <input className="input" required placeholder="напр. Стъклорезачка CNC" value={form.name} onChange={e=>f('name',e.target.value)} />
          </div>
          <div>
            <label className="label">Тип / категория</label>
            <input className="input" placeholder="напр. Режещо оборудване" value={form.type} onChange={e=>f('type',e.target.value)} />
          </div>
          <div>
            <label className="label">Модел</label>
            <input className="input" placeholder="напр. Intermac Master" value={form.model} onChange={e=>f('model',e.target.value)} />
          </div>
          <div>
            <label className="label">Сериен номер</label>
            <input className="input" placeholder="SN-12345" value={form.serial_number} onChange={e=>f('serial_number',e.target.value)} />
          </div>
          <div>
            <label className="label">Цена / час (€)</label>
            <input type="number" className="input" min="0" step="0.01" placeholder="0.00" value={form.cost_per_hour} onChange={e=>f('cost_per_hour',e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="label">Интервал за поддръжка (дни)</label>
            <div className="flex gap-2 items-center">
              <input type="number" className="input w-32" min="1" value={form.service_interval_days} onChange={e=>f('service_interval_days',e.target.value)} />
              <div className="flex gap-1">
                {[30,60,90,180,365].map(d => (
                  <button key={d} type="button" onClick={() => f('service_interval_days', String(d))}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      form.service_interval_days === String(d) ? 'bg-accent text-white border-accent' : 'border-border text-muted hover:text-white'}`}>
                    {d >= 365 ? '1г' : d >= 30 ? `${d/30}м` : `${d}д`}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="col-span-2">
            <label className="label">Бележки</label>
            <textarea className="input resize-none" rows={2} placeholder="Допълнителна информация..." value={form.notes} onChange={e=>f('notes',e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-1">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-primary" disabled={loading || !form.name}>
            {loading ? 'Записва...' : isEdit ? 'Запази промените' : 'Добави машина'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Log maintenance ─────────────────────────────────────────────────────────
function MaintenanceModal({ open, onClose, machine, onDone }) {
  const [form, setForm] = useState(EMPTY_MAINT)
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (open) setForm(EMPTY_MAINT) }, [open])

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post(`/machines/${machine?.id}/maintenance`, { ...form, cost: +form.cost||0 })
      toast.success('Поддръжката е записана')
      onDone(); onClose()
    } catch (err) { toast.error(err.response?.data?.error || 'Грешка') }
    finally { setLoading(false) }
  }

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }))

  return (
    <Modal open={open} onClose={onClose} title={`Запиши поддръжка: ${machine?.name || ''}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Вид поддръжка *</label>
          <select className="select" value={form.maintenance_type} onChange={e=>f('maintenance_type',e.target.value)}>
            {MAINT_TYPES.map(t => <option key={t} value={t}>{MAINT_LABELS[t]}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Извършил (техник / фирма)</label>
            <input className="input" placeholder="Иван Петров / Сервиз АД" value={form.performed_by} onChange={e=>f('performed_by',e.target.value)} />
          </div>
          <div>
            <label className="label">Цена (€)</label>
            <input type="number" className="input" min="0" step="0.01" placeholder="0.00" value={form.cost} onChange={e=>f('cost',e.target.value)} />
          </div>
          <div>
            <label className="label">Дата на поддръжка</label>
            <input type="date" className="input" value={form.performed_at} onChange={e=>f('performed_at',e.target.value)} />
          </div>
          <div>
            <label className="label">Следваща поддръжка</label>
            <input type="date" className="input" value={form.next_service} onChange={e=>f('next_service',e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Описание на работата *</label>
          <textarea className="input resize-none" rows={3} required
            placeholder="Какво е направено, сменени части, забелязани проблеми..."
            value={form.notes} onChange={e=>f('notes',e.target.value)} />
        </div>
        <div className="flex gap-3 justify-end pt-1">
          <button type="button" className="btn-secondary" onClick={onClose}>Откажи</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Записва...' : '✓ Запиши поддръжка'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Machine detail modal ────────────────────────────────────────────────────
function MachineDetailModal({ open, onClose, machineId, onEdit, onDelete, onLogMaint }) {
  const { isAdmin } = useAuth()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !machineId) return
    setLoading(true)
    api.get(`/machines/${machineId}`)
      .then(r => setDetail(r.data))
      .catch(() => toast.error('Грешка при зареждане'))
      .finally(() => setLoading(false))
  }, [open, machineId])

  const machine = detail

  return (
    <Modal open={open} onClose={onClose} title={machine?.name || 'Детайл на машина'} size="lg">
      {loading || !machine ? (
        <div className="py-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {[
              { label: 'Тип', val: machine.type || '—' },
              { label: 'Модел', val: machine.model || '—' },
              { label: 'Сериен номер', val: machine.serial_number || '—' },
              { label: 'Цена / час', val: `${machine.cost_per_hour} €` },
              { label: 'Интервал поддръжка', val: `${machine.service_interval_days} дни` },
              {
                label: 'Следваща поддръжка',
                val: machine.next_service_date ? format(parseISO(machine.next_service_date), 'd MMM yyyy', { locale: bg }) : '—',
                alert: machine.service_overdue,
              },
            ].map(item => (
              <div key={item.label} className="card py-3 px-4">
                <p className="text-xs text-muted uppercase tracking-wide mb-1">{item.label}</p>
                <p className={`font-semibold ${item.alert ? 'text-danger' : 'text-white'}`}>
                  {item.alert ? '⚠ ' : ''}{item.val}
                </p>
              </div>
            ))}
          </div>

          {machine.notes && (
            <div className="rounded-xl bg-surface/60 border border-border px-4 py-3 text-sm text-gray-300">
              <p className="text-xs text-muted uppercase tracking-wide mb-1">Бележки</p>
              {machine.notes}
            </div>
          )}

          {/* Maintenance history */}
          <div>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
              История на поддръжките
            </h3>
            {(!machine.maintenance_logs || machine.maintenance_logs.length === 0) ? (
              <p className="text-muted text-sm py-4 text-center border border-dashed border-border rounded-xl">
                Няма записани поддръжки
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {machine.maintenance_logs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-surface/50 border border-border/50">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent text-xs font-bold mt-0.5">
                      {log.maintenance_type?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-white text-sm">{MAINT_LABELS[log.maintenance_type] || log.maintenance_type}</span>
                        {log.cost > 0 && <span className="text-xs text-muted flex-shrink-0">{Number(log.cost).toFixed(2)} €</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{log.notes}</p>
                      <p className="text-xs text-muted mt-1">
                        {format(parseISO(log.performed_at), 'd MMM yyyy', { locale: bg })}
                        {log.performed_by && ` · ${log.performed_by}`}
                        {log.worker_name && ` · ${log.worker_name}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border flex-wrap">
            <button className="btn-primary" onClick={() => { onClose(); onLogMaint(machine) }}>
              + Запиши поддръжка
            </button>
            {isAdmin && (
              <>
                <button className="btn-secondary" onClick={() => { onClose(); onEdit(machine) }}>
                  ✏ Редактирай
                </button>
                <button className="btn-danger ml-auto" onClick={() => onDelete(machine)}>
                  Деактивирай
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

// ─── Machine card ────────────────────────────────────────────────────────────
function MachineCard({ machine, onClick }) {
  const pct = machine.last_service && machine.next_service_date
    ? (() => {
        const last = new Date(machine.last_service).getTime()
        const next = new Date(machine.next_service_date).getTime()
        const now  = Date.now()
        const raw  = Math.max(0, Math.min(100, ((now - last) / (next - last)) * 100))
        return Math.round(raw)
      })()
    : null

  return (
    <div onClick={onClick}
      className={`card cursor-pointer hover:border-accent/50 hover:shadow-lg transition-all group
        ${machine.service_overdue ? 'border-red-500/30' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <p className="font-semibold text-white group-hover:text-accent transition-colors truncate">{machine.name}</p>
          <p className="text-xs text-muted mt-0.5">{machine.type || '—'}{machine.model && ` · ${machine.model}`}</p>
        </div>
        <span className={`badge flex-shrink-0 ml-2 ${machine.service_overdue ? 'bg-red-500/20 text-danger border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
          {machine.service_overdue ? '⚠ Просрочена' : '✓ OK'}
        </span>
      </div>

      <div className="space-y-1.5 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-muted">Цена/час</span>
          <span className="text-white font-medium">{machine.cost_per_hour} €</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Последна поддръжка</span>
          <span className="text-white">
            {machine.last_service ? format(parseISO(machine.last_service), 'd MMM yyyy', { locale: bg }) : 'Никога'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Следваща</span>
          <span className={machine.service_overdue ? 'text-danger font-medium' : 'text-white'}>
            {machine.next_service_date ? format(parseISO(machine.next_service_date), 'd MMM yyyy', { locale: bg }) : '—'}
          </span>
        </div>
      </div>

      {pct !== null && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>До следваща поддръжка</span>
            <span>{Math.max(0, 100 - pct)}% остава</span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${
              pct >= 100 ? 'bg-red-500' : pct >= 75 ? 'bg-yellow-500' : 'bg-green-500'
            }`} style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-border/40 flex items-center justify-between">
        <span className="text-xs text-muted">Кликни за детайл и история</span>
        <span className="text-xs text-accent group-hover:translate-x-0.5 transition-transform">Отвори →</span>
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function Machines() {
  const { isAdmin, isProduction } = useAuth()
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)

  const [detailId, setDetailId]       = useState(null)
  const [editMachine, setEditMachine] = useState(null)
  const [maintMachine, setMaintMachine] = useState(null)
  const [addOpen, setAddOpen]         = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const fetchMachines = async () => {
    setLoading(true)
    try { const { data } = await api.get('/machines'); setMachines(data) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchMachines() }, [])

  const handleDelete = async () => {
    try {
      await api.patch(`/machines/${confirmDelete.id}`, { active: false })
      toast.success(`${confirmDelete.name} е деактивирана`)
      setConfirmDelete(null)
      fetchMachines()
    } catch { toast.error('Грешка при деактивиране') }
  }

  if (loading) return <PageLoader />

  const overdue = machines.filter(m => m.service_overdue)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Машини</h1>
          <p className="text-sm text-muted mt-0.5">
            {machines.length} активни машини
            {overdue.length > 0 && <span className="text-danger ml-2">· {overdue.length} с просрочена поддръжка</span>}
          </p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setAddOpen(true)}>
            + Добави машина
          </button>
        )}
      </div>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div className="card border-red-500/30 bg-red-500/5 mb-6">
          <p className="text-danger font-semibold mb-2">⚠ Просрочена поддръжка</p>
          <div className="space-y-1">
            {overdue.map(m => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{m.name}</span>
                <span className="text-muted">
                  Последна: {m.last_service ? format(parseISO(m.last_service), 'd MMM yyyy', { locale: bg }) : 'никога'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {machines.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">⚙️</p>
          <p className="text-white font-semibold mb-1">Няма добавени машини</p>
          <p className="text-muted text-sm mb-4">Добавете машините от вашия цех за проследяване на поддръжката</p>
          {isAdmin && <button className="btn-primary mx-auto" onClick={() => setAddOpen(true)}>+ Добави първа машина</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {machines.map(m => (
            <MachineCard key={m.id} machine={m} onClick={() => setDetailId(m.id)} />
          ))}
        </div>
      )}

      {/* Modals */}
      <MachineFormModal
        open={addOpen} onClose={() => setAddOpen(false)}
        machine={null} onDone={fetchMachines}
      />
      <MachineFormModal
        open={!!editMachine} onClose={() => setEditMachine(null)}
        machine={editMachine} onDone={fetchMachines}
      />
      <MachineDetailModal
        open={!!detailId} onClose={() => setDetailId(null)}
        machineId={detailId}
        onEdit={m => setEditMachine(m)}
        onDelete={m => { setDetailId(null); setConfirmDelete(m) }}
        onLogMaint={m => setMaintMachine(m)}
      />
      <MaintenanceModal
        open={!!maintMachine} onClose={() => setMaintMachine(null)}
        machine={maintMachine} onDone={fetchMachines}
      />

      {/* Confirm deactivate */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="card max-w-sm w-full">
            <p className="font-semibold text-white mb-2">Деактивирай машина?</p>
            <p className="text-sm text-muted mb-5">
              <strong className="text-white">{confirmDelete.name}</strong> ще бъде скрита от списъка.
              Историята на поддръжките се запазва.
            </p>
            <div className="flex gap-3 justify-end">
              <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>Откажи</button>
              <button className="btn-danger" onClick={handleDelete}>Деактивирай</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
