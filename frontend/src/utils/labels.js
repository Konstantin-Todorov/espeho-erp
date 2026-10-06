// Human-readable Bulgarian labels for every internal code shown in the UI.
// Use these instead of printing raw values like "единично_стъкло" or "office".
import { format, parseISO } from 'date-fns'
import { bg } from 'date-fns/locale'

export const TYPE_LABELS = {
  стъклопакет: 'Стъклопакет',
  единично_стъкло: 'Единично стъкло',
  смесена: 'Смесена',
  друго: 'Друго / услуга',
}
export const TYPE_OPTIONS = ['стъклопакет', 'единично_стъкло', 'смесена']

export const SOURCE_LABELS = {
  phone: 'Телефон', email: 'Email', office: 'На място в офиса', website: 'Уебсайт', referral: 'Препоръка', other: 'Друго',
}
export const SOURCE_OPTIONS = Object.keys(SOURCE_LABELS)

export const CATEGORY_LABELS = {
  нормална: 'Нормална продажба', гаранция: 'Гаранция / рекламация (без пари)',
  вътрешна: 'Вътрешна (за цеха)', мострена: 'Мостра',
}
export const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS)

export const FULFILLMENT_LABELS = { вземане: 'Клиентът взема', доставка: 'Доставка', монтаж: 'Монтаж' }
export const FULFILLMENT_OPTIONS = Object.keys(FULFILLMENT_LABELS)

export const INSTALL_LABELS = { ЗА_МОНТАЖ: 'Чака монтаж', МОНТИРАНА: 'Монтирана' }

export const PAYMENT_LABELS = { неплатена: 'Неплатена', частично: 'Платена частично', платена: 'Платена' }
export const PAYMENT_METHODS = ['брой', 'банка', 'карта', 'друго']

// Unit of measure for an order/quote line
export const UOM_LABELS = { m2: '€/м²', lm: '€/л.м.', pcs: '€/бр.', fixed: 'Сума' }
export const UOM_HINTS = {
  m2: 'Цена на квадратен метър — смята се по размерите (с минимална площ)',
  lm: 'Цена на линеен метър — по периметъра (кант, фасет)',
  pcs: 'Цена на брой (отвори, панти, артикули)',
  fixed: 'Фиксирана сума за реда (транспорт, монтаж)',
}

export const STATUS_HINTS = {
  НОВА: 'Приета поръчка, още не е пусната',
  МАТЕРИАЛИ: 'Чака материали / подготовка',
  ПРОИЗВОДСТВО: 'Работи се в цеха',
  ГОТОВА: 'Готова — чака клиента или доставка',
  ДОСТАВЕНА: 'Предадена на клиента',
  ОТКАЗАНА: 'Отказана / анулирана',
}
export const STATUS_ACTIONS = {
  МАТЕРИАЛИ: 'Изпрати за материали',
  ПРОИЗВОДСТВО: 'Пусни в производство',
  ГОТОВА: 'Маркирай като готова',
  ДОСТАВЕНА: 'Предадена на клиента',
  НОВА: 'Върни като нова',
  ОТКАЗАНА: 'Откажи поръчката',
}

// Order number as staff know it: the office number (326-00160) if there is one, else #123
export const orderNo = o => (o?.external_ref ? o.external_ref : `#${o?.order_number ?? ''}`)

export const eur = (v, { dash = true } = {}) => {
  if (v === null || v === undefined || v === '' || (dash && Number(v) === 0)) return dash ? '—' : '0,00 €'
  return `${Number(v).toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
}
// Whole euros for big summary figures (527 827 €)
export const eurRound = v =>
  v === null || v === undefined || v === '' ? '—' : `${Math.round(Number(v)).toLocaleString('bg-BG')} €`

export const num = (v, digits = 2) =>
  v === null || v === undefined || v === '' ? '—'
    : Number(v).toLocaleString('bg-BG', { minimumFractionDigits: 0, maximumFractionDigits: digits })

export const dateBg = (v, pattern = 'd MMM yyyy') => {
  if (!v) return '—'
  try { return format(typeof v === 'string' ? parseISO(v) : v, pattern, { locale: bg }) } catch { return '—' }
}

// Today as 'YYYY-MM-DD' in local time (for comparing with DATE columns)
export const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export const isOverdue = o =>
  !!o?.deadline && String(o.deadline).slice(0, 10) < todayStr() && !['ГОТОВА', 'ДОСТАВЕНА', 'ОТКАЗАНА'].includes(o.status)
