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
