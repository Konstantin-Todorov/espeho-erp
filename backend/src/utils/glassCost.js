// Line cost the way the office spreadsheet computes column СЕБЕСТОЙНОСТ (€/m², without VAT):
//   single pane:  price·(1 + waste) + labour
//   double unit:  glass1·(1 + w1) + glass2·(1 + w2) + consumables + labour     (settings igu2_*)
//   triple unit:  Σ glass·(1 + w) + consumables + labour                      (settings igu3_*)
// Glass prices live in glass_types (Каталог → Стъкла). The spreadsheet looks a glass up by its name,
// so a typed description such as „БЯЛО 4ММ/БЯЛО 4ММ“ is matched against the list the same way.
const pool = require('../db/pool');
const { n, round } = require('./pricing');

const KINDS = { single: 1, double: 2, triple: 3 };

// Name key that ignores spacing, case and a trailing „ММ“ („БЯЛО 4 мм“ = „БЯЛО 4ММ“ = „бяло 4“)
const glassKey = s => String(s || '').toUpperCase().replace(/MM/g, 'ММ').replace(/\s+/g, '').replace(/ММ$/, '');

let cache = null, cacheAt = 0;
async function loadGlass(db = pool) {
  if (cache && Date.now() - cacheAt < 30_000) return cache;
  const { rows } = await db.query('SELECT * FROM glass_types WHERE active');
  cache = { byId: new Map(rows.map(g => [g.id, g])), byKey: new Map(rows.map(g => [glassKey(g.name), g])) };
  cacheAt = Date.now();
  return cache;
}
const invalidateGlass = () => { cache = null; };

// Parse a description into a spec, if every part is a known glass. Whole name first —
// some single glasses contain „/“ themselves („БРОНЗЕ/СИВО/ЗЕЛЕНО 4ММ“).
function specFromDesc(desc, glass) {
  const whole = glass.byKey.get(glassKey(desc));
  if (whole) return { kind: 'single', layers: [{ id: whole.id, waste: n(whole.waste_pct) }] };
  const parts = String(desc || '').split('/').map(s => s.trim()).filter(Boolean);
  if (parts.length < 2 || parts.length > 3) return null;
  const found = parts.map(p => glass.byKey.get(glassKey(p)));
  if (found.some(g => !g)) return null;
  return { kind: parts.length === 2 ? 'double' : 'triple', layers: found.map(g => ({ id: g.id, waste: n(g.waste_pct) })) };
}

// Clean a spec coming from the client: known kind, right number of known glasses, sane waste.
function normalizeSpec(spec, glass) {
  if (!spec || typeof spec !== 'object' || !KINDS[spec.kind] || !Array.isArray(spec.layers)) return null;
  const layers = spec.layers.slice(0, KINDS[spec.kind]).map(l => {
    const g = glass.byId.get(+l?.id);
    if (!g) return null;
    const w = n(l.waste);
    return { id: g.id, waste: w === null || w < 0 || w > 100 ? n(g.waste_pct) : w };
  });
  if (layers.length !== KINDS[spec.kind] || layers.some(l => !l)) return null;
  return { kind: spec.kind, layers };
}

// €/m² cost for a spec (null if a price is missing)
function costFromSpec(spec, glass, settings) {
  const s = k => n(settings[k]) ?? 0;
  const parts = spec.layers.map(l => ({ g: glass.byId.get(l.id), w: (n(l.waste) ?? 0) / 100 }));
  if (parts.some(p => !p.g)) return null;
  if (spec.kind === 'single') {
    const { g, w } = parts[0];
    const price = n(g.supply_price) ?? n(g.igu_price);
    if (price === null) return null;
    return round(price * (1 + w) + (n(g.labor_price) ?? s('single_labor_m2')));
  }
  const prices = parts.map(({ g, w }) => { const p = n(g.igu_price) ?? n(g.supply_price); return p === null ? null : p * (1 + w) })
  if (prices.some(p => p === null)) return null;
  const pre = spec.kind === 'double' ? 'igu2' : 'igu3';
  return round(prices.reduce((a, b) => a + b, 0) + s(`${pre}_consumables_m2`) + s(`${pre}_labor_m2`));
}

// Description in the spreadsheet's own naming: „БЯЛО 4ММ/БЯЛО 4ММ“
const descFromSpec = (spec, glass) => spec.layers.map(l => glass.byId.get(l.id)?.name).join('/');

// Decide the cost of one item. Priority: owner's manual €/m² → stack chosen in the builder →
// description matching the glass list → catalog cost for that name. Returns { cost_rate, glass_spec }.
async function resolveCost(db, item, settings, { allowManual = false } = {}) {
  if (allowManual && item.cost_rate !== undefined && item.cost_rate !== '' && item.cost_rate !== null && n(item.cost_rate) !== null) {
    return { cost_rate: round(n(item.cost_rate)), glass_spec: item.glass_spec && typeof item.glass_spec === 'object' ? item.glass_spec : null };
  }
  const glass = await loadGlass(db);
  const spec = normalizeSpec(item.glass_spec, glass) || specFromDesc(item.product_desc, glass);
  if (spec) return { cost_rate: costFromSpec(spec, glass, settings), glass_spec: spec };
  const { rows: [t] } = await db.query(
    'SELECT unit_price FROM product_templates WHERE active AND unit_price > 0 AND UPPER(name) = UPPER($1) LIMIT 1',
    [String(item.product_desc || '').trim()]);
  return { cost_rate: t ? n(t.unit_price) : null, glass_spec: null };
}

const lineCost = (costRate, billedQty) => (costRate === null || billedQty === null ? null : round(costRate * billedQty));

module.exports = { glassKey, loadGlass, invalidateGlass, specFromDesc, normalizeSpec, costFromSpec, descFromSpec, resolveCost, lineCost };
