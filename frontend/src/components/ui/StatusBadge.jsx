const ORDER_STATUS = {
  'НОВА':         { color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
  'МАТЕРИАЛИ':    { color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
  'ПРОИЗВОДСТВО': { color: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' },
  'ГОТОВА':       { color: 'bg-green-500/20 text-green-400 border border-green-500/30' },
  'ДОСТАВЕНА':    { color: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' },
  'ОТКАЗАНА':     { color: 'bg-red-500/20 text-red-400 border border-red-500/30' },
}

const STAGE_STATUS = {
  'ЧАКАЩ':    { color: 'bg-gray-500/20 text-gray-400' },
  'В_ПРОЦЕС': { color: 'bg-orange-500/20 text-orange-400' },
  'ГОТОВ':    { color: 'bg-green-500/20 text-green-400' },
  'ПРОПУСНАТ':{ color: 'bg-gray-600/20 text-gray-500' },
}

export function OrderStatusBadge({ status }) {
  const s = ORDER_STATUS[status] || { color: 'bg-gray-500/20 text-gray-400' }
  return <span className={`badge ${s.color}`}>{status}</span>
}

export function StageStatusBadge({ status }) {
  const s = STAGE_STATUS[status] || { color: 'bg-gray-500/20 text-gray-400' }
  const labels = { 'ЧАКАЩ':'Чакащ', 'В_ПРОЦЕС':'В процес', 'ГОТОВ':'Готов', 'ПРОПУСНАТ':'Пропуснат' }
  return <span className={`badge ${s.color}`}>{labels[status] || status}</span>
}

export function UrgentBadge() {
  return <span className="badge bg-red-500/20 text-red-400 border border-red-500/30">🔴 Спешна</span>
}

export function RoleBadge({ role }) {
  const roles = {
    admin:      { label: 'Администратор', color: 'bg-purple-500/20 text-purple-400' },
    office:     { label: 'Офис',           color: 'bg-blue-500/20 text-blue-400' },
    production: { label: 'Производство',   color: 'bg-orange-500/20 text-orange-400' },
    warehouse:  { label: 'Склад',          color: 'bg-yellow-500/20 text-yellow-400' },
  }
  const r = roles[role] || { label: role, color: 'bg-gray-500/20 text-gray-400' }
  return <span className={`badge ${r.color}`}>{r.label}</span>
}
