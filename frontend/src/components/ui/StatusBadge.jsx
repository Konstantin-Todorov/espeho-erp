const ORDER_STATUS = {
  'НОВА':         { color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
  'МАТЕРИАЛИ':    { color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
  'ПРОИЗВОДСТВО': { color: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' },
  'ГОТОВА':       { color: 'bg-green-500/20 text-green-400 border border-green-500/30' },
  'ДОСТАВЕНА':    { color: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' },
  'ОТКАЗАНА':     { color: 'bg-red-500/20 text-red-400 border border-red-500/30' },
}

const PAYMENT_STATUS = {
  'неплатена': { color: 'bg-red-500/20 text-red-400 border border-red-500/30',      label: 'Неплатена' },
  'частично':  { color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30', label: 'Частично' },
  'платена':   { color: 'bg-green-500/20 text-green-400 border border-green-500/30', label: 'Платена' },
}

const CATEGORY_LABELS = {
  'нормална':  'Нормална',
  'гаранция':  'Гаранция',
  'вътрешна':  'Вътрешна',
  'мострена':  'Мострена',
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

export function PaymentStatusBadge({ status }) {
  const s = PAYMENT_STATUS[status] || { color: 'bg-gray-500/20 text-gray-400', label: status }
  return <span className={`badge ${s.color}`}>{s.label}</span>
}

export function CategoryBadge({ category }) {
  if (!category || category === 'нормална') return null
  const colors = {
    'гаранция': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    'вътрешна': 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    'мострена': 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
  }
  return <span className={`badge ${colors[category] || 'bg-gray-500/20 text-gray-400'}`}>{CATEGORY_LABELS[category] || category}</span>
}

export function StageStatusBadge({ status }) {
  const s = STAGE_STATUS[status] || { color: 'bg-gray-500/20 text-gray-400' }
  const labels = { 'ЧАКАЩ':'Чакащ', 'В_ПРОЦЕС':'В процес', 'ГОТОВ':'Готов', 'ПРОПУСНАТ':'Пропуснат' }
  return <span className={`badge ${s.color}`}>{labels[status] || status}</span>
}

export function UrgentBadge() {
  return <span className="badge bg-red-500/20 text-red-400 border border-red-500/30 gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-danger" />Спешна</span>
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
