// Mirror of backend/src/utils/pricing.js — live preview while typing. The server recalculates on save.
const n = v => (v === '' || v === null || v === undefined || isNaN(+v) ? null : +v)

export function minArea(productType, settings = {}) {
  if (productType === 'стъклопакет') return n(settings.min_area_igu_m2) ?? 0.4
  if (productType === 'единично_стъкло') return n(settings.min_area_single_m2) ?? 0.2
  return 0
}

export function priceLine(item, settings = {}) {
  const uom = item.uom || 'm2'
  const w = n(item.width), h = n(item.height)
  const qty = n(item.qty) > 0 ? n(item.qty) : 1
  const price = n(item.unit_price)
  let area = null, rawArea = null, billed
  if (uom === 'm2') {
    if (w > 0 && h > 0) {
      rawArea = (w * h) / 1e6
      area = Math.max(rawArea, minArea(item.product_type, settings))
      billed = area * qty
    } else billed = qty
  } else if (uom === 'lm') billed = w > 0 && h > 0 ? (2 * (w + h) / 1000) * qty : qty
  else if (uom === 'pcs') billed = qty
  else billed = 1
  return {
    area, rawArea, billed,
    minApplied: rawArea !== null && area > rawArea,
    total: price === null ? null : Math.round(billed * price * 100) / 100,
  }
}

export const sumLines = (items, settings) =>
  items.reduce((s, it) => s + (priceLine(it, settings).total || 0), 0)

// ─── Glass cost (mirror of backend/src/utils/glassCost.js) — owner-only preview ───────────────
// single: price·(1+waste) + labour · double/triple: Σ glass·(1+waste) + consumables + labour
export const GLASS_KINDS = { single: 1, double: 2, triple: 3 }
export const KIND_LABELS = { single: 'Единично', double: 'Двоен пакет', triple: 'Троен пакет' }
export const KIND_TYPE = { single: 'единично_стъкло', double: 'стъклопакет', triple: 'стъклопакет' }

export const glassKey = s => String(s || '').toUpperCase().replace(/MM/g, 'ММ').replace(/\s+/g, '').replace(/ММ$/, '')

// A typed description → spec, if every part is a known glass (the spreadsheet looks glasses up by name)
export function specFromDesc(desc, glasses) {
  if (!glasses?.length || !desc) return null
  const byKey = new Map(glasses.map(g => [glassKey(g.name), g]))
  const whole = byKey.get(glassKey(desc))
  if (whole) return { kind: 'single', layers: [{ id: whole.id, waste: n(whole.waste_pct) }] }
  const parts = String(desc).split('/').map(s => s.trim()).filter(Boolean)
  if (parts.length < 2 || parts.length > 3) return null
  const found = parts.map(p => byKey.get(glassKey(p)))
  if (found.some(g => !g)) return null
  return { kind: parts.length === 2 ? 'double' : 'triple', layers: found.map(g => ({ id: g.id, waste: n(g.waste_pct) })) }
}

// Returns { rate, parts: [{ name, price, waste, value }], extras } or null when a price is missing
export function glassCost(spec, glasses, settings = {}) {
  if (!spec || !glasses?.length) return null
  const byId = new Map(glasses.map(g => [g.id, g]))
  const s = k => n(settings[k]) ?? 0
  const parts = []
  for (const l of spec.layers) {
    const g = byId.get(+l.id)
    if (!g) return null
    const price = spec.kind === 'single' ? n(g.supply_price) ?? n(g.igu_price) : n(g.igu_price) ?? n(g.supply_price)
    if (price === null) return null
    const waste = n(l.waste) ?? 0
    parts.push({ name: g.name, price, waste, value: price * (1 + waste / 100) })
  }
  const extras = spec.kind === 'single'
    ? [['труд', n(byId.get(+spec.layers[0].id)?.labor_price) ?? s('single_labor_m2')]]
    : spec.kind === 'double'
      ? [['консумативи', s('igu2_consumables_m2')], ['труд', s('igu2_labor_m2')]]
      : [['консумативи', s('igu3_consumables_m2')], ['труд', s('igu3_labor_m2')]]
  const rate = parts.reduce((a, p) => a + p.value, 0) + extras.reduce((a, [, v]) => a + v, 0)
  return { rate: Math.round(rate * 100) / 100, parts, extras }
}
