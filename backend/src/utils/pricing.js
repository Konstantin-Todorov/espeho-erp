// Line pricing shared by orders and quotations. Prices are WITH VAT (as in the office spreadsheet).
//   m2    — €/m²: area = width × height (mm) / 1 000 000, raised to the minimum billable area per pane
//   lm    — €/linear metre: perimeter 2 × (width + height) / 1000 (edging, bevelling)
//   pcs   — €/piece (holes, hinges, resale goods)
//   fixed — flat amount for the line (transport, installation)
const pool = require('../db/pool');

let cache = null, cacheAt = 0;

async function getSettings() {
  if (cache && Date.now() - cacheAt < 30_000) return cache;
  const { rows } = await pool.query('SELECT key, value FROM app_settings');
  cache = Object.fromEntries(rows.map(r => [r.key, r.value]));
  cacheAt = Date.now();
  return cache;
}
const invalidateSettings = () => { cache = null; };

const n = v => (v === '' || v === null || v === undefined || isNaN(+v) ? null : +v);
const round = (v, d = 2) => (v === null ? null : Math.round(v * 10 ** d) / 10 ** d);

function minArea(productType, settings) {
  if (productType === 'стъклопакет') return n(settings.min_area_igu_m2) ?? 0.4;
  if (productType === 'единично_стъкло') return n(settings.min_area_single_m2) ?? 0.2;
  return 0;
}

// Returns the derived fields for one item: uom, area_m2 (billable, per piece), billed_qty, line_total.
function priceLine(item, settings) {
  const uom = ['m2', 'lm', 'pcs', 'fixed'].includes(item.uom) ? item.uom : 'm2';
  const w = n(item.width), h = n(item.height);
  const qty = n(item.qty) && n(item.qty) > 0 ? n(item.qty) : 1;
  const price = n(item.unit_price);
  let area = null, billed;

  if (uom === 'm2') {
    if (w > 0 && h > 0) {
      area = Math.max((w * h) / 1e6, minArea(item.product_type, settings));
      billed = area * qty;
    } else {
      billed = qty; // no size given — treat the price as per piece rather than silently 0
    }
  } else if (uom === 'lm') {
    billed = w > 0 && h > 0 ? (2 * (w + h) / 1000) * qty : qty;
  } else if (uom === 'pcs') {
    billed = qty;
  } else {
    billed = 1;
  }

  return {
    uom,
    qty,
    area_m2: round(area, 4),
    billed_qty: round(billed, 4),
    line_total: price === null ? null : round(billed * price, 2),
  };
}

const sumLines = items => round(items.reduce((s, it) => s + (n(it.line_total) || 0), 0), 2);

module.exports = { getSettings, invalidateSettings, priceLine, sumLines, n, round };
